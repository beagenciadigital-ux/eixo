import i18next from "../config/i18n";

/** API locales use `pt` (folder); middleware may still pass variants — normalize so t() resolves. */
export function normalizeServerLanguage(language: string | undefined): string {
	if (language == null || language === "") return "pt";
	const lower = language.toLowerCase();
	if (lower.startsWith("pt")) return "pt";
	if (lower.startsWith("es")) return "es";
	if (lower.startsWith("en")) return "en";
	return language.length >= 2 ? language.substring(0, 2) : "pt";
}

export const translate = (
	key: string,
	language: string,
	variables?: Record<string, any>,
) => {
	const lng = normalizeServerLanguage(language);
	return i18next.t(key, { lng, ...variables });
};

const createErrorResponse = (
	key: string,
	language: string,
	variables?: Record<string, any>,
) => {
	return {
		error: translate(`errors:${key}`, language, variables),
	};
};

export const sendError =
	(res: any, status: number) =>
	(key: string, language: any, variables?: Record<string, any>) => {
		return res
			.status(status)
			.json(createErrorResponse(key, language, variables));
	};
