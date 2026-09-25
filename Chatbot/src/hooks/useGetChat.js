import { formatHistory } from "../utils/formatMessage";
import { useState, useEffect } from "react";
import useAiChatStore from "../store/useAiChatStore";
import useShowToast from "./useShowToast";
import API from "../utils/api";

// Loads one chat's messages into the chat store whenever chatId changes.
const useGetChat = (userId, chatId) => {
  const showToast = useShowToast();
  const [isLoading, setLoading] = useState(true);
  const chats = useAiChatStore((state) => state.chats);
  const error = useAiChatStore((state) => state.error);
  const setChats = useAiChatStore((state) => state.setChats);
  const setError = useAiChatStore((state) => state.setError);

  useEffect(() => {
    if (!userId || !chatId) return;
    const controller = new AbortController();
    // Don't flash the previous chat's messages while this one loads.
    setChats([]);
    setLoading(true);

    API.get(`/api/v1/ai/chats/${userId}/${chatId}`, { signal: controller.signal })
      .then((response) => {
        setChats(formatHistory(response.data.data?.history));
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        const message = err.response?.data?.error || err.response?.data?.msg || err.message;
        setError(message);
        showToast("Error", message, "error");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [chatId, userId, showToast, setChats, setError]);

  return { isLoading, error, chats };
};

export default useGetChat;
