import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16+: interceção antes das rotas (antigo `middleware.ts`).
 * Runtime: Node.js (não Edge). Evita importar `@/server` ou DB aqui.
 */
export function proxy(request: NextRequest) {
	const response = NextResponse.next({
		request: { headers: request.headers },
	});

	// Cabeçalhos leves para páginas / RSC; API fica de fora do matcher.
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	return response;
}

export const config = {
	matcher: [
		/*
		 * Páginas e dados do app; exclui API monólito, estáticos Next e metadados comuns.
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.(?:ico|svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
	],
};
