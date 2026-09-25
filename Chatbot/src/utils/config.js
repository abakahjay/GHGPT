// Single source for the backend URL. VITE_API_URL wins; otherwise local dev
// talks to FullBackendd on its default port and production builds use Render.
export const API_URL = (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:7004" : "https://fullbackendd.onrender.com")
).replace(/\/$/, "");
