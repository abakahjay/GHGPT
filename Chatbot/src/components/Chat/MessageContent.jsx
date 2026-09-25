import { Fragment } from "react";
import { Box, Code, Flex, IconButton, Text, useClipboard, useColorModeValue } from "@chakra-ui/react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const CODE_BLOCK = /```[ \t]*([\w+-]*)[^\n]*\n([\s\S]*?)```/g;

function CodeBlock({ language, code }) {
    const { hasCopied, onCopy } = useClipboard(code);
    const style = useColorModeValue(oneLight, oneDark);

    return (
        <Box my={3} borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="border.default" maxW="100%">
            <Flex justify="space-between" align="center" px={3} py={1} bg="bg.muted" fontSize="xs" color="text.muted">
                <Text>{language || "code"}</Text>
                <IconButton
                    icon={hasCopied ? <FiCheck /> : <FiCopy />}
                    aria-label="Copy code"
                    size="xs"
                    variant="ghost"
                    onClick={onCopy}
                />
            </Flex>
            <SyntaxHighlighter
                language={language || "text"}
                style={style}
                customStyle={{ margin: 0, padding: "1em", fontSize: "0.85rem", borderRadius: 0, overflowX: "auto" }}
                wrapLongLines={false}
            >
                {code.replace(/\n$/, "")}
            </SyntaxHighlighter>
        </Box>
    );
}

// Inline `code` and **bold**; everything else is plain text.
function InlineText({ text }) {
    const parts = text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g);
    return (
        <Text as="div" whiteSpace="pre-wrap" wordBreak="break-word" lineHeight="1.7">
            {parts.map((part, i) => {
                if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
                    return <Code key={i} fontSize="0.85em" px={1} borderRadius="md">{part.slice(1, -1)}</Code>;
                }
                if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return <Fragment key={i}>{part}</Fragment>;
            })}
        </Text>
    );
}

// Renders an AI/user message: fenced code blocks get syntax highlighting.
const MessageContent = ({ text }) => {
    if (!text) return null;
    const elements = [];
    let lastIndex = 0;
    let match;
    CODE_BLOCK.lastIndex = 0;

    while ((match = CODE_BLOCK.exec(text)) !== null) {
        const [full, language, code] = match;
        if (match.index > lastIndex) {
            elements.push(<InlineText key={`t-${lastIndex}`} text={text.slice(lastIndex, match.index)} />);
        }
        elements.push(<CodeBlock key={`c-${match.index}`} language={language} code={code} />);
        lastIndex = match.index + full.length;
    }
    if (lastIndex < text.length) {
        elements.push(<InlineText key={`t-${lastIndex}`} text={text.slice(lastIndex)} />);
    }
    return <>{elements}</>;
};

export default MessageContent;
