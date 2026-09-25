import { formatMessage } from "../utils/formatMessage";
// hooks/useAddImageMessage.js
import useShowToast from "./useShowToast";
import useAiChatStore from "../store/useAiChatStore";
import API from "../utils/api";

const useAddImageMessage = () => {
    const showToast = useShowToast();
    const { setChats, setError } = useAiChatStore();

    const addImageMessage = async ({ userId, chatId, imageFile, text = "" ,responses}) => {
        try {
            // console.log('response:',responses)
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("text", text); // Optional caption
            formData.append("response", responses); // Optional caption

            const response = await API.post(
                `/api/v1/ai/upload/${userId}/${chatId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const messages = (response.data.chat?.history || []).map(formatMessage);

            setChats(messages);
        } catch (err) {
            const message =
                err.response?.data?.error || "Failed to upload image message";
            setError(message);
            showToast("Error", message, "error");
        }
    };

    return { addImageMessage };
};

export default useAddImageMessage;
