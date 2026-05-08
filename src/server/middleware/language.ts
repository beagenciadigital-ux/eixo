export const language = (req, res, next) => {
	const raw =
		req.headers["accept-language"]?.split(",")[0] ||
		req.query.lang ||
		"pt-BR";
	const lang = raw.split(";")[0].trim();
	const lower = lang.toLowerCase();
	// Server JSON lives under src/server/config/locales/pt/ (not pt-BR).
	res.locals.language = lower.startsWith("pt") ? "pt" : lang.substring(0, 2);
	next();
};
