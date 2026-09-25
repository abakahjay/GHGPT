import useAuthStore from "../store/useAuthStore";
import API from "../utils/api";
import { fetchCurrentUser } from "../utils/auth";
import useShowToast from "./useShowToast";

const useLogin = () => {
    const showToast = useShowToast();
    const setSession = useAuthStore((state) => state.setSession);
    const setError = useAuthStore((state) => state.setError);
    const setLoading = useAuthStore((state) => state.setLoading);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);

    const login = async (email, password) => {
        if (!email || !password) {
            return showToast("Error", "Please fill all the fields", "error");
        }
        setLoading(true);
        try {
            const { data } = await API.post("/api/v1/auth/login", { email, password });
            const user = await fetchCurrentUser(data.token);
            setSession({ user, token: data.token });
            setError(null);
            showToast("Success", "Login successful", "success");
        } catch (err) {
            const message = err.response?.data?.msg || err.response?.data?.error || "Login failed";
            setError(message);
            showToast("Error", message, "error");
        } finally {
            setLoading(false);
        }
    };

    return { login, isLoading, error };
};

export default useLogin;
