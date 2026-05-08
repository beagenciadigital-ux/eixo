import Axios from "axios";
import { getApiBaseUrl } from "./apiOrigin";

Axios.defaults.baseURL = getApiBaseUrl();
Axios.defaults.withCredentials = true;
