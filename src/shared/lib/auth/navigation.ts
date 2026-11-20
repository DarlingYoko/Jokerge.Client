/**
 * Navigates with a full page load whenever the session changes (sign-in, silent re-login,
 * sign-out). The client router keeps prefetched pages and redirects from the previous
 * session; a soft navigation after sign-in could replay a cached redirect back to the
 * login form, so the form appeared to do nothing until the page was reloaded.
 */
export const enterWithNewSession = (path: string): void => {
  window.location.replace(path);
};
