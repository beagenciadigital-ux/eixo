"use client";

import "@/game/config/setupClientApi";
import React, { StrictMode, useEffect, useLayoutEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
	BrowserRouter,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { store, persistor } from "@/game/store/store";

/**
 * Rotas legadas usam espaços no segmento (ex.: "Magic Center"). O pathname da
 * barra de endereços pode vir percent-encoded (%20); o React Router faz match
 * literal, por isso normalizamos para o path decodificado.
 */
function NormalizeEncodedPathname({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const navigate = useNavigate();

	useLayoutEffect(() => {
		let decoded: string;
		try {
			decoded = decodeURI(location.pathname);
		} catch {
			return;
		}
		if (decoded === location.pathname) return;
		navigate(
			{
				pathname: decoded,
				search: location.search,
				hash: location.hash,
			},
			{ replace: true },
		);
	}, [location.pathname, location.search, location.hash, navigate]);

	return <>{children}</>;
}

export function ClientProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		if (process.env.NODE_ENV !== "production") return;
		const explicit =
			process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "1";
		const host =
			typeof window !== "undefined" ? window.location.hostname : "";
		const onVercel =
			host === "vercel.app" || host.endsWith(".vercel.app");
		if (!explicit && !onVercel) return;
		void import("@vercel/analytics").then(({ inject }) => inject());
	}, []);

	return (
		<StrictMode>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<BrowserRouter
						future={{
							v7_startTransition: true,
							v7_relativeSplatPath: true,
						}}
					>
						<NormalizeEncodedPathname>{children}</NormalizeEncodedPathname>
					</BrowserRouter>
				</PersistGate>
			</Provider>
		</StrictMode>
	);
}
