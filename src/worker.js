// Project Reset: one Worker serves the app (public/) and the API (/api/*).
import { onRequest } from "./api.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const path = url.pathname.slice(5).split("/").filter(Boolean);
      const res = await onRequest({ request, env, ctx, params: { path } });
      const h = new Headers(res.headers);
      h.set("x-content-type-options", "nosniff");
      return new Response(res.body, { status: res.status, headers: h });
    }
    // Visitors get the landing page at "/"; signed-in clients go straight to the app.
    // /app, /login and /start all open the app (/start opens the onboarding form, for after payment).
    const p = url.pathname;
    if (p === "/" && !/(?:^|;\s*)pr_session=/.test(request.headers.get("cookie") || "")) {
      return env.ASSETS.fetch(new Request(new URL("/landing", url), request));
    }
    if (p === "/app" || p === "/login" || p === "/start") {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }
    return env.ASSETS.fetch(request);
  }
};
