import useAuthStore from "../store/useAuthStore";
import API from "../utils/api";
import { fetchCurrentUser } from "../utils/auth";
import { sendAuthEvent } from "../utils/ghgptApi";
import useShowToast from "./useShowToast";

const useSignup = () => {
    const showToast = useShowToast();
    const setSession = useAuthStore((state) => state.setSession);
    const setError = useAuthStore((state) => state.setError);
    const setLoading = useAuthStore((state) => state.setLoading);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);

    const signup = async (email, password, firstName, lastName, username) => {
        if (!email || !password || !firstName || !lastName || !username) {
            return showToast("Error", "Please fill all the fields", "error");
        }

        setLoading(true);
        try {
            const { data } = await API.post("/api/v1/auth/signup", {
                email,
                password,
                firstName,
                lastName,
                username,
            });
            const user = await fetchCurrentUser(data.token);
            setSession({ user, token: data.token });
            sendAuthEvent("signup", data.token);
            setError(null);
            showToast("Success", "Signup successful", "success");
        } catch (err) {
            const message = err.response?.data?.msg || err.response?.data?.error || "Signup failed";
            setError(message);
            showToast("Error", message, "error");
        } finally {
            setLoading(false);
        }
    };

    return { signup, isLoading, error };
};

export default useSignup;
