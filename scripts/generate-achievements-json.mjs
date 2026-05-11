/**
 * Generates public/locales/{en,es,pt-BR}/achievements.json from structured strings.
 * Run: node scripts/generate-achievements-json.mjs
 */
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const STR = {
	en: {
		notificationAwarded: "Achievement Awarded",
		pageTitle: "Achievements",
		awardedOn: "Awarded on {{date}}",
		categories: {
			turns: "Turns Used",
			exploreGains: "Exploration",
			income: "Income",
			expenses: "Expenses",
			food: "Food Production",
			foodcon: "Food Consumption",
			networth: "Net Worth",
			peasants: "Population",
			land: "Total Land",
			indy: "Industrial Production",
			magic: "Magical Production",
			trpArm: "Ground troops",
			trpLnd: "Siege troops",
			trpFly: "Air troops",
			trpSea: "Naval troops",
			trpWiz: "Magic troops",
			attackGains: "Attack Gains",
			attacks: "Successful Attacks",
			defends: "Successful Defenses",
			rank: "Rank",
			build: "Buildings",
			joinClan: "Clans",
		},
		subtitles: {
			income: "Total Income of ${{amount}}",
			indyProd: "Total Industrial Output of ${{amount}}",
			magicProd: "Total Magical Output of ${{amount}}",
			expenses: "Total Expenses of ${{amount}}",
			foodcon: "Total Food Consumption of {{amount}}",
			food: "Total Food Production of {{amount}}",
			exploreGains: "Total Exploration Gains of {{amount}} land",
			land: "Total Land of {{amount}}",
			networth: "Reach Net Worth of ${{amount}}",
			peasants: "Total Population of {{amount}}",
			trpArm: "Total Guerilla Units of {{amount}}",
			trpLnd: "Total Siege Units of {{amount}}",
			trpFly: "Total Air Strike Units of {{amount}}",
			trpSea: "Total Coastal Assault Units of {{amount}}",
			trpWiz: "Total Magic Units of {{amount}}",
			attackGains: "Total Attack Gains of {{amount}} land",
			attacks: "{{amount}} Successful Attacks",
			defends: "{{amount}} Successful Defenses",
			rank1: "Take the number 1 rank",
			build: "Build on all available land",
			joinClan: "Join or create a clan",
			turns0: "Exited New Player Protection",
			turns1: "Used 1,000 Turns",
			turns2: "Used 2,600 Turns",
		},
		titles: {
			income: [
				"Money Maker 1",
				"Money Maker 2",
				"Money Maker 3",
				"Money Maker 4",
				"Money Maker 5",
			],
			indyProd: [
				"Industrialist 1",
				"Industrialist 2",
				"Industrialist 3",
				"Industrialist 4",
				"Industrialist 5",
			],
			magicProd: [
				"Alchemy 1",
				"Alchemy 2",
				"Alchemy 3",
				"Alchemy 4",
				"Alchemy 5",
			],
			expenses: [
				"Big Spender 1",
				"Big Spender 2",
				"Big Spender 3",
				"Big Spender 4",
				"Big Spender 5",
			],
			foodcon: ["Foodie 1", "Foodie 2", "Foodie 3", "Foodie 4", "Foodie 5"],
			food: ["Farmer 1", "Farmer 2", "Farmer 3", "Farmer 4", "Farmer 5"],
			exploreGains: [
				"Explorer 1",
				"Explorer 2",
				"Explorer 3",
				"Explorer 4",
				"Explorer 5",
			],
			land: [
				"Expansionist 1",
				"Expansionist 2",
				"Expansionist 3",
				"Expansionist 4",
				"Expansionist 5",
			],
			networth: [
				"Net Worth 1",
				"Net Worth 2",
				"Net Worth 3",
				"Net Worth 4",
				"Net Worth 5",
			],
			peasants: [
				"Populist 1",
				"Populist 2",
				"Populist 3",
				"Populist 4",
				"Populist 5",
			],
			trpArm: [
				"Guerilla Master 1",
				"Guerilla Master 2",
				"Guerilla Master 3",
				"Guerilla Master 4",
				"Guerilla Master 5",
			],
			trpLnd: [
				"Siege Master 1",
				"Siege Master 2",
				"Siege Master 3",
				"Siege Master 4",
				"Siege Master 5",
			],
			trpFly: [
				"Air Master 1",
				"Air Master 2",
				"Air Master 3",
				"Air Master 4",
				"Air Master 5",
			],
			trpSea: [
				"Sea Master 1",
				"Sea Master 2",
				"Sea Master 3",
				"Sea Master 4",
				"Sea Master 5",
			],
			trpWiz: [
				"Magic Men 1",
				"Magic Men 2",
				"Magic Men 3",
				"Magic Men 4",
				"Magic Men 5",
			],
			attackGains: [
				"Conqueror 1",
				"Conqueror 2",
				"Conqueror 3",
				"Conqueror 4",
				"Conqueror 5",
			],
			turns: ["Into The World", "Sticking With It", "Committed"],
			attacks: [
				"Tactical Edge 1",
				"Tactical Edge 2",
				"Tactical Edge 3",
				"Tactical Edge 4",
				"Tactical Edge 5",
			],
			defends: [
				"Iron Wall 1",
				"Iron Wall 2",
				"Iron Wall 3",
				"Iron Wall 4",
				"Iron Wall 5",
			],
			rank1: ["Top of the World"],
			build: ["Fully Built"],
			joinClan: ["Join a Clan"],
		},
	},
	es: {
		notificationAwarded: "Logro obtenido",
		pageTitle: "Logros",
		awardedOn: "Obtenido el {{date}}",
		categories: {
			turns: "Turnos usados",
			exploreGains: "Exploración",
			income: "Ingresos",
			expenses: "Gastos",
			food: "Producción de alimentos",
			foodcon: "Consumo de alimentos",
			networth: "Valor neto",
			peasants: "Población",
			land: "Tierras totales",
			indy: "Producción industrial",
			magic: "Producción mágica",
			trpArm: "Tropas terrestres",
			trpLnd: "Tropas de asedio",
			trpFly: "Tropas aéreas",
			trpSea: "Tropas navales",
			trpWiz: "Tropas mágicas",
			attackGains: "Ganancias de ataque",
			attacks: "Ataques exitosos",
			defends: "Defensas exitosas",
			rank: "Rango",
			build: "Edificios",
			joinClan: "Clanes",
		},
		subtitles: {
			income: "Ingresos totales de ${{amount}}",
			indyProd: "Producción industrial total de ${{amount}}",
			magicProd: "Producción mágica total de ${{amount}}",
			expenses: "Gastos totales de ${{amount}}",
			foodcon: "Consumo total de alimentos de {{amount}}",
			food: "Producción total de alimentos de {{amount}}",
			exploreGains: "Ganancias totales de exploración de {{amount}} tierras",
			land: "Tierras totales de {{amount}}",
			networth: "Alcanza un valor neto de ${{amount}}",
			peasants: "Población total de {{amount}}",
			trpArm: "Unidades de guerrilla totales de {{amount}}",
			trpLnd: "Unidades de asedio totales de {{amount}}",
			trpFly: "Unidades de ataque aéreo totales de {{amount}}",
			trpSea: "Unidades de asalto costero totales de {{amount}}",
			trpWiz: "Unidades mágicas totales de {{amount}}",
			attackGains: "Ganancias totales de ataque de {{amount}} tierras",
			attacks: "{{amount}} ataques exitosos",
			defends: "{{amount}} defensas exitosas",
			rank1: "Alcanza el puesto número 1",
			build: "Construye en todas las tierras disponibles",
			joinClan: "Únete o crea un clan",
			turns0: "Saliste de la protección para jugadores nuevos",
			turns1: "Usaste 1.000 turnos",
			turns2: "Usaste 2.600 turnos",
		},
		titles: {
			income: [
				"Generador de dinero 1",
				"Generador de dinero 2",
				"Generador de dinero 3",
				"Generador de dinero 4",
				"Generador de dinero 5",
			],
			indyProd: [
				"Industrial 1",
				"Industrial 2",
				"Industrial 3",
				"Industrial 4",
				"Industrial 5",
			],
			magicProd: [
				"Alquimia 1",
				"Alquimia 2",
				"Alquimia 3",
				"Alquimia 4",
				"Alquimia 5",
			],
			expenses: [
				"Gran gastador 1",
				"Gran gastador 2",
				"Gran gastador 3",
				"Gran gastador 4",
				"Gran gastador 5",
			],
			foodcon: [
				"Gourmet 1",
				"Gourmet 2",
				"Gourmet 3",
				"Gourmet 4",
				"Gourmet 5",
			],
			food: [
				"Agricultor 1",
				"Agricultor 2",
				"Agricultor 3",
				"Agricultor 4",
				"Agricultor 5",
			],
			exploreGains: [
				"Explorador 1",
				"Explorador 2",
				"Explorador 3",
				"Explorador 4",
				"Explorador 5",
			],
			land: [
				"Expansionista 1",
				"Expansionista 2",
				"Expansionista 3",
				"Expansionista 4",
				"Expansionista 5",
			],
			networth: [
				"Valor neto 1",
				"Valor neto 2",
				"Valor neto 3",
				"Valor neto 4",
				"Valor neto 5",
			],
			peasants: [
				"Populista 1",
				"Populista 2",
				"Populista 3",
				"Populista 4",
				"Populista 5",
			],
			trpArm: [
				"Maestro guerrillero 1",
				"Maestro guerrillero 2",
				"Maestro guerrillero 3",
				"Maestro guerrillero 4",
				"Maestro guerrillero 5",
			],
			trpLnd: [
				"Maestro de asedio 1",
				"Maestro de asedio 2",
				"Maestro de asedio 3",
				"Maestro de asedio 4",
				"Maestro de asedio 5",
			],
			trpFly: [
				"Maestro aéreo 1",
				"Maestro aéreo 2",
				"Maestro aéreo 3",
				"Maestro aéreo 4",
				"Maestro aéreo 5",
			],
			trpSea: [
				"Maestro naval 1",
				"Maestro naval 2",
				"Maestro naval 3",
				"Maestro naval 4",
				"Maestro naval 5",
			],
			trpWiz: [
				"Mago de guerra 1",
				"Mago de guerra 2",
				"Mago de guerra 3",
				"Mago de guerra 4",
				"Mago de guerra 5",
			],
			attackGains: [
				"Conquistador 1",
				"Conquistador 2",
				"Conquistador 3",
				"Conquistador 4",
				"Conquistador 5",
			],
			turns: ["Al mundo", "Persistente", "Comprometido"],
			attacks: [
				"Ventaja táctica 1",
				"Ventaja táctica 2",
				"Ventaja táctica 3",
				"Ventaja táctica 4",
				"Ventaja táctica 5",
			],
			defends: [
				"Muro de hierro 1",
				"Muro de hierro 2",
				"Muro de hierro 3",
				"Muro de hierro 4",
				"Muro de hierro 5",
			],
			rank1: ["Cima del mundo"],
			build: ["Totalmente construido"],
			joinClan: ["Únete a un clan"],
		},
	},
	pt: {
		notificationAwarded: "Conquista desbloqueada",
		pageTitle: "Conquistas",
		awardedOn: "Concedida em {{date}}",
		categories: {
			turns: "Turnos usados",
			exploreGains: "Exploração",
			income: "Renda",
			expenses: "Despesas",
			food: "Produção de alimentos",
			foodcon: "Consumo de alimentos",
			networth: "Patrimônio líquido",
			peasants: "População",
			land: "Terras totais",
			indy: "Produção industrial",
			magic: "Produção mágica",
			trpArm: "Tropas terrestres",
			trpLnd: "Tropas de cerco",
			trpFly: "Tropas aéreas",
			trpSea: "Tropas navais",
			trpWiz: "Tropas mágicas",
			attackGains: "Ganhos em ataques",
			attacks: "Ataques bem-sucedidos",
			defends: "Defesas bem-sucedidas",
			rank: "Classificação",
			build: "Construções",
			joinClan: "Clãs",
		},
		subtitles: {
			income: "Renda total de ${{amount}}",
			indyProd: "Produção industrial total de ${{amount}}",
			magicProd: "Produção mágica total de ${{amount}}",
			expenses: "Despesas totais de ${{amount}}",
			foodcon: "Consumo total de alimentos de {{amount}}",
			food: "Produção total de alimentos de {{amount}}",
			exploreGains: "Ganhos totais de exploração de {{amount}} terras",
			land: "Terras totais de {{amount}}",
			networth: "Alcance patrimônio líquido de ${{amount}}",
			peasants: "População total de {{amount}}",
			trpArm: "Unidades de guerrilha totais de {{amount}}",
			trpLnd: "Unidades de cerco totais de {{amount}}",
			trpFly: "Unidades de ataque aéreo totais de {{amount}}",
			trpSea: "Unidades de assalto costeiro totais de {{amount}}",
			trpWiz: "Unidades mágicas totais de {{amount}}",
			attackGains: "Ganhos totais de ataque de {{amount}} terras",
			attacks: "{{amount}} ataques bem-sucedidos",
			defends: "{{amount}} defesas bem-sucedidas",
			rank1: "Ocupe o 1º lugar no ranking",
			build: "Construa em todas as terras disponíveis",
			joinClan: "Entre ou crie um clã",
			turns0: "Saiu da proteção para novos jogadores",
			turns1: "Usou 1.000 turnos",
			turns2: "Usou 2.600 turnos",
		},
		titles: {
			income: [
				"Criador de riqueza 1",
				"Criador de riqueza 2",
				"Criador de riqueza 3",
				"Criador de riqueza 4",
				"Criador de riqueza 5",
			],
			indyProd: [
				"Industrial 1",
				"Industrial 2",
				"Industrial 3",
				"Industrial 4",
				"Industrial 5",
			],
			magicProd: [
				"Alquimia 1",
				"Alquimia 2",
				"Alquimia 3",
				"Alquimia 4",
				"Alquimia 5",
			],
			expenses: [
				"Grande gastador 1",
				"Grande gastador 2",
				"Grande gastador 3",
				"Grande gastador 4",
				"Grande gastador 5",
			],
			foodcon: [
				"Epicúreo 1",
				"Epicúreo 2",
				"Epicúreo 3",
				"Epicúreo 4",
				"Epicúreo 5",
			],
			food: [
				"Agricultor 1",
				"Agricultor 2",
				"Agricultor 3",
				"Agricultor 4",
				"Agricultor 5",
			],
			exploreGains: [
				"Explorador 1",
				"Explorador 2",
				"Explorador 3",
				"Explorador 4",
				"Explorador 5",
			],
			land: [
				"Expansionista 1",
				"Expansionista 2",
				"Expansionista 3",
				"Expansionista 4",
				"Expansionista 5",
			],
			networth: [
				"Patrimônio 1",
				"Patrimônio 2",
				"Patrimônio 3",
				"Patrimônio 4",
				"Patrimônio 5",
			],
			peasants: [
				"Populista 1",
				"Populista 2",
				"Populista 3",
				"Populista 4",
				"Populista 5",
			],
			trpArm: [
				"Mestre guerrilheiro 1",
				"Mestre guerrilheiro 2",
				"Mestre guerrilheiro 3",
				"Mestre guerrilheiro 4",
				"Mestre guerrilheiro 5",
			],
			trpLnd: [
				"Mestre de cerco 1",
				"Mestre de cerco 2",
				"Mestre de cerco 3",
				"Mestre de cerco 4",
				"Mestre de cerco 5",
			],
			trpFly: [
				"Mestre aéreo 1",
				"Mestre aéreo 2",
				"Mestre aéreo 3",
				"Mestre aéreo 4",
				"Mestre aéreo 5",
			],
			trpSea: [
				"Mestre naval 1",
				"Mestre naval 2",
				"Mestre naval 3",
				"Mestre naval 4",
				"Mestre naval 5",
			],
			trpWiz: [
				"Homens mágicos 1",
				"Homens mágicos 2",
				"Homens mágicos 3",
				"Homens mágicos 4",
				"Homens mágicos 5",
			],
			attackGains: [
				"Conquistador 1",
				"Conquistador 2",
				"Conquistador 3",
				"Conquistador 4",
				"Conquistador 5",
			],
			turns: ["Para o mundo", "Persistente", "Comprometido"],
			attacks: [
				"Vantagem tática 1",
				"Vantagem tática 2",
				"Vantagem tática 3",
				"Vantagem tática 4",
				"Vantagem tática 5",
			],
			defends: [
				"Muralha de ferro 1",
				"Muralha de ferro 2",
				"Muralha de ferro 3",
				"Muralha de ferro 4",
				"Muralha de ferro 5",
			],
			rank1: ["Topo do mundo"],
			build: ["Totalmente construído"],
			joinClan: ["Entrar num clã"],
		},
	},
};

function levelDigit(key) {
	const m = key.match(/(\d+)$/);
	return m ? parseInt(m[1], 10) : 0;
}

import { achievements as ACH } from "../src/game/config/achievements.js";

/** Maps achievements.js `property` to STR.titles / STR.subtitles keys */
const PROP_TO_SERIES = {
	income: "income",
	indyProd: "indyProd",
	magicProd: "magicProd",
	expenses: "expenses",
	foodcon: "foodcon",
	foodpro: "food",
	exploreGains: "exploreGains",
	peakLand: "land",
	peakNetworth: "networth",
	peakPeasants: "peasants",
	peakTrpArm: "trpArm",
	peakTrpLnd: "trpLnd",
	peakTrpFly: "trpFly",
	peakTrpSea: "trpSea",
	peakTrpWiz: "trpWiz",
	attackGains: "attackGains",
	turnsUsed: "turns",
	offSucc: "attacks",
	defSucc: "defends",
};

function buildItems(langKey) {
	const S = STR[langKey];
	const items = {};
	for (const def of ACH) {
		for (const key of def.keys) {
			if (key.startsWith("turns")) {
				const idx = key === "turns0" ? 0 : key === "turns1" ? 1 : 2;
				items[key] = {
					title: S.titles.turns[idx],
					subtitle: S.subtitles[`turns${idx}`],
				};
				continue;
			}
			if (key === "rank1") {
				items[key] = {
					title: S.titles.rank1[0],
					subtitle: S.subtitles.rank1,
				};
				continue;
			}
			if (key === "build") {
				items[key] = {
					title: S.titles.build[0],
					subtitle: S.subtitles.build,
				};
				continue;
			}
			if (key === "joinClan") {
				items[key] = {
					title: S.titles.joinClan[0],
					subtitle: S.subtitles.joinClan,
				};
				continue;
			}

			const seriesKey = PROP_TO_SERIES[def.property];
			if (!seriesKey || !S.titles[seriesKey]) {
				throw new Error(`Missing series for property ${def.property} key ${key}`);
			}
			const digit = levelDigit(key);
			const titleArr = S.titles[seriesKey];
			const title = titleArr[digit];
			const subtitleTpl = S.subtitles[seriesKey];
			items[key] = { title, subtitle: subtitleTpl };
		}
	}
	return items;
}

function buildLocale(strKey, folder) {
	const S = STR[strKey];
	const out = {
		notificationAwarded: S.notificationAwarded,
		pageTitle: S.pageTitle,
		awardedOn: S.awardedOn,
		categories: S.categories,
		items: buildItems(strKey),
	};
	const target = path.join(
		ROOT,
		"public",
		"locales",
		folder,
		"achievements.json",
	);
	writeFileSync(target, JSON.stringify(out, null, "\t") + "\n", "utf8");
	console.log("Wrote", target);
}

buildLocale("en", "en");
buildLocale("es", "es");
buildLocale("pt", "pt-BR");
