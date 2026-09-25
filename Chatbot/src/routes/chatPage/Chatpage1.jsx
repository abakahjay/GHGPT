import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  chakra,
  Flex,
  HStack,
  IconButton,
  Image,
  keyframes,
  Spinner,
  Text,
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import { FiCopy, FiEdit2, FiTrash2, FiVolume2 } from "react-icons/fi";
import { useParams } from "react-router-dom";
import useShowToast from "../../hooks/useShowToast";
import useGetChat from "../../hooks/useGetChat";
import useHandleMessageSend from "../../hooks/useHandleMessageSend";
import useDeleteMessage from "../../hooks/useDeleteMessage";
import useEditMessage from "../../hooks/useEditMessage";
import useAiChatStore from "../../store/useAiChatStore";
import { unwrapUser } from "../../utils/auth";
import { ChatGptLogo1 } from "../../assets/constants";
import Composer from "../../components/Chat/Composer";
import MessageContent from "../../components/Chat/MessageContent";

const BotLogo = chakra(ChatGptLogo1);

// A freshly created chat starts with a "." placeholder message that the
// backend replaces with a real title; it is never shown.
const isPlaceholder = (msg) => msg.fromUser && !msg.image && msg.text === ".";

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

function TypingIndicator() {
  return (
    <Flex gap={3} align="flex-start" mb={6}>
      <BotLogo boxSize="28px" flexShrink={0} mt={1} />
      <HStack spacing={1.5} bg="bubble.bot" px={4} py={3} borderRadius="2xl" borderTopLeftRadius="sm">
        {[0, 1, 2].map((i) => (
          <Box key={i} boxSize="8px" borderRadius="full" bg="text.muted" animation={`${bounce} 1.2s ${i * 0.16}s infinite ease-in-out`} />
        ))}
      </HStack>
    </Flex>
  );
}

function ActionButton({ label, icon, onClick, isLoading }) {
  return (
    <Tooltip label={label} hasArrow openDelay={400}>
      <IconButton
        icon={icon}
        aria-label={label}
        size="xs"
        variant="ghost"
        color="text.muted"
        fontSize="sm"
        isLoading={isLoading}
        onClick={onClick}
      />
    </Tooltip>
  );
}

const copyImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, "image/png");
    };
    img.onerror = reject;
    img.src = src;
  });

const ChatPage = ({ authUser }) => {
  const { chatId } = useParams();
  const userId = unwrapUser(authUser)?._id;
  const showToast = useShowToast();

  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [optimistic, setOptimistic] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deletingIndex, setDeletingIndex] = useState(null);
  const scrollRef = useRef(null);
  const handledPending = useRef(null);

  const { chats, isLoading } = useGetChat(userId, chatId);
  const { handleMessageSend, loading: sending } = useHandleMessageSend();
  const { handleMessageDelete } = useDeleteMessage();
  const { editMessage, loading: editingLoading } = useEditMessage();

  // `idx` is the message's position in the saved history (used by edit/delete);
  // optimistic messages that aren't saved yet have idx = null.
  const messages = useMemo(
    () => [
      ...chats.map((msg, idx) => ({ ...msg, idx })).filter((msg) => !isPlaceholder(msg)),
      ...optimistic.map((msg) => ({ ...msg, idx: null })),
    ],
    [chats, optimistic]
  );

  const sendMessage = useCallback(
    async ({ text, file, preview }) => {
      setOptimistic([{ text, image: preview, fromUser: true }]);
      const ok = await handleMessageSend({ userId, chatId, prompt: text || null, file, text });
      setOptimistic([]);
      return ok;
    },
    [handleMessageSend, userId, chatId]
  );

  // Send the message typed on the dashboard once this new chat opens.
  useEffect(() => {
    const pending = useAiChatStore.getState().pendingMessage;
    if (!pending || pending.chatId !== chatId || handledPending.current === chatId) return;
    handledPending.current = chatId;
    useAiChatStore.getState().setPendingMessage(null);
    const preview = pending.file ? URL.createObjectURL(pending.file) : undefined;
    sendMessage({ text: pending.text, file: pending.file, preview });
  }, [chatId, sendMessage]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending, editingLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !attachment) || sending) return;
    const current = attachment;
    setInput("");
    setAttachment(null);
    const ok = await sendMessage({ text, file: current?.file, preview: current?.preview });
    if (!ok) {
      // Give the user their message back so they can retry.
      setInput(text);
      setAttachment(current);
    }
  };

  const handleCopy = async (msg) => {
    try {
      if (msg.image && !msg.text) {
        await copyImage(msg.image);
        showToast("Copied", "Image copied to clipboard.", "success", 1500);
      } else {
        await navigator.clipboard.writeText(msg.text || "");
        showToast("Copied", "Message copied to clipboard.", "success", 1500);
      }
    } catch (err) {
      console.error("Copy failed:", err);
      showToast("Error", "Couldn't copy to the clipboard.", "error");
    }
  };

  const speakMessage = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, " code block "));
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleDelete = async (msg) => {
    setDeletingIndex(msg.idx);
    await handleMessageDelete({ fileId: msg.fileId, userId, chatId, messageIndex: msg.idx });
    setDeletingIndex(null);
  };

  const handleSaveEdit = async () => {
    const text = editingText.trim();
    if (!text) return;
    try {
      await editMessage({ userId, chatId, messageIndex: editingIndex, newText: text });
      setEditingIndex(null);
      setEditingText("");
    } catch {
      // useEditMessage already shows the error; keep the editor open.
    }
  };

  return (
    <Flex direction="column" h="100%">
      <Box ref={scrollRef} flex={1} minH={0} overflowY="auto">
        <Box maxW="820px" mx="auto" px={{ base: 3, sm: 4, md: 6 }} pt={{ base: 4, md: 8 }} pb={4}>
          {isLoading && messages.length === 0 && (
            <Flex justify="center" py={16}>
              <Spinner color="accent" />
            </Flex>
          )}

          {!isLoading && messages.length === 0 && !sending && (
            <Flex direction="column" align="center" textAlign="center" py={16} gap={3} color="text.muted">
              <BotLogo boxSize="44px" />
              <Text fontSize="lg" fontWeight="semibold" color="text.default">Start the conversation</Text>
              <Text fontSize="sm">Ask a question below to get going.</Text>
            </Flex>
          )}

          {messages.map((msg, i) => {
            const isEditing = msg.idx !== null && editingIndex === msg.idx;
            return (
              <Flex
                key={msg.idx ?? `pending-${i}`}
                role="group"
                direction="column"
                align={msg.fromUser ? "flex-end" : "flex-start"}
                mb={5}
              >
                <Flex gap={3} align="flex-start" w="full" justify={msg.fromUser ? "flex-end" : "flex-start"}>
                  {!msg.fromUser && <BotLogo boxSize="28px" flexShrink={0} mt={1} />}

                  <Box
                    maxW={msg.fromUser ? { base: "88%", md: "75%" } : "calc(100% - 40px)"}
                    minW={0}
                    w={isEditing ? "full" : undefined}
                    bg={msg.fromUser ? "bubble.user" : "bubble.bot"}
                    color={msg.fromUser ? "white" : "text.default"}
                    px={4}
                    py={2.5}
                    borderRadius="2xl"
                    borderTopRightRadius={msg.fromUser ? "sm" : "2xl"}
                    borderTopLeftRadius={msg.fromUser ? "2xl" : "sm"}
                    fontSize={{ base: "sm", md: "md" }}
                    opacity={msg.idx === null ? 0.85 : 1}
                  >
                    {isEditing ? (
                      <Flex direction="column" gap={2} minW={{ base: "auto", md: "420px" }}>
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          bg="bg.surface"
                          color="text.default"
                          borderRadius="lg"
                          fontSize="16px"
                          rows={3}
                          autoFocus
                        />
                        <HStack justify="flex-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                            onClick={() => setEditingIndex(null)}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" bg="white" color="blue.600" onClick={handleSaveEdit} isLoading={editingLoading}>
                            Save & regenerate
                          </Button>
                        </HStack>
                      </Flex>
                    ) : (
                      <>
                        {msg.image && (
                          <Image
                            src={msg.image}
                            alt="Uploaded"
                            borderRadius="lg"
                            maxH={{ base: "220px", md: "300px" }}
                            objectFit="contain"
                            mb={msg.text ? 2 : 0}
                          />
                        )}
                        <MessageContent text={msg.text} />
                      </>
                    )}
                  </Box>
                </Flex>

                {msg.idx !== null && !isEditing && (
                  <HStack
                    spacing={0}
                    mt={1}
                    pl={msg.fromUser ? 0 : "40px"}
                    opacity={0}
                    transition="opacity 0.15s"
                    _groupHover={{ opacity: 1 }}
                    _focusWithin={{ opacity: 1 }}
                    sx={{ "@media (hover: none)": { opacity: 1 } }}
                  >
                    <ActionButton label="Copy" icon={<FiCopy />} onClick={() => handleCopy(msg)} />
                    {msg.text && <ActionButton label="Read aloud" icon={<FiVolume2 />} onClick={() => speakMessage(msg.text)} />}
                    {msg.fromUser && !msg.image && (
                      <ActionButton
                        label="Edit"
                        icon={<FiEdit2 />}
                        onClick={() => {
                          setEditingIndex(msg.idx);
                          setEditingText(msg.text || "");
                        }}
                      />
                    )}
                    <ActionButton
                      label="Delete"
                      icon={<FiTrash2 />}
                      isLoading={deletingIndex === msg.idx}
                      onClick={() => handleDelete(msg)}
                    />
                  </HStack>
                )}
              </Flex>
            );
          })}

          {(sending || editingLoading) && <TypingIndicator />}
        </Box>
      </Box>

      <Box
        flexShrink={0}
        px={{ base: 3, sm: 4, md: 6 }}
        pt={2}
        pb="max(12px, env(safe-area-inset-bottom))"
        bg="bg.canvas"
      >
        <Box maxW="820px" mx="auto">
          <Composer
            value={input}
            onChange={setInput}
            onSend={handleSend}
            attachment={attachment}
            onAttach={setAttachment}
            isSending={sending}
          />
          <Text fontSize="xs" color="text.muted" textAlign="center" mt={2} display={{ base: "none", sm: "block" }}>
            GH-GPT can make mistakes. Check important info.
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

export default ChatPage;
