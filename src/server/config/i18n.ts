import i18next from "i18next";
import Backend from "i18next-fs-backend";
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

const resolvedLocalesDir = candidateLocaleDirs.find((dir) => {
    try {
        return fs.existsSync(dir);
    } catch {
        return false;
    }
}) || candidateLocaleDirs[0];

const i18nConfig = {
    backend: {
        loadPath: path.join(resolvedLocalesDir, "{{lng}}/{{ns}}.json"),
    },
    fallbackLng: (code: string | undefined) => {
      if (code === "en") return ["en"];
      if (code === "es") return ["es", "en"];
      if (code === "pt") return ["pt", "en"];
      return ["pt", "en"];
    },
    ns: ["errors", "responses"],
    interpolation: {
        escapeValue: false,
    },
};

i18next.use(Backend).init(i18nConfig);

export default i18next;
