import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import {
	aidCredits,
	cleanDemoAccounts,
	hourlyUpdate,
	promTurns,
	snapshot,
	thirtyMinUpdate,
} from "./jobs/promTurns";
import {
	ROUND_START,
	ROUND_END,
	AID_DELAY,
} from "./config/oldConifg";
import { ensureDb } from "@/lib/db";

function checkTime() {
	const now = new Date().getTime();
	return (
		now > new Date(ROUND_START).getTime() &&
		now < new Date(ROUND_END).getTime()
	);
}

export async function startDevScheduler(): Promise<void> {
	await ensureDb();

	let gameOn = checkTime();
	console.log("[dev scheduler] game window active:", gameOn);

	const checkTimeTask = new AsyncTask("check time", async () => {
		const now = new Date().getTime();
		if (
			now >= new Date(ROUND_START).getTime() &&
			now <= new Date(ROUND_END).getTime()
		) {
			gameOn = true;
			if (turns.getStatus() !== "running") {
				scheduler.startById("id_10");
			}
			if (thirtyMin.getStatus() !== "running") {
				scheduler.startById("id_5");
			}
			if (snaps.getStatus() !== "running") {
				scheduler.startById("id_3");
			}
			if (hourly.getStatus() !== "running") {
				scheduler.startById("id_2");
			}
			if (daily.getStatus() !== "running") {
				scheduler.startById("id_4");
			}
			if (aidJob.getStatus() !== "running") {
				scheduler.startById("id_7");
			}
		} else {
			gameOn = false;
			if (turns.getStatus() === "running") {
				scheduler.stopById("id_10");
			}
			if (thirtyMin.getStatus() === "running") {
				scheduler.stopById("id_5");
			}
			if (snaps.getStatus() === "running") {
				scheduler.stopById("id_3");
			}
			if (hourly.getStatus() === "running") {
				scheduler.stopById("id_2");
			}
			if (daily.getStatus() === "running") {
				scheduler.stopById("id_4");
			}
			if (aidJob.getStatus() === "running") {
				scheduler.stopById("id_7");
			}
		}
	});

	const gameActive = new SimpleIntervalJob(
		{ minutes: 1, runImmediately: true },
		checkTimeTask,
		"id_0",
	);

	const turns = new SimpleIntervalJob(
		{ minutes: 2, runImmediately: false },
		promTurns,
		"id_10",
	);

	const thirtyMin = new SimpleIntervalJob(
		{
			minutes: 30,
			runImmediately: false,
		},
		thirtyMinUpdate,
		"id_5",
	);

	const snaps = new SimpleIntervalJob(
		{ minutes: 45, runImmediately: false },
		snapshot,
		"id_3",
	);

	const hourly = new SimpleIntervalJob(
		{ hours: 1, runImmediately: false },
		hourlyUpdate,
		"id_2",
	);

	const daily = new SimpleIntervalJob(
		{ minutes: 3, runImmediately: false },
		cleanDemoAccounts,
		"id_4",
	);

	const aidJob = new SimpleIntervalJob(
		{ hours: AID_DELAY / 60 / 60, runImmediately: false },
		aidCredits,
		"id_7",
	);

	const scheduler = new ToadScheduler();

	scheduler.addSimpleIntervalJob(snaps);
	scheduler.addSimpleIntervalJob(thirtyMin);
	scheduler.addSimpleIntervalJob(hourly);
	scheduler.addSimpleIntervalJob(daily);
	scheduler.addSimpleIntervalJob(aidJob);
	scheduler.addSimpleIntervalJob(turns);
	scheduler.addSimpleIntervalJob(gameActive);
}
