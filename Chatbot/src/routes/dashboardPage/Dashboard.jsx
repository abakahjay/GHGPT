import { useState } from "react";
import { Box, Button, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { FiBookOpen, FiCode, FiEdit3, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useAiChatActions from "../../hooks/useAiChatActions";
import useAiChatStore from "../../store/useAiChatStore";
import useAuthStore from "../../store/useAuthStore.js";
import { unwrapUser } from "../../utils/auth";
import Composer from "../../components/Chat/Composer";
import Brand from "../../components/ui/Brand";

const SUGGESTIONS = [
  { icon: FiEdit3, label: "Write a professional email", prompt: "Write a professional email asking my manager for a day off next Friday." },
  { icon: FiCode, label: "Explain some code", prompt: "Explain what a JavaScript closure is with a short example." },
  { icon: FiBookOpen, label: "Summarize a topic", prompt: "Summarize the causes of the 2008 financial crisis in 5 bullet points." },
  { icon: FiZap, label: "Brainstorm ideas", prompt: "Give me 10 creative business ideas for a student in Ghana." },
];

// "New chat" screen. Creating the chat happens on first send; the message is
// handed to the chat page through the store so it can show progress there.
const Dashboard = () => {
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [creating, setCreating] = useState(false);
  const user = unwrapUser(useAuthStore((state) => state.user));
  const setPendingMessage = useAiChatStore((state) => state.setPendingMessage);
  const { createUserChat } = useAiChatActions();
  const navigate = useNavigate();

  const startChat = async (text, file) => {
    if (!text && !file) return;
    setCreating(true);
    const newChat = await createUserChat(user._id, { text: "New Chat" });
    setCreating(false);
    if (newChat?._id) {
      setPendingMessage({ chatId: newChat._id, text, file });
      navigate(`/chat/${newChat._id}`);
    }
  };

  const handleSend = () => startChat(input.trim(), attachment?.file || null);

  return (
    <Flex minH="100%" direction="column" align="center" justify="center" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
      <Box w="full" maxW="720px">
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 6, md: 8 }} gap={3}>
          <Brand showText={false} size="48px" to="/dashboard" />
          <Heading fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
            {user?.firstName ? `How can I help, ${user.firstName}?` : "What can I help with?"}
          </Heading>
          <Text color="text.muted" fontSize={{ base: "sm", md: "md" }}>
            Ask anything, attach an image, or use your voice.
          </Text>
        </Flex>

        <Composer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          attachment={attachment}
          onAttach={setAttachment}
          isSending={creating}
          placeholder="Ask anything…"
          autoFocus
        />

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mt={6}>
          {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
            <Button
              key={label}
              variant="outline"
              borderColor="border.default"
              bg="bg.surface"
              h="auto"
              py={3}
              px={4}
              justifyContent="flex-start"
              fontWeight="medium"
              fontSize="sm"
              whiteSpace="normal"
              textAlign="left"
              leftIcon={<Icon />}
              isDisabled={creating}
              onClick={() => startChat(prompt, null)}
              _hover={{ bg: "bg.hover" }}
            >
              {label}
            </Button>
          ))}
        </SimpleGrid>
      </Box>
    </Flex>
  );
};

export default Dashboard;
