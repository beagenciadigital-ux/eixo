/**
 * API base path or full URL ending with `/api` (no trailing slash after `api`).
 * Monólito Next: por defeito `/api` no browser. Override com NEXT_PUBLIC_API_ORIGIN (origem sem path, ex. https://api.exemplo.com).
 */
export function getApiOrigin() {
	if (typeof window !== "undefined") {
		const o = process.env.NEXT_PUBLIC_API_ORIGIN;
		if (o) {
			return o.replace(/\/$/, "");
		}
		return "";
	}
	const o = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3000";
	return o.replace(/\/$/, "");
}

export function getApiBaseUrl() {
	const origin = getApiOrigin();
	if (origin === "") {
		return "/api";
	}
	return `${origin}/api`;
}

/** Use with GET /auth/me so 401 (no session) does not throw — expected when visiting logged-out. */
export const axiosSessionCheckConfig = {
	validateStatus: (status) => status === 200 || status === 401,
}
