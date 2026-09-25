import API from "./api.js";

// Login/signup only return { token, userId }, so the full user document is
// always loaded from /dashboard with the fresh token.
export const fetchCurrentUser = async (token, config = {}) => {
    const { data } = await API.get("/api/v1/auth/dashboard", {
        ...config,
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.user;
};

// Returns the user object whether a component got `{ user }` or the user itself.
export const unwrapUser = (authUser) => (authUser?.user ? authUser.user : authUser) || null;
