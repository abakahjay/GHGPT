import { useCallback } from "react";
import useAiChatStore from "../store/useAiChatStore";
import useAiChatActions from "./useAiChatActions";
import useShowToast from "./useShowToast";
import { emailChat, pinChat, renameChat } from "../utils/ghgptApi";

// Rename / pin / email / delete for one chat, keeping the sidebar list in sync.
const useChatListActions = (userId) => {
    const showToast = useShowToast();
    const { removeUserChat } = useAiChatActions();

    const patchLocal = useCallback((chatId, changes) => {
        const { userChats, setUserChats } = useAiChatStore.getState();
        setUserChats(userChats.map((c) => (String(c.chatId) === String(chatId) ? { ...c, ...changes } : c)));
    }, []);

    const rename = useCallback(async (chatId, title) => {
        try {
            await renameChat(chatId, title);
            patchLocal(chatId, { title });
        } catch (err) {
            showToast("Error", err.response?.data?.msg || "Could not rename the chat", "error");
            throw err;
        }
    }, [patchLocal, showToast]);

    const togglePin = useCallback(async (chat) => {
        const pinned = !chat.pinned;
        patchLocal(chat.chatId, { pinned });
        try {
            await pinChat(chat.chatId, pinned);
        } catch (err) {
            patchLocal(chat.chatId, { pinned: !pinned });
            showToast("Error", err.response?.data?.msg || "Could not update the chat", "error");
        }
    }, [patchLocal, showToast]);

    const sendByEmail = useCallback(async (chatId) => {
        try {
            const { to } = await emailChat(chatId);
            showToast("Email sent", `This chat was sent to ${to}.`, "success");
        } catch (err) {
            showToast("Couldn't send email", err.response?.data?.msg || "Please try again later.", "error");
        }
    }, [showToast]);

    const remove = useCallback((chatId) => removeUserChat(userId, chatId), [removeUserChat, userId]);

    return { rename, togglePin, sendByEmail, remove };
};

export default useChatListActions;
