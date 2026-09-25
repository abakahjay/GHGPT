import API from "../utils/api";
import useShowToast from "./useShowToast";
import useAddMessage from "./useAddMessage";
import useAddImageMessage from "./useAddImageMessage";
import useAiChatActions from "./useAiChatActions";
import { useState } from "react";

// Asks the AI, then saves the question + answer to the chat.
// Resolves to true on success so the caller can roll back optimistic UI.
const useHandleMessageSend = () => {
    const [loading, setLoading] = useState(false);
    const showToast = useShowToast();
    const { addMessage } = useAddMessage();
    const { addImageMessage } = useAddImageMessage();
    const { fetchUserChats } = useAiChatActions();

    const handleMessageSend = async ({
        userId,
        chatId,
        prompt,
        file, // optional image file
        text = "", // optional caption
        provider = "openrouter", // or local / openai
    }) => {
        setLoading(true);
        try {
            let answer;

            if (file) {
                const formData = new FormData();
                formData.append("prompt", prompt || "Describe this image.");
                formData.append("image", file);
                formData.append("text", text);
                formData.append("provider", provider);

                const response = await API.post("/api/v1/ai/ask", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                answer = response?.data?.response;
            } else {
                const response = await API.post("/api/v1/ai/ask", { prompt, provider });
                answer = response?.data?.response;
            }

            if (!answer) {
                throw new Error("The AI didn't return a response. Please try again.");
            }

            // Save to the DB only once the AI has answered.
            if (file) {
                await addImageMessage({ userId, chatId, imageFile: file, text, responses: answer });
            } else {
                await addMessage({ userId, chatId, question: prompt, answer });
            }

            // The backend names a new chat after its first question.
            fetchUserChats(userId, { silent: true });
            return true;
        } catch (err) {
            const message =
                err?.response?.data?.error || err?.response?.data?.msg || err.message || "Failed to send message to AI";
            showToast("Error", message, "error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { handleMessageSend, loading };
};

export default useHandleMessageSend;
