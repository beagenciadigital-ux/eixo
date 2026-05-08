"use client";

import "@/game/config/setupClientApi";
import React, { StrictMode, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import { store, persistor } from "@/game/store/store";

export function ClientProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		if (process.env.NODE_ENV === "production") {
			void import("@vercel/analytics").then(({ inject }) => inject());
		}
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
						{children}
					</BrowserRouter>
				</PersistGate>
			</Provider>
		</StrictMode>
	);
}
