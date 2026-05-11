import { Container } from "@mantine/core"
import FooterSocial from "../layout/footer"
import { SlimHero } from "./slimHero"
import { BRAND_NAME, CONTACT_EMAIL } from "../../config/oldConfig"
import { useTranslation } from "react-i18next"

export default function PrivacyPolicy() {
	const { t } = useTranslation("legal", { keyPrefix: "privacy" })
	const definitions = t("definitions", { returnObjects: true })
	const personalList = t("personalList", { returnObjects: true })
	const usePurposes = t("usePurposes", { returnObjects: true })
	const shareSituations = t("shareSituations", { returnObjects: true })
	const otherLegalList = t("otherLegalList", { returnObjects: true })

	return (
		<div>
			<SlimHero />
			<Container size="lg" mt="lg">
				<h1>{t("title")}</h1>
				<p>{t("lastUpdated")}</p>
				<p>{t("intro1")}</p>
				<p>
					{t("intro2a")}
					<a
						href="https://www.termsfeed.com/privacy-policy-generator/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t("generatorLink")}
					</a>
					{t("intro2b")}
				</p>
				<h1>{t("hInterpretation")}</h1>
				<h2>{t("h2Interpretation")}</h2>
				<p>{t("pInterpretation")}</p>
				<h2>{t("h2Definitions")}</h2>
				<p>{t("pDefinitionsLead")}</p>
				<ul>
					{Array.isArray(definitions) &&
						definitions.map((def, i) => (
							<li key={i}>
								<p>
									<strong>{def.term}</strong>{" "}
									{t(`definitions.${i}.body`, {
										brand: BRAND_NAME,
									})}
								</p>
							</li>
						))}
				</ul>
				<h1>{t("hCollecting")}</h1>
				<h2>{t("h2TypesCollected")}</h2>
				<h3>{t("h3PersonalData")}</h3>
				<p>{t("pPersonalLead")}</p>
				<ul>
					{Array.isArray(personalList) &&
						personalList.map((item, i) => (
							<li key={i}>
								<p>{item}</p>
							</li>
						))}
				</ul>
				<h3>{t("h3UsageData")}</h3>
				<p>{t("pUsage1")}</p>
				<p>{t("pUsage2")}</p>
				<p>{t("pUsage3")}</p>
				<p>{t("pUsage4")}</p>
				<h3>{t("h3Tracking")}</h3>
				<p>{t("pTracking1")}</p>
				<ul>
					<li>
						<strong>{t("cookieTech1")}</strong> {t("cookieTech1Body")}
					</li>
					<li>
						<strong>{t("cookieTech2")}</strong> {t("cookieTech2Body")}
					</li>
				</ul>
				<p>
					{t("pCookiesTypes")}
					<a
						href="https://www.termsfeed.com/blog/cookies/#What_Are_Cookies"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t("cookiesLearnLink")}
					</a>
					{t("pCookiesTypesSuffix")}
				</p>
				<p>{t("pCookiesPurposes")}</p>
				<ul>
					<li>
						<p>
							<strong>{t("cookiePurpose1Title")}</strong>
						</p>
						<p>{t("cookiePurpose1Type")}</p>
						<p>{t("cookiePurpose1Admin")}</p>
						<p>{t("cookiePurpose1Purpose")}</p>
					</li>
					<li>
						<p>
							<strong>{t("cookiePurpose2Title")}</strong>
						</p>
						<p>{t("cookiePurpose2Type")}</p>
						<p>{t("cookiePurpose2Admin")}</p>
						<p>{t("cookiePurpose2Purpose")}</p>
					</li>
					<li>
						<p>
							<strong>{t("cookiePurpose3Title")}</strong>
						</p>
						<p>{t("cookiePurpose3Type")}</p>
						<p>{t("cookiePurpose3Admin")}</p>
						<p>{t("cookiePurpose3Purpose")}</p>
					</li>
				</ul>
				<p>{t("pCookiesMore")}</p>
				<h2>{t("h2UseData")}</h2>
				<p>{t("pUseLead")}</p>
				<ul>
					{Array.isArray(usePurposes) &&
						usePurposes.map((text, i) => (
							<li key={i}>
								<p>{text}</p>
							</li>
						))}
				</ul>
				<p>{t("pShareLead")}</p>
				<ul>
					{Array.isArray(shareSituations) &&
						shareSituations.map((text, i) => (
							<li key={i}>{text}</li>
						))}
				</ul>
				<h2>{t("h2Retention")}</h2>
				<p>{t("pRetention1")}</p>
				<p>{t("pRetention2")}</p>
				<h2>{t("h2Transfer")}</h2>
				<p>{t("pTransfer1")}</p>
				<p>{t("pTransfer2")}</p>
				<p>{t("pTransfer3")}</p>
				<h2>{t("h2Delete")}</h2>
				<p>{t("pDelete1")}</p>
				<p>{t("pDelete2")}</p>
				<p>{t("pDelete3")}</p>
				<p>{t("pDelete4")}</p>
				<h2>{t("h2Disclosure")}</h2>
				<h3>{t("h3Business")}</h3>
				<p>{t("pBusiness")}</p>
				<h3>{t("h3Law")}</h3>
				<p>{t("pLaw")}</p>
				<h3>{t("h3OtherLegal")}</h3>
				<p>{t("pOtherLegal")}</p>
				<ul>
					{Array.isArray(otherLegalList) &&
						otherLegalList.map((item, i) => <li key={i}>{item}</li>)}
				</ul>
				<h2>{t("h2Security")}</h2>
				<p>{t("pSecurity")}</p>
				<h1>{t("h1Children")}</h1>
				<p>{t("pChildren1")}</p>
				<p>{t("pChildren2")}</p>
				<h1>{t("h1Links")}</h1>
				<p>{t("pLinks1")}</p>
				<p>{t("pLinks2")}</p>
				<h1>{t("h1Changes")}</h1>
				<p>{t("pChanges1")}</p>
				<p>{t("pChanges2")}</p>
				<p>{t("pChanges3")}</p>
				<h1>{t("h1Contact")}</h1>
				<p>{t("pContact")}</p>
				<ul>
					<li>
						{t("contactByEmail")}{" "}
						<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
					</li>
				</ul>
			</Container>
			<FooterSocial />
		</div>
	)
}
