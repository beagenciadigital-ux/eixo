import type { Request, Response } from "express";
import { Router } from "express";
import { validate, isEmpty } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import cookie from "cookie";
import auth from "../middleware/auth";
import user from "../middleware/user";
import { getUserRepo, getSessionRepo, getResetTokenRepo } from "@/lib/db";
import { makeId } from "../util/helpers";
import { sendSESEmail } from "../util/mail";
import { translate, sendError } from "../util/translation";
import { language } from "../middleware/language";
import { CONTACT_EMAIL } from "../config/oldConifg";

const cookieDomain =
	process.env.NODE_ENV === "production"
		? process.env.COOKIE_DOMAIN || ""
		: "";

const mapErrors = (errors: Object[]) => {
	return errors.reduce((prev: any, err: any) => {
		prev[err.property] = Object.entries(err.constraints)[0][1];
		return prev;
	}, {});
};

const register = async (req: Request, res: Response) => {
	const { email, username, password } = req.body;
	const language = res.locals.language;

	const empires = [];
	let errors: any = {};

	const emailUser = await getUserRepo().findOne({ email });
	const usernameUser = await getUserRepo().findOne({ username });

	if (emailUser)
		errors.email = translate("errors.auth.emailAlreadyInUse", language);
	if (usernameUser)
		errors.username = translate("errors.auth.usernameAlreadyTaken", language);

	console.log(errors);
	if (Object.keys(errors).length > 0) {
		return res.status(409).json(errors);
	}

	// Create the user
	const user = getUserRepo().create({ email, username, password, empires });

	errors = await validate(user);

	if (errors.length > 0) {
		return res.status(400).json(mapErrors(errors));
	}
	await getUserRepo().save(user);

	// Return the user
	return res.json(user);
};

const login = async (req: Request, res: Response) => {
	const { username, password, stayLoggedIn } = req.body;
	const language = res.locals.language;

	if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
		console.error(
			"[auth/login] JWT_SECRET is missing or empty — set it in EasyPanel / env (see .env.example)",
		);
		return sendError(res, 500)("generic", language);
	}

	// console.log(username, password)
	try {
		let errors: any = {};
		if (isEmpty(username))
			errors.username = translate("errors.auth.usernameEmpty", language);
		if (isEmpty(password))
			errors.password = translate("errors.auth.passwordEmpty", language);
		if (Object.keys(errors).length > 0) {
			return res.status(400).json(errors);
		}

		const user = await getUserRepo().findOne(
			{ username },
			{ relations: ["empires"] },
		);
		// console.log(user)

		if (!user) return sendError(res, 404)("auth.userNotFound", language);

		if (
			typeof user.password !== "string" ||
			!user.password.startsWith("$2")
		) {
			console.error(
				"[auth/login] stored password is not a bcrypt hash for user:",
				username,
			);
			return sendError(res, 500)("generic", language);
		}

		const passwordMatches = await bcrypt.compare(password, user.password);

		if (!passwordMatches) {
			return sendError(res, 401)("auth.passwordIncorrect", language);
		}

		const token = jwt.sign({ username }, process.env.JWT_SECRET);

		// const data = token
		let time = 3600;
		if (stayLoggedIn === "1 day") {
			time = 86400;
		} else if (stayLoggedIn === "1 week") {
			time = 604800;
		} else if (stayLoggedIn === "1 month") {
			time = 2678400;
		} else if (stayLoggedIn === "6 months") {
			time = 15552000;
		}
		// console.log(token)
		try {
			res.set(
				"Set-Cookie",
				cookie.serialize("token", token, {
					// httpOnly: true,
					domain:
						cookieDomain,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: time,
					path: "/",
				}),
			);
		} catch (error) {
			console.log(error);
		}

		// const session = new Session()
		// session.data = data
		// session.time = time
		// session.user_id = user.id
		// if (user?.empires?.length > 0) {
		// 	session.empire_id = user.empires[0].id
		// }
		// session.role = 'user'
		// await session.save()

		user.lastIp =
			<string>req.connection.remoteAddress ||
			<string>req.headers["x-forwarded-for"];

		await getUserRepo().save(user);

		return res.json(user);
	} catch (err) {
		console.error("[auth/login] unexpected error:", err);
		return sendError(res, 500)("generic", language);
	}
};

const me = (_: Request, res: Response) => {
	return res.json(res.locals.user);
};

const logout = async (_: Request, res: Response) => {
	res.set(
		"Set-Cookie",
		cookie.serialize("token", "", {
			// httpOnly: true,
			domain: cookieDomain,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			expires: new Date(0),
			path: "/",
		}),
	);

	// const session = await Session.findOne({ user_id: res.locals.user.id })

	// session.time = 0
	// await session.save()

	return res.status(200).json({ success: true });
};

const demoAccount = async (req: Request, res: Response) => {
	const empires = [];
	const language = res.locals.language;

	let ip = Array.isArray(req.headers["x-forwarded-for"])
		? req.headers["x-forwarded-for"][0]
		: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";

	console.log(req.headers["x-forwarded-for"]);
	console.log(ip);

	// process ip address or headers
	if (ip === "::1") {
		ip = "localhost";
	} else if (ip.includes(",")) {
		ip = ip.split(",")[0];
	} else if (ip.length > 15 && ip.split(":").length === 8) {
		let ipArr = ip.split(":");
		ipArr.splice(ipArr.length / 2, ipArr.length);
		ip = ipArr.join(".");
	} else if (ip.includes("::")) {
		ip = ip.split("::")[1];
	} else if (ip.length <= 15 && ip.includes(".")) {
		let ipArr = ip.split(".");
		if (ipArr.length === 4) {
			ip = ipArr.join(".");
		} else {
			ip = "";
		}
	} else {
		ip = "";
	}

	console.log(ip);
	if (ip === "" || ip === undefined) {
		console.error("No IP address");
		return sendError(res, 400)("auth.ipError", language);
	}

	const addOn = new Date().getDay();

	const email = ip + addOn + "@demo.com";
	const username = ip + addOn;
	const password = "none";
	const role = "demo";

	// console.log(username)

	try {
		// Validate Data
		let errors: any = {};

		if (Object.keys(errors).length > 0) {
			return res.status(400).json(errors);
		}

		// Create the user
		const user = getUserRepo().create({ email, username, password, role, empires });

		errors = await validate(user);

		console.log(errors);
		if (errors.length > 0) {
			return res.status(400).json(mapErrors(errors));
		}
		await getUserRepo().save(user);

		// console.log(user)
		const token = jwt.sign({ username }, process.env.JWT_SECRET!);

		const data = token;
		const time = 3600;
		// console.log(token)
		res.set(
			"Set-Cookie",
			cookie.serialize("token", token, {
				// httpOnly: true,
				domain:
					cookieDomain,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: time,
				path: "/",
			}),
		);

		const session = getSessionRepo().create({
			data,
			time,
			user_id: user.id,
			empire_id: user?.empires?.length > 0 ? user.empires[0].id : 0,
			role,
		});
		await getSessionRepo().save(session);

		// Return the user
		return res.json(user);
	} catch (err) {
		console.log(err.code);
		if (err.code === "23505" || err.code === "23514" || err.code === "23502") {
			return sendError(res, 500)("auth.demoError", language);
		}
	}
};

const createDemoToken = async (req: Request, res: Response) => {
	const username = "demoLoginLink";
	const issuer = "rebornpromisance.com";
	const expiration = new Date(Date.now() + 3600);
	const secret = process.env.LINK_SECRET;

	const token = jwt.sign(
		{ username, issuer, expiration, secret },
		process.env.LINK_SECRET!,
	);

	console.log(token);
	return res.json({ token });
};

const loginFromLink = async (req: Request, res: Response) => {
	const { token } = req.params;
	console.log(token);
	const language = res.locals.language;

	if (!token) {
		return sendError(res, 400)("auth.invalidToken", language);
	}

	let errors: any = {};

	try {
		const decoded = jwt.verify(token, process.env.LINK_SECRET!) as JwtPayload;
		if (typeof decoded === "object" && decoded !== null) {
			const { username, issuer, expiration, secret } = decoded as {
				username: string;
				issuer: string;
				expiration: Date;
				secret: string;
			};
			console.log({ username, issuer, expiration, secret });
		} else {
			return sendError(res, 400)("auth.invalidToken", language);
		}

		if (decoded.issuer !== "rebornpromisance.com") {
			return sendError(res, 400)("auth.invalidToken", language);
		}

		if (decoded.expiration < new Date()) {
			return sendError(res, 400)("auth.tokenExpired", language);
		}

		if (decoded.secret !== process.env.LINK_SECRET) {
			return sendError(res, 400)("auth.invalidToken", language);
		}

		const user = await getUserRepo().findOne(
			{ username: decoded.username },
			{ relations: ["empires"] },
		);

		if (!user) {
			console.log("creating user");
			const username = decoded.username;
			// create a user
			const user = getUserRepo().create({
				username,
				password: makeId(10),
				email: `${username}@eixo.link`,
				role: "user",
				method: "link",
				empires: [],
			});

			errors = await validate(user);

			if (errors.length > 0) {
				return res.status(400).json(mapErrors(errors));
			}

			console.log("saving user");
			await getUserRepo().save(user);

			console.log("logging in user");
			const token = jwt.sign({ username }, process.env.JWT_SECRET!);

			const data = token;
			const time = 3600;
			// console.log(token)
			res.set(
				"Set-Cookie",
				cookie.serialize("token", token, {
					// httpOnly: true,
					domain:
						cookieDomain,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: time,
					path: "/",
				}),
			);

			const session = getSessionRepo().create({
				data,
				time,
				user_id: user.id,
				empire_id: user?.empires?.length > 0 ? user.empires[0].id : 0,
				role: "user",
			});
			await getSessionRepo().save(session);

			console.log("returning user");
			return res.json(user);
		}

		if (user) {
			console.log("user found");
			console.log("logging in user");
			const username = user.username;
			const token = jwt.sign({ username }, process.env.JWT_SECRET!);

			const data = token;
			const time = 3600;
			// console.log(token)
			res.set(
				"Set-Cookie",
				cookie.serialize("token", token, {
					// httpOnly: true,
					domain:
						cookieDomain,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: time,
					path: "/",
				}),
			);

			const session = getSessionRepo().create({
				data,
				time,
				user_id: user.id,
				empire_id: user?.empires?.length > 0 ? user.empires[0].id : 0,
				role: "user",
			});
			await getSessionRepo().save(session);

			console.log("returning user");
			return res.json(user);
		}
	} catch (err) {
		console.log(err);
		return res.status(400).json({
			error: translate("errors:generic", language),
		});
	}
};

const forgotPassword = async (req: Request, res: Response) => {
	const { email } = req.body;
	const origin = req.headers.origin;
	const language = res.locals.language;
	// console.log(origin)

	try {
		const user = await getUserRepo().findOne({ email });

		if (!user) {
			return sendError(res, 400)("auth.emailNotFound", language);
		}

		const token = makeId(40);

		const selector = token.slice(0, 18);
		let validator = token.slice(18);
		validator = await bcrypt.hash(validator, 6);

		const resetToken = getResetTokenRepo().create({
			email,
			selector,
			verifier: validator,
			expiredAt: new Date(Date.now() + 3600000),
		});
		await getResetTokenRepo().save(resetToken);

		const link = `${origin}/reset-password/${token}`;
		const text = translate("responses:auth.passwordResetEmailText", language, {
			link,
			username: user.username,
		});
		const html = translate("responses:auth.passwordResetEmailHtml", language, {
			link,
			username: user.username,
		});

		await sendSESEmail(
			email,
			process.env.MAIL_FROM || CONTACT_EMAIL,
			translate("responses:auth.emailSubject", language),
			text,
			html,
		);

		return res.json({
			message: translate("responses:auth.emailSent", language),
		});
	} catch (err) {
		console.log(err);
		return sendError(res, 500)("generic", language);
	}
};

const confirmToken = async (req: Request, res: Response) => {
	const { token, password } = req.body;
	let language = res.locals.language;

	if (!language) {
		language = "en";
	}

	try {
		const resetToken = await getResetTokenRepo().findOne({
			selector: token.slice(0, 18),
		});

		if (!resetToken) {
			return sendError(res, 400)("generic", language);
		}

		const isValid = await bcrypt.compare(token.slice(18), resetToken.verifier);

		if (resetToken.expiredAt < new Date()) {
			return sendError(res, 400)("auth.tokenExpired", language);
		}

		// console.log(isValid)
		if (!isValid) {
			return sendError(res, 400)("generic", language);
		}

		const user = await getUserRepo().findOne({ email: resetToken.email });

		if (!user) {
			return sendError(res, 400)("auth.userNotFound", language);
		}

		user.password = await bcrypt.hash(password, 6);
		await getUserRepo().save(user);
		await getResetTokenRepo().remove(resetToken);
		return res.json({ message: translate("responses:auth.success", language) });
	} catch (err) {
		console.log(err);
		return sendError(res, 500)("generic", language);
	}
};

const forgotUsername = async (req: Request, res: Response) => {
	const { email } = req.body;
	const language = res.locals.language;
	try {
		const user = await getUserRepo().findOne({ email });

		if (!user) {
			return sendError(res, 400)("auth.emailNotFound", language);
		}

		const text = translate("responses:auth.forgotUsername", language, {
			username: user.username,
		});

		return res.json({ message: text });
	} catch (err) {
		console.log(err);
		return sendError(res, 500)("generic", language);
	}
};

const router = Router();
router.get("/login-from-link/:token", language, loginFromLink);
// router.get("/demo-token", createDemoToken);
router.post("/register", language, register);
router.post("/demo", language, demoAccount);
router.post("/login", language, login);
router.get("/me", user, auth, me);
router.get("/logout", user, auth, logout);
router.post("/forgot-password", language, forgotPassword);
router.post("/confirm-token", language, confirmToken);
router.post("/forgot-username", language, forgotUsername);

export default router;
