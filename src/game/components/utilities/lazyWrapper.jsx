import { lazy as _lazy } from "react"
import i18n from "../../i18n"

export default (function lazy(factory)
{
    return _lazy(() => factory().catch(importErrorHandler))
})

export function importErrorHandler()
{
    // Get the last reload time from local storage and the current time
    const timeStr = sessionStorage.getItem('last-reload');
    const time = timeStr ? Number(timeStr) : null;
    const now = Date.now();

    // If the last reload time is more than 10 seconds ago, reload the page
    const isReloading = !time || time + 10000 < now;
    if (isReloading) {
        console.log(i18n.t("layout:layout.lazy.reloadLog"))
        sessionStorage.setItem('last-reload', String(now));
        window.location.reload();
        // Return an empty module so we do not see the error in the app before reloading
        return { default: () => null }
    }

    throw new Error(i18n.t("layout:layout.lazy.reloadError"))
}