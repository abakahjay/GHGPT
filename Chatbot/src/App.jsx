import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import { Authpage } from "./pages/Authpage/Authpage.jsx";
import PageLayout from "./Layouts/PageLayouts/PageLayout.jsx";
import useAuthStore from "./store/useAuthStore.js";
import { fetchCurrentUser } from "./utils/auth.js";
import { syncPushSubscription } from "./utils/push.js";
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import MessagesPage from './pages/Messages/Messages';
import useLogout from "./hooks/useLogout.js";
import Homepage from "./routes/homePage/Homepage.jsx"
import Dashboard from "./routes/dashboardPage/Dashboard.jsx";
import GoogleCallback from "./pages/Authpage/GoogleCallback.jsx";

// Loaded on demand: the chat page pulls in the syntax highlighter.
const ChatPage = lazy(() => import("./routes/chatPage/Chatpage1.jsx"));
const Control = lazy(() => import("./pages/ControlElectrical/Control.jsx"));
const InstallPage = lazy(() => import("./pages/Install/InstallPage.jsx"));
const LegalPage = lazy(() => import("./pages/Legal/LegalPage.jsx"));
const PrivacyPage = (props) => <LegalPage {...props} page="privacy" />;
const TermsPage = (props) => <LegalPage {...props} page="terms" />;

// Wraps a page in the app shell and redirects to /auth when logged out.
// Reading the store here (instead of closing over props) lets the router be
// created once at module level.
function Protected({ page: Page }) {
    const authUser = useAuthStore((state) => state.user);
    const { logout } = useLogout();
    if (!authUser) return <Navigate to="/auth" replace />;
    return (
        <PageLayout authUser={authUser} onLogout={logout}>
            <Suspense fallback={<PageLayoutSpinner />}>
                <Page authUser={authUser} onLogout={logout} />
            </Suspense>
        </PageLayout>
    );
}

function AuthRoute() {
    const authUser = useAuthStore((state) => state.user);
    const setAuthUser = useAuthStore((state) => state.setAuthUser);
    if (authUser) return <Navigate to="/dashboard" replace />;
    return <Authpage onAuth={setAuthUser} />;
}

function PublicPage({ page: Page }) {
    const authUser = useAuthStore((state) => state.user);
    const { logout } = useLogout();
    return (
        <Suspense fallback={<PageLayoutSpinner />}>
            <Page authUser={authUser} onLogout={logout} />
        </Suspense>
    );
}

const router = createBrowserRouter([
    { path: '/', element: <PublicPage page={Homepage} /> },
    { path: '/auth', element: <AuthRoute /> },
    { path: '/auth/callback', element: <GoogleCallback /> },
    { path: '/dashboard', element: <Protected page={Dashboard} /> },
    { path: '/chat', element: <Navigate to="/dashboard" replace /> },
    { path: '/chat/:chatId', element: <Protected page={ChatPage} /> },
    { path: '/history', element: <Protected page={MessagesPage} /> },
    { path: '/control', element: <PublicPage page={Control} /> },
    { path: '/install', element: <PublicPage page={InstallPage} /> },
    { path: '/privacy', element: <PublicPage page={PrivacyPage} /> },
    { path: '/terms', element: <PublicPage page={TermsPage} /> },
    { path: '/:username', element: <Protected page={ProfilePage} /> },
    { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const setAuthUser = useAuthStore((state) => state.setAuthUser);
    const logoutUser = useAuthStore((state) => state.logoutUser);
    // Only block rendering when there is a token but no cached user to show.
    const [verifying, setVerifying] = useState(Boolean(token && !user));

    // Refresh the user document once per token so profile changes show up.
    useEffect(() => {
        if (!token) {
            setVerifying(false);
            return;
        }
        const controller = new AbortController();
        fetchCurrentUser(token, { signal: controller.signal })
            .then((freshUser) => {
                setAuthUser(freshUser);
                syncPushSubscription(); // keep this device linked to the signed-in account
            })
            .catch((error) => {
                if (error.name === "CanceledError") return;
                // An expired/invalid token ends the session; network errors keep the cached user.
                if (error.response?.status === 401) logoutUser();
            })
            .finally(() => {
                if (!controller.signal.aborted) setVerifying(false);
            });
        return () => controller.abort();
    }, [token, setAuthUser, logoutUser]);

    if (verifying) return <PageLayoutSpinner />;

    return <RouterProvider router={router} />;
}

const PageLayoutSpinner = () => {
	return (
		<Flex flexDir='column' h='100%' minH='60vh' alignItems='center' justifyContent='center'>
			<Spinner size='xl' color="accent" thickness="3px" />
		</Flex>
	);
};
