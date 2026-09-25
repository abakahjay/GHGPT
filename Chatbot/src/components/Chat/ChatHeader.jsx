import {
    Button,
    Flex,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiDownload, FiEdit2, FiMail, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { BsPin, BsPinFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import RenameChatModal from "./RenameChatModal";
import useChatListActions from "../../hooks/useChatListActions";
import { downloadChatMarkdown } from "../../utils/chatExport";
import { displayTitle } from "../../utils/chatTitle";



// Title bar above a conversation with the chat's actions menu.
const ChatHeader = ({ chat, chatId, userId, messages }) => {
    const rename = useDisclosure();
    const confirmDelete = useDisclosure();
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();
    const actions = useChatListActions(userId);
    const title = displayTitle(chat);

    const handleDelete = async () => {
        setDeleting(true);
        const ok = await actions.remove(chatId);
        setDeleting(false);
        if (ok) {
            confirmDelete.onClose();
            navigate("/dashboard", { replace: true });
        }
    };

    return (
        <Flex
            align="center"
            justify="space-between"
            gap={2}
            h="52px"
            px={{ base: 3, md: 5 }}
            flexShrink={0}
            borderBottom="1px solid"
            borderColor="border.default"
            bg="bg.canvas"
        >
            <Text fontWeight="semibold" noOfLines={1} fontSize={{ base: "sm", md: "md" }}>{title}</Text>
            <Menu placement="bottom-end" isLazy>
                <MenuButton as={IconButton} icon={<FiMoreHorizontal />} variant="ghost" size="sm" aria-label="Chat options" />
                <MenuList fontSize="sm" bg="bg.surface" borderColor="border.default" zIndex={20}>
                    <MenuItem icon={<FiEdit2 />} onClick={rename.onOpen} bg="transparent" _hover={{ bg: "bg.hover" }}>Rename</MenuItem>
                    {chat && (
                        <MenuItem icon={chat.pinned ? <BsPinFill /> : <BsPin />} onClick={() => actions.togglePin(chat)} bg="transparent" _hover={{ bg: "bg.hover" }}>
                            {chat.pinned ? "Unpin" : "Pin to top"}
                        </MenuItem>
                    )}
                    <MenuItem icon={<FiMail />} onClick={() => actions.sendByEmail(chatId)} bg="transparent" _hover={{ bg: "bg.hover" }}>Email me this chat</MenuItem>
                    <MenuItem icon={<FiDownload />} onClick={() => downloadChatMarkdown(title, messages)} bg="transparent" _hover={{ bg: "bg.hover" }}>Download (.md)</MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<FiTrash2 />} color="red.400" onClick={confirmDelete.onOpen} bg="transparent" _hover={{ bg: "bg.hover" }}>Delete</MenuItem>
                </MenuList>
            </Menu>

            <RenameChatModal
                isOpen={rename.isOpen}
                onClose={rename.onClose}
                initialTitle={title === "New chat" ? "" : title}
                onSave={(value) => actions.rename(chatId, value)}
            />

            <Modal isOpen={confirmDelete.isOpen} onClose={confirmDelete.onClose} isCentered size={{ base: "xs", sm: "md" }}>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderWidth="1px" borderColor="border.default">
                    <ModalHeader fontSize="lg">Delete chat?</ModalHeader>
                    <ModalBody color="text.muted" fontSize="sm">
                        &ldquo;{title}&rdquo; will be deleted permanently.
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button variant="ghost" onClick={confirmDelete.onClose}>Cancel</Button>
                        <Button colorScheme="red" onClick={handleDelete} isLoading={deleting}>Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default ChatHeader;
