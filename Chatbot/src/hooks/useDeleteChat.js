import useAiChatActions from "./useAiChatActions";

// Deleting a chat lives in useAiChatActions; this keeps a focused import path.
const useDeleteChat = () => {
  const { removeUserChat, isLoading } = useAiChatActions();
  return { deleteChat: removeUserChat, isLoading };
};

export default useDeleteChat;
