/**
 * Route chunks shared by the router and anything that wants one early.
 *
 * The same import() in both places means one download: whichever runs first
 * fetches the chunk, and the other receives the already-loaded module.
 */
export const loadCoursesPage = () => import('./CoursesPage');
