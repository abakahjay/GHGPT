import { create } from "zustand";

const STORAGE_KEY = "user-info";

// Reads the persisted auth blob and splits it into { user, token }.
const getStoredAuth = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { user: null, token: null };
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "user" in parsed) {
            return { user: parsed.user ?? null, token: parsed.token ?? null };
        }
        return { user: null, token: parsed?.token ?? null };
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return { user: null, token: null };
    }
};

const persist = (user, token) => {
    if (user || token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
};

const { user: initialUser, token: initialToken } = getStoredAuth();

const useAuthStore = create((set, get) => ({
    user: initialUser,
    token: initialToken,
    isLoading: false,
    error: null,

    // Stores a verified session: `user` is the user document, `token` the JWT.
    setSession: ({ user, token }) => {
        persist(user, token);
        set({ user, token });
    },

    logoutUser: () => {
        persist(null, null);
        set({ user: null, token: null });
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setToken: (token) => {
        persist(get().user, token);
        set({ token });
    },

    // Updates just the user doc — leaves the existing token untouched.
    setAuthUser: (user) => {
        persist(user, user ? get().token : null);
        set(user ? { user } : { user: null, token: null });
    },
}));

export default useAuthStore;
