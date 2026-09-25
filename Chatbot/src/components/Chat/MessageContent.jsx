import { memo } from "react";
import {
    Box,
    Code,
    Flex,
    Heading,
    IconButton,
    Link,
    ListItem,
    OrderedList,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    UnorderedList,
    useClipboard,
    useColorModeValue,
} from "@chakra-ui/react";
import { FiCheck, FiCopy } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import ChartBlock from "./ChartBlock";

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
            >
                {code}
            </SyntaxHighlighter>
        </Box>
    );
}

// Maps Markdown elements onto themed Chakra components.
const makeComponents = (streaming) => ({
    p: ({ children }) => <Text mb={3} _last={{ mb: 0 }} lineHeight="1.75">{children}</Text>,
    h1: ({ children }) => <Heading as="h3" size="md" mt={4} mb={2}>{children}</Heading>,
    h2: ({ children }) => <Heading as="h4" size="sm" mt={4} mb={2}>{children}</Heading>,
    h3: ({ children }) => <Heading as="h5" size="sm" mt={3} mb={2}>{children}</Heading>,
    ul: ({ children }) => <UnorderedList pl={1} mb={3} spacing={1}>{children}</UnorderedList>,
    ol: ({ children }) => <OrderedList pl={1} mb={3} spacing={1}>{children}</OrderedList>,
    li: ({ children }) => <ListItem lineHeight="1.7">{children}</ListItem>,
    a: ({ href, children }) => <Link href={href} isExternal color="accent" textDecoration="underline">{children}</Link>,
    blockquote: ({ children }) => (
        <Box borderLeftWidth="3px" borderColor="border.default" pl={3} my={3} color="text.muted">{children}</Box>
    ),
    hr: () => <Box as="hr" my={4} borderColor="border.default" />,
    table: ({ children }) => (
        <TableContainer my={3} borderWidth="1px" borderColor="border.default" borderRadius="lg" whiteSpace="normal">
            <Table size="sm">{children}</Table>
        </TableContainer>
    ),
    thead: ({ children }) => <Thead bg="bg.muted">{children}</Thead>,
    tbody: ({ children }) => <Tbody>{children}</Tbody>,
    tr: ({ children }) => <Tr>{children}</Tr>,
    th: ({ children }) => <Th textTransform="none" fontSize="sm" borderColor="border.default" wordBreak="normal" minW="90px">{children}</Th>,
    td: ({ children }) => <Td borderColor="border.default" wordBreak="normal" minW="90px" verticalAlign="top">{children}</Td>,
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
        const match = /language-([\w+-]+)/.exec(className || "");
        const text = String(children ?? "");
        // ```chart blocks from the AI become real charts.
        if (match?.[1] === "chart") return <ChartBlock source={text} streaming={streaming} />;
        // Fenced blocks get a language class or span several lines; everything else is inline.
        if (match || text.includes("\n")) {
            return <CodeBlock language={match?.[1]} code={text.replace(/\n$/, "")} />;
        }
        return <Code fontSize="0.85em" px={1} borderRadius="md">{text}</Code>;
    },
});
const components = makeComponents(false);
const streamingComponents = makeComponents(true);

// Renders a message as GitHub-flavoured Markdown (tables, lists, code blocks...).
const MessageContent = ({ text, streaming = false }) => {
    if (!text) return null;
    return (
        <Box wordBreak="break-word" sx={{ "& > *:first-of-type": { mt: 0 } }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={streaming ? streamingComponents : components}>
                {text}
            </ReactMarkdown>
        </Box>
    );
};

export default memo(MessageContent);
