import { formatMessage, formatHistory } from "../utils/formatMessage";
import { API_URL } from "../utils/config";
import { useState } from "react";
import useAiChatStore from "../store/useAiChatStore";
import useShowToast from "./useShowToast";

const apiUrl = API_URL;

const useAiChatActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useShowToast();

  const { setUserChats, deleteUserChat, updateUserChat, setChats } = useAiChatStore();

  const fetchUserChats = async (userId, { silent = false } = {}) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/ai/userchats/${userId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const userChats = data.data?.[0]?.chats || [];
      setUserChats(userChats);
    } catch (err) {
      if (!silent) showToast("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const createUserChat = async (userId, chatData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/ai/chats/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatData),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const userChats = data.userChats?.chats || [];
      const savedChat = data.savedChat;

      setUserChats(userChats);
      setChats(formatHistory(savedChat.history));

      return savedChat;
    } catch (err) {
      showToast("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const removeUserChat = async (userId, chatId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/ai/chats/${userId}/${chatId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      deleteUserChat(chatId);
      showToast("Deleted", "Chat deleted", "success");
      return true;
    } catch (err) {
      showToast("Error", err.message, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const modifyUserChat = async (userId, chatId, updatedData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/ai/chats/${userId}/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateUserChat(data.data);
      showToast("Success", "Chat updated", "success");
    } catch (err) {
      showToast("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatMessages = async (userId, chatId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/ai/chats/${userId}/${chatId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const messages = (data.data?.history || []).map(formatMessage);

      setChats(messages);
    } catch (err) {
      showToast("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (userId, chatId, question, answer) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/ai/chats/${userId}/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const updated = data.data?.history || [];

      const formatted = updated.map(formatMessage);

      setChats(formatted);
    } catch (err) {
      showToast("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImageMessage = async (userId, chatId, file, text = "") => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", text);

      const res = await fetch(`${apiUrl}/api/v1/ai/upload/${userId}/${chatId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const messages = data.chat?.history.map(formatMessage);

      setChats(messages);
      showToast("Success", "Image uploaded", "success");
    } catch (err) {
      showToast("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImageMessage = async (chatId, fileId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/ai/chats/image/${chatId}/${fileId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const messages = data.updatedChat?.history.map(formatMessage);

      setChats(messages);
      showToast("Success", "Image deleted", "success");
    } catch (err) {
      showToast("Error", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchUserChats,
    createUserChat,
    removeUserChat,
    modifyUserChat,
    fetchChatMessages,
    sendMessage,
    uploadImageMessage,
    removeImageMessage,
  };
};

export default useAiChatActions;
