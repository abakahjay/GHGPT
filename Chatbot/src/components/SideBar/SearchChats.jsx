import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { FiSearch, FiTrash2, FiMessageSquare } from "react-icons/fi";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchChats } from "../../hooks/useSearchChats";
import useAiChatActions from "../../hooks/useAiChatActions";
import { unwrapUser } from "../../utils/auth";
import NavItem from "./NavItem";

const SearchChats = ({ authUser, compact }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { removeUserChat } = useAiChatActions();
  const userId = unwrapUser(authUser)?._id;
  const [hasSearched, setHasSearched] = useState(false);
  const { chats, isLoading, searchChatsByTitle, setChats } = useSearchChats(userId);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchRef.current.value.trim();
    if (query) {
      setHasSearched(true);
      searchChatsByTitle(query);
    }
  };

  const openChat = (chatId) => {
    onClose();
    navigate(`/chat/${chatId}`);
  };

  return (
    <>
      <NavItem icon={<FiSearch />} label="Search chats" compact={compact} onClick={onOpen} />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={searchRef}
        size={{ base: "full", sm: "lg" }}
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderWidth="1px" borderColor="border.default" mx={{ base: 0, sm: 4 }}>
          <ModalHeader fontSize="lg">Search chats</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSearch}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="text.muted">
                  {isLoading ? <Spinner size="sm" /> : <FiSearch />}
                </InputLeftElement>
                <Input
                  ref={searchRef}
                  placeholder="Search by chat title and press Enter"
                  bg="bg.subtle"
                  borderColor="border.default"
                  fontSize="16px"
                />
              </InputGroup>
            </form>

            <VStack align="stretch" spacing={1} mt={4}>
              {hasSearched && !isLoading && chats.length === 0 && (
                <Text color="text.muted" textAlign="center" py={6}>
                  No similar chats found
                </Text>
              )}

              {chats.map((chat) => (
                <Flex
                  key={chat.chatId}
                  align="center"
                  gap={3}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: "bg.hover" }}
                  onClick={() => openChat(chat.chatId)}
                >
                  <Box color="text.muted"><FiMessageSquare /></Box>
                  <Box flex={1} minW={0}>
                    <Text fontWeight="medium" noOfLines={1} fontSize="sm">
                      {chat.title && chat.title !== "." ? chat.title : "New chat"}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      {new Date(chat.createdAt).toLocaleString()}
                    </Text>
                  </Box>
                  <IconButton
                    icon={<FiTrash2 />}
                    aria-label="Delete chat"
                    variant="ghost"
                    colorScheme="red"
                    size="sm"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await removeUserChat(userId, chat.chatId);
                      setChats((prev) => prev.filter((c) => c.chatId !== chat.chatId));
                    }}
                  />
                </Flex>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SearchChats;
