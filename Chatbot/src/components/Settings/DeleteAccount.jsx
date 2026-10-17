import { useState } from "react";
import {
    Box,
    Button,
    Input,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    UnorderedList,
    useDisclosure,
} from "@chakra-ui/react";
import API from "../../utils/api";
import useAuthStore from "../../store/useAuthStore";
import useAiChatStore from "../../store/useAiChatStore";
import { disablePush } from "../../utils/push";
import useShowToast from "../../hooks/useShowToast";

// Settings → Delete account. GH-GPT and Nsoro share one account, so this deletes both and
// everything in them (FullBackendd DELETE /api/v1/nsoro/me, utils/deleteAccount.js).
// Confirmed by typing the username, because it can't be undone.
const DeleteAccount = ({ onDone }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const user = useAuthStore((s) => s.user);
    const logoutUser = useAuthStore((s) => s.logoutUser);
    const [typed, setTyped] = useState("");
    const [busy, setBusy] = useState(false);
    const showToast = useShowToast();
    const username = (user?.username || "").trim();
    const matches = Boolean(username) && typed.trim().toLowerCase() === username.toLowerCase();

    const remove = async () => {
        setBusy(true);
        try {
            await disablePush().catch(() => {}); // this device stops getting notifications
            await API.delete("/api/v1/nsoro/me", { data: { confirm: typed.trim() } });
            logoutUser();
            useAiChatStore.getState().setUserChats([]);
            useAiChatStore.getState().setChats([]);
            showToast("Account deleted", "Your account and everything in it have been deleted.", "success");
            onClose();
            onDone?.();
        } catch (error) {
            showToast("Couldn't delete your account", error.response?.data?.error || error.message, "error");
            setBusy(false);
        }
    };

    return (
        <Box>
            <Text fontWeight="semibold">Delete account</Text>
            <Text fontSize="sm" color="text.muted" mt={1} mb={3}>
                Permanently deletes your GH-GPT and Nsoro account and everything in it. This can&apos;t be undone.
            </Text>
            <Button colorScheme="red" variant="outline" size="sm" onClick={onOpen} data-testid="delete-account">
                Delete my account
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay />
                <ModalContent mx={4}>
                    <ModalHeader>Delete your account?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mb={2}>This deletes, for good:</Text>
                        <UnorderedList fontSize="sm" color="text.muted" spacing={1} mb={4}>
                            <ListItem>all your GH-GPT chats, images and uploaded files</ListItem>
                            <ListItem>your profile and photo</ListItem>
                            <ListItem>your Nsoro posts, moments, comments, stars, chats and followers</ListItem>
                            <ListItem>your notifications, devices and sign-ins</ListItem>
                        </UnorderedList>
                        <Text fontSize="sm" mb={2}>
                            Type <b>{username}</b> to confirm.
                        </Text>
                        <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={username} autoComplete="off" fontSize="16px" data-testid="delete-account-confirm" />
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button variant="ghost" onClick={onClose} isDisabled={busy}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={remove} isDisabled={!matches} isLoading={busy} data-testid="delete-account-final">
                            Delete forever
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default DeleteAccount;
