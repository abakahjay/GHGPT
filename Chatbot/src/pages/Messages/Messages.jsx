import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { FiMessageSquare, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import useAiChatActions from "../../hooks/useAiChatActions";
import useAiChatStore from "../../store/useAiChatStore";
import { unwrapUser } from "../../utils/auth";
import { timeAgo } from "../../utils/timeAgo";

import { displayTitle as chatTitle } from "../../utils/chatTitle";

const MessagesPage = ({ authUser }) => {
  const userId = unwrapUser(authUser)?._id;
  const { fetchUserChats, removeUserChat, isLoading } = useAiChatActions();
  const userChats = useAiChatStore((state) => state.userChats);
  const [filter, setFilter] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (userId) fetchUserChats(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const chats = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return [...userChats].reverse().filter((c) => !q || chatTitle(c).toLowerCase().includes(q));
  }, [userChats, filter]);

  const handleDelete = async (chatId) => {
    setDeleting(chatId);
    await removeUserChat(userId, chatId);
    setDeleting(null);
  };

  return (
    <Box maxW="820px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
      <Flex align={{ base: "stretch", sm: "center" }} justify="space-between" gap={4} mb={6} direction={{ base: "column", sm: "row" }}>
        <Box>
          <Heading size="lg" letterSpacing="-0.02em">Chat history</Heading>
          <Text color="text.muted" fontSize="sm" mt={1}>
            {userChats.length} conversation{userChats.length === 1 ? "" : "s"}
          </Text>
        </Box>
        <Button as={RouterLink} to="/dashboard" leftIcon={<FiPlus />} colorScheme="blue" size="sm">
          New chat
        </Button>
      </Flex>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none" color="text.muted"><FiSearch /></InputLeftElement>
        <Input
          placeholder="Filter by title"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          bg="bg.surface"
          borderColor="border.default"
          fontSize="16px"
        />
      </InputGroup>

      <Box bg="bg.surface" borderWidth="1px" borderColor="border.default" borderRadius="xl" overflow="hidden">
        {isLoading && userChats.length === 0 ? (
          <Stack p={4} spacing={3}>
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} h="44px" borderRadius="md" />)}
          </Stack>
        ) : chats.length === 0 ? (
          <Flex direction="column" align="center" py={14} px={4} gap={2} color="text.muted" textAlign="center">
            <FiMessageSquare size={28} />
            <Text>{filter ? "No chats match your filter." : "No chats yet. Start a new one!"}</Text>
          </Flex>
        ) : (
          chats.map((chat, i) => (
            <Flex
              key={chat.chatId}
              as={RouterLink}
              to={`/chat/${chat.chatId}`}
              align="center"
              gap={3}
              px={4}
              py={3}
              borderTopWidth={i === 0 ? 0 : "1px"}
              borderColor="border.default"
              _hover={{ bg: "bg.hover" }}
              role="group"
            >
              <Box color="text.muted" flexShrink={0}><FiMessageSquare /></Box>
              <Box flex={1} minW={0}>
                <Text fontWeight="medium" noOfLines={1}>{chatTitle(chat)}</Text>
                <Text fontSize="xs" color="text.muted">{chat.createdAt ? timeAgo(new Date(chat.createdAt).getTime()) : ""}</Text>
              </Box>
              <Tooltip label="Delete chat" hasArrow openDelay={400}>
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Delete chat"
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  isLoading={deleting === chat.chatId}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(chat.chatId);
                  }}
                />
              </Tooltip>
            </Flex>
          ))
        )}
      </Box>
    </Box>
  );
};

export default MessagesPage;
