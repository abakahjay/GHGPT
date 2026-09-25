import useProfileStore from '../store/userProfileStore'
import API from "../utils/api";
import useShowToast from "./useShowToast";
import { useEffect } from 'react';

// Loads a user's public profile by username into the profile store.
export const useGetUser = (username) => {
    const showToast = useShowToast();
    const { userProfile, setError, setLoading, isLoading, error, setUserProfile } = useProfileStore();

    useEffect(() => {
        if (!username) return;
        const controller = new AbortController();
        setLoading(true);
        API.patch(`/api/v1/users/${username}`, {}, { signal: controller.signal })
            .then((response) => {
                setUserProfile(response.data);
                setError(null);
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                const message = err.response?.data?.error || err.response?.data?.msg || "User not found";
                setUserProfile(null);
                setError(message);
                showToast("Error", message, "error");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [username, showToast, setError, setLoading, setUserProfile]);

    return { isLoading, error, userProfile };
}
