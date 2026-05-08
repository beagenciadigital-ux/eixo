"use client";

import dynamic from "next/dynamic";

const RootRoutes = dynamic(() => import("@/game/RootRoutes"), {
	ssr: false,
	loading: () => null,
});

export default function CatchAllPage() {
	return <RootRoutes />;
}
