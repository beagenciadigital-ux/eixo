import i18next from "i18next";
import path from "node:path";
import fs from "node:fs";

// Resolve locales directory for both ts-node (src) and compiled build (build)
const candidateLocaleDirs = [
	path.join(__dirname, "./locales"),
	path.join(__dirname, "../../src/config/locales"),
	path.join(process.cwd(), "build/config/locales"),
	path.join(process.cwd(), "src/config/locales"),
	path.join(process.cwd(), "src/server/config/locales"),
];

const resolvedLocalesDir =
	candidateLocaleDirs.find((dir) => {
		try {
			return fs.existsSync(dir);
		} catch {
			return false;
		}
	}) || candidateLocaleDirs[0];

/** Sync load — avoids missing strings when translate() runs before async fs-backend finishes (shows raw keys like turns.productionResource). */
function buildResources(): Record<
	string,
	Record<string, Record<string, unknown>>
> {
	const lngs = ["en", "es", "pt"] as const;
	const nss = ["errors", "responses"] as const;
	const resources: Record<string, Record<string, Record<string, unknown>>> =
		{};
	for (const lng of lngs) {
		resources[lng] = {};
		for (const ns of nss) {
			const filePath = path.join(resolvedLocalesDir, lng, `${ns}.json`);
			const raw = fs.readFileSync(filePath, "utf8");
			resources[lng][ns] = JSON.parse(raw) as Record<string, unknown>;
		}
	}
	return resources;
}

const resources = buildResources();

void i18next.init({
	resources,
	fallbackLng: (code: string | undefined) => {
		if (code === "en") return ["en"];
		if (code === "es") return ["es", "en"];
		if (code === "pt") return ["pt", "en"];
		return ["pt", "en"];
	},
	supportedLngs: ["en", "es", "pt"],
	ns: ["errors", "responses"],
	defaultNS: "errors",
	interpolation: {
		escapeValue: false,
	},
});

export default i18next;
