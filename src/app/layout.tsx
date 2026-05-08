import type { Metadata } from "next";
import { ClientProviders } from "./providers";
import "./globals.css";
import "@/game/index.css";

export const metadata: Metadata = {
	title: "Eixo do Mal",
	description: "Jogo de estratégia por turnos",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body>
				<ClientProviders>{children}</ClientProviders>
			</body>
		</html>
	);
}
