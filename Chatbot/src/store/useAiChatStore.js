import { create } from "zustand";

const useAiChatStore = create((set) => ({
  userChats: [], // All chat rooms for the user
  chats: [],     // Messages in selected chat
  error: null,
  // First message typed on the dashboard, sent once its new chat page opens.
  // Kept in memory (not localStorage) so image files don't hit storage limits.
  pendingMessage: null, // { chatId, text, file }

  setPendingMessage: (pendingMessage) => set({ pendingMessage }),

  // USER CHAT HANDLERS
  setUserChats: (userChats) => set({ userChats }),

  addUserChat: (chat) =>
    set((state) => ({
      userChats: [chat, ...state.userChats],
    })),

  deleteUserChat: (chatId) =>
    set((state) => ({
      userChats: state.userChats.filter((chat) => chat.chatId !== chatId),
    })),

  updateUserChat: (updatedChat) =>
    set((state) => ({
      userChats: state.userChats.map((chat) =>
        chat.chatId === updatedChat.chatId ? updatedChat : chat
      ),
    })),

  // CHAT MESSAGES HANDLERS
  setChats: (chats) => set({ chats }),

  addMessage: (message) =>
    set((state) => ({
      chats: [...state.chats, message],
    })),

  deleteMessage: (index) =>
    set((state) => ({
      chats: state.chats.filter((_, i) => i !== index),
    })),

  updateMessage: (index, updatedMessage) =>
    set((state) => ({
      chats: state.chats.map((msg, i) =>
        i === index ? updatedMessage : msg
      ),
    })),
    setError: (error) => set({ error }),

  // Optional: For threaded replies (if used)
  addAiReply: (parentIndex, aiReply) =>
    set((state) => ({
      chats: state.chats.map((msg, i) => {
        if (i === parentIndex) {
          return {
            ...msg,
            replies: [...(msg.replies || []), aiReply],
          };
        }
        return msg;
      }),
    })),
}));

export default useAiChatStore;
