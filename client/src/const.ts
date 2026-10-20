export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// دخول محلي (أوفلاين): تحويل لصفحة /login بدل بوابة Manus.
export const startLogin = () => {
  window.location.href = "/login";
};
