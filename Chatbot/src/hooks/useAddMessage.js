import { formatMessage } from "../utils/formatMessage";
import useShowToast from "./useShowToast";
import useAiChatStore from "../store/useAiChatStore";
import API from "../utils/api";

const useAddMessage = () => {
  const showToast = useShowToast();
  const { setChats, setError } = useAiChatStore();

  const addMessage = async ({ userId, chatId, question, answer }) => {
    try {
      const response = await API.patch(`/api/v1/ai/chats/${userId}/${chatId}`, {
        question, answer
      });

      const messages = (response.data.data.history || []).map(formatMessage);

      setChats(messages);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to add message";
      setError(message);
      showToast("Error", message, "error");
    }
  };

  return { addMessage };
};

export default useAddMessage;
