#!/usr/bin/env node
/**
 * Replace English tail of pt-BR/guide.json (from guide.content.summary onward)
 * using Spanish guide as base + conservative es→pt-BR string transforms (placeholder-safe).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const pEn = path.join(ROOT, "public", "locales", "en", "guide.json");
const pEs = path.join(ROOT, "public", "locales", "es", "guide.json");
const pPt = path.join(ROOT, "public", "locales", "pt-BR", "guide.json");

const TAIL_KEYS = [
	"summary",
	"overview",
	"scores",
	"clanStats",
	"mailbox",
	"worldNews",
	"farm",
	"cash",
	"explore",
	"industry",
	"healing",
	"meditate",
	"magicCenter",
	"build",
	"demolish",
	"favorites",
	"blackMarket",
	"publicMarket",
	"lottery",
	"clans",
	"warCouncil",
	"intelCenter",
	"foreignAid",
	"empireSettings",
	"achievements",
	"worldBank",
];

/** Apply replacements only outside {{...}} segments */
function transformOutsidePlaceholders(s, replacers) {
	if (typeof s !== "string") return s;
	const parts = s.split(/(\{\{[^}]+\}\})/g);
	return parts
		.map((part) => {
			if (/^\{\{[^}]+\}\}$/.test(part)) return part;
			let out = part;
			out = out
				.replace(/^El /, "O ")
				.replace(/^La /, "A ")
				.replace(/^Los /, "Os ")
				.replace(/^Las /, "As ")
				.replace(/^Un /, "Um ")
				.replace(/^Una /, "Uma ")
				.replace(/^Esta /, "Esta ")
				.replace(/^Este /, "Este ")
				.replace(/^En /, "Em ")
				.replace(/^De /, "De ")
				.replace(/^Si /, "Se ")
				.replace(/^No /, "Não ")
				.replace(/^Hay /, "Há ")
				.replace(/^Aqui /, "Aqui ");
			for (const { from, to } of replacers) {
				out = out.split(from).join(to);
			}
			return out;
		})
		.join("");
}

const REPLACERS = [
	{ from: "Resumen del Império", to: "Resumo do império" },
	{ from: "Resumen del Imperio", to: "Resumo do império" },
	{ from: " que tienes ", to: " que tem " },
	{ from: " que tu ", to: " que o seu " },
	{ from: " puedes ", to: " pode " },
	{ from: " se muestran ", to: " são mostradas " },
	{ from: " se muestra ", to: " é mostrada " },
	{ from: " cada vez que ", to: " sempre que " },
	{ from: "La cantidad", to: "A quantidade" },
	{ from: "El tamaño", to: "O tamanho" },
	{ from: "El valor", to: "O valor" },
	{ from: "El rango", to: "A posição" },
	{ from: "El número", to: "O número" },
	{ from: " disponibles ", to: " disponíveis " },
	{ from: " disponible ", to: " disponível " },
	{ from: "(y el máximo que se te permite acumular)", to: "(e o máximo que pode acumular)" },
	{ from: " y el ", to: " e o " },
	{ from: " se te ", to: " lhe " },
	{ from: " permite ", to: " permite " },
	{ from: " acumular", to: " acumular" },
	{ from: "La población", to: "A população" },
	{ from: "La salud", to: "A saúde" },
	{ from: "La tasa", to: "A taxa" },
	{ from: "Debajo de", to: "Abaixo de" },
	{ from: " debajo ", to: " abaixo " },
	{ from: "Haz clic", to: "Clique" },
	{ from: "haz clic", to: "clique" },
	{ from: "hacer clic", to: "clicar" },
	{ from: "Debes", to: "Deve" },
	{ from: "debes", to: "deve" },
	{ from: " puedes ", to: " pode " },
	{ from: "Puedes ", to: "Pode " },
	{ from: " también ", to: " também " },
	{ from: "También ", to: "Também " },
	{ from: " y ", to: " e " },
	{ from: " Y ", to: " E " },
	{ from: "ñ", to: "nh" },
	{ from: "ación", to: "ação" },
	{ from: "ciones", to: "ções" },
	{ from: "ico ", to: "ico " },
	{ from: " mercado ", to: " mercado " },
	{ from: "Hechizo", to: "Feitiço" },
	{ from: "hechizo", to: "feitiço" },
	{ from: "Hechizos", to: "Feitiços" },
	{ from: "hechizos", to: "feitiços" },
	{ from: "Imperio", to: "Império" },
	{ from: "imperio", to: "império" },
	{ from: "Imperios", to: "Impérios" },
	{ from: "imperios", to: "impérios" },
	{ from: "jugador", to: "jogador" },
	{ from: "Jugador", to: "Jogador" },
	{ from: "jugadores", to: "jogadores" },
	{ from: "Jugadores", to: "Jogadores" },
	{ from: "juego", to: "jogo" },
	{ from: "Juego", to: "Jogo" },
	{ from: " usted ", to: " você " },
	{ from: "Usted ", to: "Você " },
	{ from: " tu ", to: " o seu " },
	{ from: "Tu ", to: "O seu " },
	{ from: " tus ", to: " os seus " },
	{ from: "Tus ", to: "Os seus " },
	{ from: " su ", to: " o seu " },
	{ from: "Su ", to: "O seu " },
	{ from: " sus ", to: " os seus " },
	{ from: "Sus ", to: "Os seus " },
	{ from: " aquí ", to: " aqui " },
	{ from: "Aquí ", to: "Aqui " },
	{ from: " allí ", to: " ali " },
	{ from: "Allí ", to: "Ali " },
	{ from: " será ", to: " será " },
	{ from: "Buzón", to: "Correio" },
	{ from: "buzón", to: "correio" },
	{ from: "Clanes", to: "Clãs" },
	{ from: "clanes", to: "clãs" },
	{ from: "Clan", to: "Clã" },
	{ from: "clan", to: "clã" },
	{ from: "Raza", to: "Raça" },
	{ from: "raza", to: "raça" },
	{ from: "Razas", to: "Raças" },
	{ from: "razas", to: "raças" },
	{ from: "Ciudadanos", to: "Cidadãos" },
	{ from: "ciudadanos", to: "cidadãos" },
	{ from: "Ciudadano", to: "Cidadão" },
	{ from: "ciudadano", to: "cidadão" },
	{ from: "Ejército", to: "Exército" },
	{ from: "ejército", to: "exército" },
	{ from: "Guerra", to: "Guerra" },
	{ from: "Puntuaciones", to: "Placar" },
	{ from: "puntuaciones", to: "placar" },
	{ from: "Puntuación", to: "Pontuação" },
	{ from: "puntuación", to: "pontuação" },
	{ from: "Dentro de", to: "Dentro de" },
	{ from: "Banco Mundial", to: "Banco" },
	{ from: "banco mundial", to: "banco" },
	{ from: "Sesión", to: "Sessão" },
	{ from: "sesión", to: "sessão" },
	{ from: "inicies sesión", to: "inicie sessão" },
	{ from: "Inicies sesión", to: "Inicie sessão" },
	{ from: "iniciar sesión", to: "iniciar sessão" },
	{ from: "Iniciar sesión", to: "Iniciar sessão" },
	{ from: "Ninguno", to: "Nenhum" },
	{ from: "ninguno", to: "nenhum" },
	{ from: "Ninguna", to: "Nenhuma" },
	{ from: "ninguna", to: "nenhuma" },
	{ from: "Miembro", to: "Membro" },
	{ from: "miembro", to: "membro" },
	{ from: "Miembros", to: "Membros" },
	{ from: "miembros", to: "membros" },
	{ from: "Utilitarios", to: "Utilitários" },
	{ from: "utilitarios", to: "utilitários" },
	{ from: "Lanzamiento", to: "Lançamento" },
	{ from: "lanzamiento", to: "lançamento" },
	{ from: "Lanzar", to: "Lançar" },
	{ from: "lanzar", to: "lançar" },
	{ from: "lanzadores", to: "conjuradores" },
	{ from: "Lanzadores", to: "Conjuradores" },
	{ from: "Administración", to: "Administração" },
	{ from: "administración", to: "administração" },
	{ from: "Moderadores", to: "Moderadores" },
	{ from: "Silenciados", to: "Silenciados" },
	{ from: "Deshabilitados", to: "Desativados" },
	{ from: "deshabilitados", to: "desativados" },
	{ from: "Deshabilitado", to: "Desativado" },
	{ from: "deshabilitado", to: "desativado" },
	{ from: "Añade", to: "Adicione" },
	{ from: "añade", to: "adicione" },
	{ from: "Agiliza", to: "Agilize" },
	{ from: "agiliza", to: "agilize" },
	{ from: "Población", to: "População" },
	{ from: "población", to: "população" },
	{ from: "Ingreso", to: "Renda" },
	{ from: "ingreso", to: "renda" },
	{ from: "Ingresos", to: "Rendas" },
	{ from: "ingresos", to: "rendas" },
	{ from: "Gastos", to: "Despesas" },
	{ from: "gastos", to: "despesas" },
	{ from: "Préstamo", to: "Empréstimo" },
	{ from: "préstamo", to: "empréstimo" },
	{ from: "Préstamos", to: "Empréstimos" },
	{ from: "préstamos", to: "empréstimos" },
	{ from: "Saldo", to: "Saldo" },
	{ from: "Ahorros", to: "Poupança" },
	{ from: "ahorros", to: "poupança" },
	{ from: "Finanzas", to: "Finanças" },
	{ from: "finanzas", to: "finanças" },
	{ from: "División", to: "Divisão" },
	{ from: "división", to: "divisão" },
	{ from: "Relaciones", to: "Relações" },
	{ from: "relaciones", to: "relações" },
	{ from: "Enemigos", to: "Inimigos" },
	{ from: "enemigos", to: "inimigos" },
	{ from: "Defensas", to: "Defesas" },
	{ from: "defensas", to: "defesas" },
	{ from: "Acciones", to: "Ações" },
	{ from: "acciones", to: "ações" },
	{ from: "Ofensiva", to: "Ofensiva" },
	{ from: "Defensiva", to: "Defensiva" },
	{ from: "Utilidad", to: "Utilidade" },
	{ from: "utilidad", to: "utilidade" },
	{ from: "Portal Temporal", to: "Portal do tempo" },
	{ from: "portal temporal", to: "portal do tempo" },
	{ from: "Período de Tiempo", to: "Período de tempo" },
	{ from: "período de tiempo", to: "período de tempo" },
	{ from: "Acres de Tierra", to: "Acres de terra" },
	{ from: "acres de tierra", to: "acres de terra" },
	{ from: "Valor Neto", to: "Património" },
	{ from: "valor neto", to: "património" },
	{ from: "networth", to: "património" },
	{ from: "Resumen Detallado", to: "Visão detalhada" },
	{ from: "Resumen del Imperio", to: "Resumo do império" },
	{ from: "Lista de Puntuaciones", to: "Lista de pontuação" },
	{ from: "Estadísticas de Clanes", to: "Estatísticas dos clãs" },
	{ from: "Noticias Mundiales", to: "Notícias do mundo" },
	{ from: "Enfoque en Agricultura", to: "Foco na agricultura" },
	{ from: "Enfoque Económico", to: "Foco económico" },
	{ from: "Enfoque Industrial", to: "Foco industrial" },
	{ from: "Enfoque en Curación", to: "Foco em cura" },
	{ from: "Lanzamiento de Hechizos", to: "Lançamento de feitiços" },
	{ from: "Hechizos Utilitarios", to: "Feitiços utilitários" },
	{ from: "Mercado Negro", to: "Mercado negro" },
	{ from: "Mercado Público", to: "Mercado público" },
	{ from: "Tu Ejército", to: "O seu exército" },
	{ from: "Centro de Inteligencia", to: "Centro de inteligência" },
	{ from: "Ayuda Extranjera", to: "Ajuda externa" },
	{ from: "Configuración del Imperio", to: "Configurações do império" },
	{ from: "Logros", to: "Conquistas" },
	{ from: "El Banco", to: "O banco" },
];

function localizeSubtree(node) {
	if (node === null || node === undefined) return node;
	if (typeof node === "string") {
		return transformOutsidePlaceholders(node, REPLACERS);
	}
	if (Array.isArray(node)) {
		return node.map((x) => localizeSubtree(x));
	}
	if (typeof node === "object") {
		const out = {};
		for (const k of Object.keys(node)) {
			out[k] = localizeSubtree(node[k]);
		}
		return out;
	}
	return node;
}

const en = JSON.parse(fs.readFileSync(pEn, "utf8"));
const es = JSON.parse(fs.readFileSync(pEs, "utf8"));
const pt = JSON.parse(fs.readFileSync(pPt, "utf8"));

for (const k of TAIL_KEYS) {
	if (es.guide.content[k] === undefined) continue;
	pt.guide.content[k] = localizeSubtree(es.guide.content[k]);
}

fs.writeFileSync(pPt, JSON.stringify(pt, null, "\t") + "\n", "utf8");
console.error("Updated pt-BR guide tail from es + transforms.");
