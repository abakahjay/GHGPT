import { useEffect, useState } from "react";
import { Button, CloseButton, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import useShowToast from "../../hooks/useShowToast";
import { enablePush, getPushState } from "../../utils/push";

const DISMISS_KEY = "ghgpt-push-prompt-dismissed";

// One-time card offering device notifications. The browser's permission
// dialog only opens when the user clicks "Turn on".
export default function NotificationPrompt() {
    const showToast = useShowToast();
    const [visible, setVisible] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let dismissed = false;
        try {
            dismissed = localStorage.getItem(DISMISS_KEY) === "1";
        } catch {
            // storage unavailable
        }
        if (dismissed) return;
        getPushState().then((s) => setVisible(s === "off")).catch(() => {});
    }, []);

    const dismiss = () => {
        setVisible(false);
        try {
            localStorage.setItem(DISMISS_KEY, "1");
        } catch {
            // storage unavailable
        }
    };

    const turnOn = async () => {
        setBusy(true);
        try {
            await enablePush();
            showToast("Notifications on", "You'll get alerts on this device.", "success", 2000);
            dismiss();
        } catch (err) {
            showToast("Couldn't turn on notifications", err.message, "warning");
        } finally {
            setBusy(false);
        }
    };

    if (!visible) return null;
    return (
        <Flex align="center" gap={3} p={3} mb={5} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl">
            <Flex boxSize="36px" flexShrink={0} align="center" justify="center" borderRadius="full" bg="blue.500" color="white">
                <Icon as={FiBell} />
            </Flex>
            <Text fontSize="sm" flex={1}>Get notified on this device about sign-ins, emails and finished images.</Text>
            <HStack spacing={1}>
                <Button size="sm" colorScheme="blue" onClick={turnOn} isLoading={busy}>Turn on</Button>
                <CloseButton size="sm" aria-label="Not now" onClick={dismiss} />
            </HStack>
        </Flex>
    );
}
