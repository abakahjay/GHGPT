import { useEffect, useState } from "react";
import { Box, Button, Flex, Switch, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import useShowToast from "../../hooks/useShowToast";
import { disablePush, enablePush, getPushState, sendTestPush } from "../../utils/push";

const HINTS = {
    unsupported: "This browser can't show notifications.",
    "install-first": "On iPhone and iPad, add GH-GPT to your Home Screen first, then turn this on in the app.",
    denied: "Notifications are blocked for this site. Allow them in your browser's site settings.",
};

// "Device notifications" row for the Settings modal.
export default function PushSettings({ onNavigate }) {
    const showToast = useShowToast();
    const [state, setState] = useState("loading");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        getPushState().then(setState).catch(() => setState("unsupported"));
    }, []);

    const toggle = async (on) => {
        setBusy(true);
        try {
            setState(on ? await enablePush() : await disablePush());
            if (on) showToast("Notifications on", "You'll get alerts on this device.", "success", 2000);
        } catch (err) {
            showToast("Couldn't turn on notifications", err.message, "warning");
            setState(await getPushState().catch(() => "off"));
        } finally {
            setBusy(false);
        }
    };

    const test = async () => {
        setBusy(true);
        try {
            const delivered = await sendTestPush();
            showToast(delivered ? "Test sent" : "No devices", delivered ? "Check your notifications." : "Turn notifications on first.", delivered ? "success" : "warning", 2500);
        } catch {
            showToast("Error", "Couldn't send a test notification.", "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box>
            <Flex align="center" justify="space-between" gap={4}>
                <Box>
                    <Text fontWeight="semibold">Device notifications</Text>
                    <Text fontSize="sm" color="text.muted">
                        {HINTS[state] || "Alerts on this phone or computer for sign-ins, emails and finished images, even when GH-GPT is closed."}
                    </Text>
                </Box>
                <Switch
                    isChecked={state === "on"}
                    isDisabled={busy || !["on", "off"].includes(state)}
                    onChange={(e) => toggle(e.target.checked)}
                    colorScheme="blue"
                />
            </Flex>
            {state === "on" && (
                <Button size="xs" variant="outline" mt={2} onClick={test} isLoading={busy}>Send a test notification</Button>
            )}
            {state === "install-first" && (
                <Button as={RouterLink} to="/install" size="xs" variant="outline" mt={2} onClick={onNavigate}>How to install</Button>
            )}
        </Box>
    );
}
