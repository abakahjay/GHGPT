import { useEffect, useRef } from "react";
import { Box, CloseButton, Flex, IconButton, Image, Text, Textarea, Tooltip, keyframes } from "@chakra-ui/react";
import { FiArrowUp, FiMic, FiPaperclip, FiSquare } from "react-icons/fi";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import useShowToast from "../../hooks/useShowToast";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.5); }
  100% { box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
`;

const MAX_HEIGHT = 200;

// Prompt box shared by the dashboard and chat page: auto-growing textarea,
// image attach/paste, voice input and send.
// `attachment` is { file, preview } or null.
const Composer = ({
    value,
    onChange,
    onSend,
    attachment,
    onAttach,
    isSending = false,
    isGenerating = false, // an answer is streaming: show Stop instead of Send
    onStop,
    placeholder = "Message GH-GPT",
    autoFocus = false,
}) => {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
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

    const canSend = (value.trim() || attachment) && !isSending && !isGenerating;

    const readImage = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast("Unsupported file", "Please choose an image file.", "error");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => onAttach({ file, preview: reader.result });
        reader.readAsDataURL(file);
    };

    const handlePaste = (e) => {
        const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
        if (item) {
            e.preventDefault();
            readImage(item.getAsFile());
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
            borderColor="border.default"
            borderRadius="2xl"
            boxShadow="sm"
            px={3}
            pt={2}
            pb={2}
            transition="border-color 0.15s, box-shadow 0.15s"
            _focusWithin={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
        >
            {attachment && (
                <Flex align="center" gap={3} p={2} mb={1} bg="bg.subtle" borderRadius="lg" w="fit-content" maxW="full">
                    <Image src={attachment.preview} alt="" boxSize="48px" objectFit="cover" borderRadius="md" />
                    <Box minW={0}>
                        <Text fontSize="sm" noOfLines={1}>{attachment.file.name}</Text>
                        <Text fontSize="xs" color="text.muted">{(attachment.file.size / 1024).toFixed(1)} KB</Text>
                    </Box>
                    <CloseButton size="sm" aria-label="Remove image" onClick={() => onAttach(null)} />
                </Flex>
            )}

            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={isListening ? "Listening…" : placeholder}
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

            <Flex justify="space-between" align="center" mt={1}>
                <Flex gap={1}>
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={fileInputRef}
                        onChange={(e) => {
                            readImage(e.target.files[0]);
                            e.target.value = "";
                        }}
                    />
                    <Tooltip label="Attach image" hasArrow openDelay={400}>
                        <IconButton
                            icon={<FiPaperclip />}
                            aria-label="Attach image"
                            variant="ghost"
                            size="sm"
                            borderRadius="full"
                            fontSize="lg"
                            color="text.muted"
                            onClick={() => fileInputRef.current.click()}
                        />
                    </Tooltip>
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
                </Flex>

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
                        icon={<FiArrowUp />}
                        aria-label="Send message"
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
