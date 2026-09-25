import useAuthStore from "../store/useAuthStore";
import useAiChatStore from "../store/useAiChatStore";
import API from "../utils/api";
import useShowToast from "./useShowToast";

const useLogout = () => {
    const showToast = useShowToast();
    const logoutUser = useAuthStore((state) => state.logoutUser);
    const setError = useAuthStore((state) => state.setError);
    const setLoading = useAuthStore((state) => state.setLoading);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);

    const logout = async (userId) => {
        setLoading(true);
        try {
            if (userId) {
                const response = await API.post(`/api/v1/auth/logout?userId=${userId}`);
                showToast("Success", response?.data?.message || "Logout successful", "success");
            }
            setError(null);
        } catch (err) {
            // The local session is cleared regardless, so a failed server call
            // never leaves the user stuck logged in.
            setError(null);
            showToast("Logged out", err.response?.data?.msg || "Session ended on this device", "info");
        } finally {
            logoutUser();
            useAiChatStore.getState().setUserChats([]);
            useAiChatStore.getState().setChats([]);
            setLoading(false);
        }
    };

    return { logout, isLoading, error };
};

export default useLogout;
