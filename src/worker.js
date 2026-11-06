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
    return env.ASSETS.fetch(request);
  }
};
