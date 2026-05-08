import ActiveSession from "./ActiveSession";
import Clan from "./Clan";
import ClanHistory from "./ClanHistory";
import ClanMessage from "./ClanMessage";
import ClanNews from "./ClanNews";
import ClanRelation from "./ClanRelation";
import Empire from "./Empire";
import EmpireEffect from "./EmpireEffect";
import EmpireHistory from "./EmpireHistory";
import EmpireIntel from "./EmpireIntel";
import EmpireMessage from "./EmpireMessage";
import EmpireNews from "./EmpireNews";
import EmpireSnapshot from "./EmpireSnapshot";
import Game from "./Game";
import Lottery from "./Lottery";
import Market from "./Market";
import Permission from "./Permission";
import ResetToken from "./ResetToken";
import RoundHistory from "./RoundHistory";
import Session from "./Session";
import User from "./User";
import { EmpireSubscriber } from "../subscriber/EmpireSubscriber";

export const typeOrmEntities = [
	ActiveSession,
	Clan,
	ClanHistory,
	ClanMessage,
	ClanNews,
	ClanRelation,
	Empire,
	EmpireEffect,
	EmpireHistory,
	EmpireIntel,
	EmpireMessage,
	EmpireNews,
	EmpireSnapshot,
	Game,
	Lottery,
	Market,
	Permission,
	ResetToken,
	RoundHistory,
	Session,
	User,
];

export const typeOrmSubscribers = [EmpireSubscriber];

if (
	process.env.NODE_ENV === "development" &&
	typeof module !== "undefined"
) {
	const hot = (
		module as NodeModule & { hot?: { dispose: (cb: () => void) => void } }
	).hot;
	hot?.dispose(() => {
		void import("@/lib/db").then((m) => m.resetEixoTypeormConnection());
	});
}
