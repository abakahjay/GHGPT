import { useEffect, useRef, useState } from "react";
import {
    Box,
    CloseButton,
    Flex,
    HStack,
    Icon,
    IconButton,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    Tag,
    TagCloseButton,
    TagLabel,
    TagLeftIcon,
    Text,
    Textarea,
    Tooltip,
    keyframes,
} from "@chakra-ui/react";
import { FiArrowUp, FiFileText, FiImage, FiMic, FiPaperclip, FiPlus, FiSquare } from "react-icons/fi";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import useShowToast from "../../hooks/useShowToast";
import { DOCUMENT_ACCEPT, isDocumentFile } from "../../utils/ghgptApi";
import { formatBytes } from "../../utils/formatBytes";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.5); }
  100% { box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
`;

const MAX_HEIGHT = 200;
const MAX_DOCS = 5;
const MAX_DOC_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;


// Prompt box shared by the dashboard and chat page: auto-growing textarea,
// images + documents (attach, paste or drop), the "Create image" tool, voice
// input and send/stop.
// `attachments` is an array of { key, kind: 'image'|'doc', file, preview? };
// `onAttachmentsChange` receives the new array. `tool` is null or 'image'.
const Composer = ({
    value,
    onChange,
    onSend,
    attachments = [],
    onAttachmentsChange,
    tool = null,
    onToolChange,
    isSending = false,
    isGenerating = false, // an answer is streaming: show Stop instead of Send
    onStop,
    placeholder = "Message GH-GPT",
    autoFocus = false,
}) => {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const showToast = useShowToast();
    const { isListening, toggle } = useSpeechRecognition((text) =>
        onChange((prev) => (prev ? `${prev} ${text}` : text))
    );

    // Grow with content up to MAX_HEIGHT, then scroll.
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    }, [value]);

    const canSend = (value.trim() || attachments.length) && !isSending && !isGenerating;

    const addFiles = (fileList) => {
        const files = [...(fileList || [])];
        if (!files.length) return;
        let next = [...attachments];
        const readers = [];
        for (const file of files) {
            if (file.type.startsWith("image/")) {
                if (file.size > MAX_IMAGE_BYTES) {
                    showToast("Image too large", `${file.name} is over 10 MB.`, "error");
                    continue;
                }
                // One picture per message: a new one replaces the old.
                next = next.filter((a) => a.kind !== "image");
                const item = { key: `${Date.now()}-${file.name}`, kind: "image", file, preview: null };
                next.push(item);
                readers.push(new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        item.preview = reader.result;
                        resolve();
                    };
                    reader.readAsDataURL(file);
                }));
            } else if (isDocumentFile(file)) {
                if (file.size > MAX_DOC_BYTES) {
                    showToast("File too large", `${file.name} is over 20 MB.`, "error");
                    continue;
                }
                if (next.filter((a) => a.kind === "doc").length >= MAX_DOCS) {
                    showToast("Too many files", `Attach up to ${MAX_DOCS} documents per message.`, "warning");
                    break;
                }
                next.push({ key: `${Date.now()}-${file.name}`, kind: "doc", file });
            } else {
                showToast("Unsupported file", `${file.name}: attach images, PDF, Word, Excel, CSV, PowerPoint or text files.`, "error");
            }
        }
        if (tool === "image" && next.length) onToolChange?.(null); // attachments mean a normal question
        Promise.all(readers).then(() => onAttachmentsChange?.([...next]));
    };

    const removeAttachment = (key) => onAttachmentsChange?.(attachments.filter((a) => a.key !== key));

    const handlePaste = (e) => {
        const files = [...(e.clipboardData?.items || [])]
            .filter((i) => i.kind === "file")
            .map((i) => i.getAsFile())
            .filter(Boolean);
        if (files.length) {
            e.preventDefault();
            addFiles(files);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend) onSend();
        }
    };

    return (
        <Box
            bg="bg.surface"
            borderWidth="1px"
            borderColor={dragging ? "blue.400" : "border.default"}
            borderStyle={dragging ? "dashed" : "solid"}
            borderRadius="2xl"
            boxShadow="sm"
            px={3}
            pt={2}
            pb={2}
            transition="border-color 0.15s, box-shadow 0.15s"
            _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer?.files);
            }}
        >
            {attachments.length > 0 && (
                <Flex gap={2} mb={1} pt={1} overflowX="auto" pb={1}>
                    {attachments.map((a) => (
                        <Flex key={a.key} align="center" gap={2} p={1.5} pr={1} bg="bg.subtle" borderRadius="lg" flexShrink={0} maxW="240px">
                            {a.kind === "image" ? (
                                <Image src={a.preview} alt="" boxSize="40px" objectFit="cover" borderRadius="md" />
                            ) : (
                                <Flex boxSize="40px" align="center" justify="center" borderRadius="md" bg="blue.500" color="white" flexShrink={0}>
                                    <FiFileText />
                                </Flex>
                            )}
                            <Box minW={0}>
                                <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{a.file.name}</Text>
                                <Text fontSize="xs" color="text.muted">{formatBytes(a.file.size)}</Text>
                            </Box>
                            <CloseButton size="sm" aria-label={`Remove ${a.file.name}`} onClick={() => removeAttachment(a.key)} />
                        </Flex>
                    ))}
                </Flex>
            )}

            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={isListening ? "Listening…" : tool === "image" ? "Describe the image you want…" : placeholder}
                autoFocus={autoFocus}
                rows={1}
                resize="none"
                border="none"
                px={1}
                py={2}
                minH="44px"
                maxH={`${MAX_HEIGHT}px`}
                overflowY="auto"
                fontSize="16px"
                _focusVisible={{ boxShadow: "none" }}
                _placeholder={{ color: "text.muted" }}
            />

            <Flex justify="space-between" align="center" mt={1} gap={2}>
                <HStack spacing={1} minW={0}>
                    <input
                        type="file"
                        multiple
                        accept={`image/*,${DOCUMENT_ACCEPT}`}
                        hidden
                        ref={fileInputRef}
                        onChange={(e) => {
                            addFiles(e.target.files);
                            e.target.value = "";
                        }}
                    />
                    <Menu placement="top-start" isLazy>
                        <Tooltip label="Attach or create" hasArrow openDelay={400}>
                            <MenuButton as={IconButton} icon={<FiPlus />} aria-label="Attach files or create an image" variant="ghost" size="sm" borderRadius="full" fontSize="lg" color="text.muted" />
                        </Tooltip>
                        <Portal>
                            <MenuList fontSize="sm" bg="bg.surface" borderColor="border.default" zIndex="popover">
                                <MenuItem icon={<FiPaperclip />} bg="transparent" _hover={{ bg: "bg.hover" }} onClick={() => fileInputRef.current.click()}>
                                    Add photos &amp; files
                                </MenuItem>
                                <MenuItem
                                    icon={<FiImage />}
                                    bg="transparent"
                                    _hover={{ bg: "bg.hover" }}
                                    onClick={() => {
                                        onAttachmentsChange?.([]);
                                        onToolChange?.("image");
                                        textareaRef.current?.focus();
                                    }}
                                >
                                    Create image
                                </MenuItem>
                            </MenuList>
                        </Portal>
                    </Menu>
                    {tool === "image" && (
                        <Tag size="md" borderRadius="full" colorScheme="blue" variant="subtle" flexShrink={0}>
                            <TagLeftIcon as={FiImage} />
                            <TagLabel>Image</TagLabel>
                            <TagCloseButton aria-label="Cancel image mode" onClick={() => onToolChange?.(null)} />
                        </Tag>
                    )}
                    <Tooltip label={isListening ? "Stop listening" : "Voice input"} hasArrow openDelay={400}>
                        <IconButton
                            icon={isListening ? <FiSquare /> : <FiMic />}
                            aria-label={isListening ? "Stop listening" : "Voice input"}
                            variant={isListening ? "solid" : "ghost"}
                            colorScheme={isListening ? "red" : undefined}
                            size="sm"
                            borderRadius="full"
                            fontSize="lg"
                            color={isListening ? undefined : "text.muted"}
                            animation={isListening ? `${pulse} 1.2s infinite` : undefined}
                            onClick={toggle}
                        />
                    </Tooltip>
                </HStack>

                {isGenerating ? (
                    <Tooltip label="Stop generating (Esc)" hasArrow openDelay={400}>
                        <IconButton
                            icon={<FiSquare />}
                            aria-label="Stop generating"
                            isRound
                            size="sm"
                            bg="text.default"
                            color="bg.canvas"
                            _hover={{ opacity: 0.85 }}
                            onClick={onStop}
                        />
                    </Tooltip>
                ) : (
                    <IconButton
                        icon={tool === "image" ? <Icon as={FiImage} /> : <FiArrowUp />}
                        aria-label={tool === "image" ? "Create image" : "Send message"}
                        isRound
                        size="sm"
                        fontSize="lg"
                        colorScheme="blue"
                        isDisabled={!canSend}
                        isLoading={isSending}
                        onClick={onSend}
                    />
                )}
            </Flex>
        </Box>
    );
};

export default Composer;
