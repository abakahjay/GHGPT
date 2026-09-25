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
import { FiAlertTriangle, FiArrowDown, FiCopy, FiDownload, FiEdit2, FiFileText, FiRefreshCw, FiTrash2, FiVolume2 } from "react-icons/fi";
import { useParams } from "react-router-dom";
import useShowToast from "../../hooks/useShowToast";
import useGetChat from "../../hooks/useGetChat";
import useDeleteMessage from "../../hooks/useDeleteMessage";
import useAiChatStore from "../../store/useAiChatStore";
import API from "../../utils/api";
import { unwrapUser } from "../../utils/auth";
import { formatHistory } from "../../utils/formatMessage";
import { getCustomInstructions, streamMessage, uploadChatFile, uploadChatImage } from "../../utils/ghgptApi";
import { formatBytes } from "../../utils/formatBytes";
import { ChatGptLogo1 } from "../../assets/constants";
import Composer from "../../components/Chat/Composer";
import MessageContent from "../../components/Chat/MessageContent";
import ChatHeader from "../../components/Chat/ChatHeader";

const BotLogo = chakra(ChatGptLogo1);

// A freshly created chat starts with a "." placeholder message that the
// backend drops once the first real question arrives; it is never shown.
const isPlaceholder = (msg) => msg.fromUser && !msg.image && msg.text === ".";

// Arguments for run() when sending a new message with Composer attachments.
const sendArgs = (text, items = [], tool = null) => {
  const imageItem = items.find((i) => i.kind === "image");
  return [
    {
      mode: "send",
      prompt: text,
      image: imageItem ? imageItem.preview || URL.createObjectURL(imageItem.file) : undefined,
      docs: items.filter((i) => i.kind === "doc").map((i) => ({ name: i.file.name, size: i.file.size })),
      files: items,
    },
    { mode: "send", prompt: text, ...(tool && { tool }) },
  ];
};

// File chips under a user message; saved ones link to the original file.
function AttachmentChips({ items, align = "flex-end" }) {
  if (!items?.length) return null;
  return (
    <Flex gap={2} wrap="wrap" justify={align} mb={1.5}>
      {items.map((a, i) => (
        <Flex
          key={`${a.name}-${i}`}
          as={a.url ? "a" : "div"}
          href={a.url}
          target="_blank"
          rel="noreferrer"
          align="center"
          gap={2}
          px={2.5}
          py={1.5}
          maxW="260px"
          bg="bg.surface"
          color="text.default"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          _hover={a.url ? { bg: "bg.hover" } : undefined}
        >
          <Flex boxSize="30px" flexShrink={0} align="center" justify="center" borderRadius="md" bg="blue.500" color="white">
            <FiFileText />
          </Flex>
          <Box minW={0}>
            <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{a.name}</Text>
            {a.size ? <Text fontSize="xs" color="text.muted">{formatBytes(a.size)}</Text> : null}
          </Box>
        </Flex>
      ))}
    </Flex>
  );
}

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

function ThinkingDots() {
  return (
    <HStack spacing={1.5} h="24px" align="center">
      {[0, 1, 2].map((i) => (
        <Box key={i} boxSize="7px" borderRadius="full" bg="text.muted" animation={`${bounce} 1.2s ${i * 0.16}s infinite ease-in-out`} />
      ))}
    </HStack>
  );
}

function ActionButton({ label, icon, onClick, isLoading }) {
  return (
    <Tooltip label={label} hasArrow openDelay={400}>
      <IconButton icon={icon} aria-label={label} size="xs" variant="ghost" color="text.muted" fontSize="sm" isLoading={isLoading} onClick={onClick} />
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
  const setChats = useAiChatStore((s) => s.setChats);
  const chatEntry = useAiChatStore((s) => s.userChats.find((c) => String(c.chatId) === String(chatId)));

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]); // Composer items: { key, kind, file, preview? }
  const [tool, setTool] = useState(null); // null | 'image'
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deletingIndex, setDeletingIndex] = useState(null);
  // The exchange in progress: { mode, prompt, image, editIndex, error, body }
  const [live, setLive] = useState(null);
  const [liveText, setLiveText] = useState(""); // what's been revealed on screen so far
  const [atBottom, setAtBottom] = useState(true);

  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const targetRef = useRef(""); // full streamed text; liveText catches up to it
  const doneRef = useRef(null); // final history, applied once the reveal finishes
  const handledPending = useRef(null);

  const { chats, isLoading } = useGetChat(userId, chatId);
  const { handleMessageDelete } = useDeleteMessage();
  const generating = Boolean(live && !live.error);

  const reloadChat = useCallback(async () => {
    try {
      const { data } = await API.get(`/api/v1/ai/chats/${userId}/${chatId}`);
      if (mountedRef.current) setChats(formatHistory(data.data?.history));
    } catch {
      // the chat view keeps what it has
    }
  }, [userId, chatId, setChats]);

  // Reveal streamed text smoothly (models often send big chunks at once).
  useEffect(() => {
    if (!live || live.error) return undefined;
    let frame;
    const tick = () => {
      setLiveText((shown) => {
        const target = targetRef.current;
        if (shown.length >= target.length) return shown;
        const backlog = target.length - shown.length;
        return target.slice(0, shown.length + Math.max(2, Math.ceil(backlog / 12)));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [live]);

  // Once the answer is complete and fully revealed, swap in the saved history.
  useEffect(() => {
    if (doneRef.current && liveText.length >= targetRef.current.length) {
      setChats(formatHistory(doneRef.current));
      doneRef.current = null;
      setLive(null);
      setLiveText("");
    }
  }, [liveText, setChats]);

  const run = useCallback(
    async (liveInit, body) => {
      const controller = new AbortController();
      abortRef.current = controller;
      targetRef.current = "";
      doneRef.current = null;
      setLiveText("");
      setLive({ ...liveInit, body, error: null });
      setAtBottom(true);

      let finished = false;
      try {
        // Upload attachments once (a Retry reuses the ids already in body).
        const files = liveInit.files || [];
        if (files.length && !body.uploaded) {
          setLive((l) => (l ? { ...l, status: files.length > 1 ? "Uploading files…" : `Uploading ${files[0].file.name}…` } : l));
          const imageItem = files.find((f) => f.kind === "image");
          const docItems = files.filter((f) => f.kind === "doc");
          const imageId = imageItem ? await uploadChatImage(imageItem.file) : undefined;
          const fileIds = [];
          for (const doc of docItems) fileIds.push((await uploadChatFile(doc.file)).id);
          body = { ...body, imageId, fileIds, uploaded: true };
          setLive((l) => (l ? { ...l, body, status: null } : l));
        }
        await streamMessage(
          chatId,
          { ...body, customInstructions: getCustomInstructions() },
          {
            signal: controller.signal,
            onEvent: (event) => {
              if (event.type === "status") setLive((l) => (l && !l.error ? { ...l, status: event.text } : l));
              if (event.type === "token") targetRef.current += event.text;
              if (event.type === "done") {
                finished = true;
                doneRef.current = event.history;
                if (!targetRef.current) targetRef.current = " "; // let the swap effect run
              }
              // Browsers pause animation frames in background tabs: show everything at once there.
              if (document.hidden) setLiveText(targetRef.current);
              if (event.type === "title") {
                const { userChats, setUserChats } = useAiChatStore.getState();
                setUserChats(userChats.map((c) => (String(c.chatId) === String(chatId) ? { ...c, title: event.title } : c)));
              }
              if (event.type === "error") throw new Error(event.message);
            },
          }
        );
        if (!finished) throw new Error("The connection closed before the answer finished.");
      } catch (err) {
        if (controller.signal.aborted) {
          // Stopped by the user: the backend saved the partial answer.
          setLive(null);
          setLiveText("");
          setTimeout(reloadChat, 400);
          return;
        }
        const message = err.response?.data?.msg || err.message || "Something went wrong.";
        setLive((l) => (l ? { ...l, error: message } : l));
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [chatId, reloadChat]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  // Esc stops generating.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && abortRef.current) stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stop]);

  // Leaving the chat doesn't stop the answer: the server finishes and saves it.
  // This page is keyed by chatId (see ChatRoute), so a finished answer can
  // never be written into another chat's view once we've unmounted.
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Send the message typed on the dashboard once this new chat opens.
  useEffect(() => {
    const pending = useAiChatStore.getState().pendingMessage;
    if (!pending || pending.chatId !== chatId || handledPending.current === chatId) return;
    handledPending.current = chatId;
    useAiChatStore.getState().setPendingMessage(null);
    run(...sendArgs(pending.text, pending.attachments || [], pending.tool));
  }, [chatId, run]);

  // Saved messages with their history index (`idx`, used by edit/delete).
  const saved = useMemo(
    () => chats.map((msg, idx) => ({ ...msg, idx })).filter((msg) => !isPlaceholder(msg)),
    [chats]
  );

  // What's on screen: saved messages adjusted for the exchange in progress.
  const visible = useMemo(() => {
    if (!live) return saved;
    let base = saved;
    if (live.mode === "edit") base = saved.filter((m) => m.idx < live.editIndex);
    if (live.mode === "regenerate") {
      const lastModel = [...saved].reverse().find((m) => !m.fromUser);
      base = saved.filter((m) => m !== lastModel);
    }
    const extra = live.mode === "regenerate"
      ? []
      : [{ fromUser: true, text: live.prompt, image: live.image, attachments: live.docs || [], idx: null, pending: true }];
    return [...base, ...extra];
  }, [saved, live]);

  const lastAnswerIdx = useMemo(() => [...saved].reverse().find((m) => !m.fromUser)?.idx, [saved]);

  // Keep the newest text in view while the user is at the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom) el.scrollTop = el.scrollHeight;
  }, [visible.length, liveText, live, atBottom]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const handleSend = () => {
    const text = input.trim();
    if ((!text && !attachments.length) || generating) return;
    const current = attachments;
    const currentTool = tool;
    setInput("");
    setAttachments([]);
    setTool(null);
    run(...sendArgs(text, current, currentTool));
  };

  const regenerate = () => {
    if (generating) return;
    run({ mode: "regenerate" }, { mode: "regenerate" });
  };

  const saveEdit = () => {
    const text = editingText.trim();
    if (!text || generating) return;
    const index = editingIndex;
    const original = saved.find((m) => m.idx === index);
    setEditingIndex(null);
    run({ mode: "edit", prompt: text, image: original?.image, editIndex: index }, { mode: "edit", prompt: text, editIndex: index });
  };

  const retry = () => {
    if (!live) return;
    const { body, ...rest } = live;
    run({ ...rest, error: null }, body);
  };

  const handleCopy = async (msg) => {
    try {
      if (msg.image && !msg.text) await copyImage(msg.image);
      else await navigator.clipboard.writeText(msg.text || "");
      showToast("Copied", "", "success", 1200);
    } catch {
      showToast("Error", "Couldn't copy to the clipboard.", "error");
    }
  };

  const speak = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, " code block ").replace(/[#*_`>|]/g, ""));
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleDelete = async (msg) => {
    setDeletingIndex(msg.idx);
    await handleMessageDelete({ fileId: msg.fileId, userId, chatId, messageIndex: msg.idx });
    setDeletingIndex(null);
  };

  const renderAssistant = (content, actions) => (
    <Flex gap={3} align="flex-start" w="full">
      <BotLogo boxSize="28px" flexShrink={0} mt={0.5} />
      <Box flex={1} minW={0} fontSize={{ base: "sm", md: "md" }} pt={0.5}>
        {content}
        {actions}
      </Box>
    </Flex>
  );

  return (
    <Flex direction="column" h="100%" position="relative">
      <ChatHeader chat={chatEntry} chatId={chatId} userId={userId} messages={saved} />

      <Box ref={scrollRef} flex={1} minH={0} overflowY="auto" onScroll={onScroll}>
        <Box maxW="780px" mx="auto" px={{ base: 3, sm: 4, md: 6 }} pt={{ base: 4, md: 8 }} pb={6}>
          {isLoading && visible.length === 0 && (
            <Flex justify="center" py={16}><Spinner color="accent" /></Flex>
          )}

          {!isLoading && visible.length === 0 && !live && (
            <Flex direction="column" align="center" textAlign="center" py={16} gap={3} color="text.muted">
              <BotLogo boxSize="44px" />
              <Text fontSize="lg" fontWeight="semibold" color="text.default">Start the conversation</Text>
              <Text fontSize="sm">Ask a question below to get going.</Text>
            </Flex>
          )}

          {visible.map((msg, i) => {
            const key = msg.idx ?? `pending-${i}`;
            const isEditing = msg.idx !== null && editingIndex === msg.idx;

            if (msg.fromUser) {
              return (
                <Flex key={key} role="group" direction="column" align="flex-end" mb={6}>
                  {!isEditing && <AttachmentChips items={msg.attachments} />}
                  <Box
                    display={!isEditing && !msg.text && !msg.image ? "none" : undefined}
                    maxW={{ base: "88%", md: "75%" }}
                    w={isEditing ? "full" : undefined}
                    bg={isEditing ? "transparent" : "bubble.user"}
                    color="white"
                    px={isEditing ? 0 : 4}
                    py={isEditing ? 0 : 2.5}
                    borderRadius="2xl"
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    {isEditing ? (
                      <Box bg="bg.surface" borderWidth="1px" borderColor="border.default" borderRadius="2xl" p={3}>
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              saveEdit();
                            }
                          }}
                          border="none"
                          _focusVisible={{ boxShadow: "none" }}
                          color="text.default"
                          fontSize="16px"
                          rows={3}
                          autoFocus
                        />
                        <HStack justify="flex-end" mt={2}>
                          <Button size="sm" variant="ghost" onClick={() => setEditingIndex(null)}>Cancel</Button>
                          <Button size="sm" colorScheme="blue" onClick={saveEdit} isDisabled={!editingText.trim()}>Send</Button>
                        </HStack>
                      </Box>
                    ) : (
                      <>
                        {msg.image && (
                          <Image src={msg.image} alt="Uploaded" borderRadius="lg" maxH={{ base: "220px", md: "300px" }} objectFit="contain" mb={msg.text ? 2 : 0} />
                        )}
                        {msg.text && <Text whiteSpace="pre-wrap" wordBreak="break-word">{msg.text}</Text>}
                      </>
                    )}
                  </Box>
                  {msg.idx !== null && !isEditing && !live && (
                    <HStack spacing={0} mt={1} opacity={0} transition="opacity 0.15s" _groupHover={{ opacity: 1 }} _focusWithin={{ opacity: 1 }} sx={{ "@media (hover: none)": { opacity: 1 } }}>
                      <ActionButton label="Copy" icon={<FiCopy />} onClick={() => handleCopy(msg)} />
                      {!msg.image && (
                        <ActionButton label="Edit" icon={<FiEdit2 />} onClick={() => { setEditingIndex(msg.idx); setEditingText(msg.text || ""); }} />
                      )}
                      <ActionButton label="Delete" icon={<FiTrash2 />} isLoading={deletingIndex === msg.idx} onClick={() => handleDelete(msg)} />
                    </HStack>
                  )}
                </Flex>
              );
            }

            return (
              <Box key={key} role="group" mb={6}>
                {renderAssistant(
                  <>
                    {msg.image && (
                      <Box position="relative" w="fit-content" maxW="100%" mb={2} role="group">
                        <Image src={msg.image} alt={msg.text || "Generated image"} borderRadius="xl" maxH={{ base: "320px", md: "460px" }} objectFit="contain" boxShadow="md" />
                        <IconButton
                          as="a"
                          href={msg.image}
                          download
                          icon={<FiDownload />}
                          aria-label="Download image"
                          size="sm"
                          position="absolute"
                          top={2}
                          right={2}
                          bg="blackAlpha.600"
                          color="white"
                          _hover={{ bg: "blackAlpha.800" }}
                          borderRadius="full"
                        />
                      </Box>
                    )}
                    <MessageContent text={msg.text} />
                  </>,
                  !live && (
                    <HStack spacing={0} mt={1} ml={-1.5} opacity={msg.idx === lastAnswerIdx ? 1 : 0} transition="opacity 0.15s" _groupHover={{ opacity: 1 }} _focusWithin={{ opacity: 1 }} sx={{ "@media (hover: none)": { opacity: 1 } }}>
                      <ActionButton label="Copy" icon={<FiCopy />} onClick={() => handleCopy(msg)} />
                      <ActionButton label="Read aloud" icon={<FiVolume2 />} onClick={() => speak(msg.text)} />
                      {msg.idx === lastAnswerIdx && <ActionButton label="Regenerate" icon={<FiRefreshCw />} onClick={regenerate} />}
                      <ActionButton label="Delete" icon={<FiTrash2 />} isLoading={deletingIndex === msg.idx} onClick={() => handleDelete(msg)} />
                    </HStack>
                  )
                )}
              </Box>
            );
          })}

          {live && (
            <Box mb={6}>
              {renderAssistant(
                live.error ? (
                  <Flex direction="column" align="flex-start" gap={3} p={3} borderRadius="lg" borderWidth="1px" borderColor="red.300" bg="bg.subtle">
                    <HStack color="red.400" fontSize="sm" align="flex-start">
                      <Box pt={0.5}><FiAlertTriangle /></Box>
                      <Text>{live.error}</Text>
                    </HStack>
                    <Button size="sm" leftIcon={<FiRefreshCw />} onClick={retry}>Retry</Button>
                  </Flex>
                ) : liveText ? (
                  <MessageContent text={liveText} streaming />
                ) : (
                  <HStack spacing={3}>
                    <ThinkingDots />
                    {live.status && <Text fontSize="sm" color="text.muted">{live.status}</Text>}
                  </HStack>
                )
              )}
            </Box>
          )}
        </Box>
      </Box>

      {!atBottom && (
        <IconButton
          icon={<FiArrowDown />}
          aria-label="Scroll to latest"
          isRound
          size="sm"
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          bottom={{ base: "120px", sm: "140px" }}
          zIndex={2}
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          boxShadow="md"
          onClick={scrollToBottom}
        />
      )}

      <Box flexShrink={0} px={{ base: 3, sm: 4, md: 6 }} pt={2} pb="max(12px, env(safe-area-inset-bottom))" bg="bg.canvas">
        <Box maxW="780px" mx="auto">
          <Composer
            value={input}
            onChange={setInput}
            onSend={handleSend}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            tool={tool}
            onToolChange={setTool}
            isGenerating={generating}
            onStop={stop}
          />
          <Text fontSize="xs" color="text.muted" textAlign="center" mt={2} display={{ base: "none", sm: "block" }}>
            GH-GPT can make mistakes. Check important info.
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

// One ChatPage instance per chat, so switching chats starts from a clean state.
export default function ChatRoute(props) {
  const { chatId } = useParams();
  return <ChatPage key={chatId} {...props} />;
}
