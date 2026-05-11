import i18next from "i18next";

import enErrors from "./locales/en/errors.json";
import enResponses from "./locales/en/responses.json";
import esErrors from "./locales/es/errors.json";
import esResponses from "./locales/es/responses.json";
import ptErrors from "./locales/pt/errors.json";
import ptResponses from "./locales/pt/responses.json";

/**
 * Bundled at build time — works in Next standalone/Docker where runtime `fs` paths
 * to `src/server/config/locales` often do not exist (was causing 500 on auth/login).
 */
const resources = {
	en: {
		errors: enErrors as Record<string, unknown>,
		responses: enResponses as Record<string, unknown>,
	},
	es: {
		errors: esErrors as Record<string, unknown>,
		responses: esResponses as Record<string, unknown>,
	},
	pt: {
		errors: ptErrors as Record<string, unknown>,
		responses: ptResponses as Record<string, unknown>,
	},
};

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
