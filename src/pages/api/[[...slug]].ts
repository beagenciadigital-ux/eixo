import "reflect-metadata";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Express } from "express";

export const config = {
	maxDuration: 300,
	api: {
		bodyParser: false,
		externalResolver: true,
	},
};

let apiAppPromise: Promise<Express> | null = null;

function getApiAppLazy(): Promise<Express> {
	if (!apiAppPromise) {
		apiAppPromise = import("@/server/createApp").then((m) => m.getApiApp());
	}
	return apiAppPromise;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const apiApp = await getApiAppLazy();
	return apiApp(req, res);
}
