import Axios from "axios";
import { getApiBaseUrl } from "./apiOrigin";

Axios.defaults.baseURL = getApiBaseUrl();
Axios.defaults.withCredentials = true;

Axios.interceptors.request.use((config) => {
	config.headers = config.headers ?? {};
	let lng = "pt-BR";
	try {
		lng =
			(typeof window !== "undefined" &&
				window.localStorage?.getItem("i18nextLng")) ||
			(typeof document !== "undefined" && document.documentElement?.lang) ||
			lng;
	} catch {
		/* ignore */
	}
	config.headers["Accept-Language"] = lng;
	return config;
});
