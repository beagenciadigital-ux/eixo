/**
 * Intentionally empty: loading TypeORM / class-transformer here breaks under Turbopack
 * ("Class extends value undefined") because the instrumentation bundle resolves those
 * packages differently than the Pages API route.
 *
 * Dev cron jobs (ToadScheduler) start from {@link getApiApp} in development instead.
 */
export async function register() {
	// no-op
}
