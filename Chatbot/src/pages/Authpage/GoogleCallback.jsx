import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import useAuthStore from "../../store/useAuthStore";
import useShowToast from "../../hooks/useShowToast";
import { fetchCurrentUser } from "../../utils/auth";

// The backend's /auth/google/callback redirects here with ?token=... after
// a successful Google sign-in. This page's whole job is to:
//   1. Pull the token out of the URL and immediately scrub it from the
//      address bar (it should never sit visibly in the URL or history).
//   2. VERIFY the token actually works by requesting the user's own
//      dashboard data with it — never trust an unverified token as a
//      real session just because it showed up in a redirect.
//   3. On success, store { user, token } exactly the way normal
//      email/password login does, then go to the app.
//   4. On failure, show why, and send the user back to the login page.
export default function GoogleCallback() {
    const navigate = useNavigate();
    const showToast = useShowToast();
    const setSession = useAuthStore((state) => state.setSession);
    // StrictMode runs effects twice in dev; the second run would find the
    // token already scrubbed from the URL and wrongly report a failure.
    const handled = useRef(false);

    useEffect(() => {
        if (handled.current) return;
        handled.current = true;

        const verifyGoogleLogin = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");

            // Clear it from the URL right away, regardless of what happens next.
            window.history.replaceState({}, "", "/auth/callback");

            if (!token) {
                showToast("Error", params.get("error") || "Google sign-in failed: no token received.", "error");
                navigate("/auth", { replace: true });
                return;
            }

            try {
                const user = await fetchCurrentUser(token);
                setSession({ user, token });
                showToast("Success", "Logged in with Google", "success");
                navigate("/dashboard", { replace: true });
            } catch (error) {
                console.error(error);
                showToast("Error", "Google sign-in failed. Please try again.", "error");
                navigate("/auth", { replace: true });
            }
        };

        verifyGoogleLogin();
    }, [navigate, setSession, showToast]);

    return (
        <Flex h="100dvh" direction="column" gap={4} alignItems="center" justifyContent="center">
            <Spinner size="xl" color="accent" thickness="3px" />
            <Text color="text.muted">Signing you in…</Text>
        </Flex>
    );
}
