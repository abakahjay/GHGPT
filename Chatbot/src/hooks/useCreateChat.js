import useAiChatActions from "./useAiChatActions";

// Creating a chat lives in useAiChatActions; this keeps the older import path working.
const useCreateChat = () => {
    const { createUserChat, isLoading } = useAiChatActions();
    return { createUserChat, isLoading };
};

export default useCreateChat;
