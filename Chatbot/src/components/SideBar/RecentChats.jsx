import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Flex,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import { FiEdit2, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { BsPin, BsPinFill } from "react-icons/bs";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import useAiChatActions from "../../hooks/useAiChatActions";
import useChatListActions from "../../hooks/useChatListActions";
import useAiChatStore from "../../store/useAiChatStore";
import { displayTitle } from "../../utils/chatTitle";
import RenameChatModal from "../Chat/RenameChatModal";

const DAY = 24 * 60 * 60 * 1000;

// Buckets chats like ChatGPT's sidebar. Pinned chats come first.
function groupChats(chats) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const today = startOfToday.getTime();
    const groups = [
        { label: "Pinned", items: [] },
        { label: "Today", items: [] },
        { label: "Yesterday", items: [] },
        { label: "Previous 7 days", items: [] },
        { label: "Previous 30 days", items: [] },
        { label: "Older", items: [] },
    ];
    [...chats]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .forEach((chat) => {
            const t = new Date(chat.createdAt || 0).getTime();
            const group = chat.pinned ? 0 : t >= today ? 1 : t >= today - DAY ? 2 : t >= today - 7 * DAY ? 3 : t >= today - 30 * DAY ? 4 : 5;
            groups[group].items.push(chat);
        });
    return groups.filter((g) => g.items.length);
}

function ChatRow({ chat, active, actions, onRename }) {
    const navigate = useNavigate();
    return (
        <Flex
            role="group"
            align="center"
            borderRadius="md"
            bg={active ? "bg.muted" : "transparent"}
            _hover={{ bg: active ? "bg.muted" : "bg.hover" }}
        >
            <Box
                as={RouterLink}
                to={`/chat/${chat.chatId}`}
                flex={1}
                minW={0}
                px={3}
                py={1.5}
                fontSize="sm"
                noOfLines={1}
                color={active ? "text.default" : "text.muted"}
                _groupHover={{ color: "text.default" }}
            >
                {displayTitle(chat)}
            </Box>
            <Menu placement="bottom-end" isLazy>
                <MenuButton
                    as={IconButton}
                    icon={<FiMoreHorizontal />}
                    aria-label="Chat options"
                    size="xs"
                    variant="ghost"
                    mr={1}
                    opacity={active ? 1 : 0}
                    _groupHover={{ opacity: 1 }}
                    _focusVisible={{ opacity: 1 }}
                    _expanded={{ opacity: 1 }}
                    sx={{ "@media (hover: none)": { opacity: 1 } }}
                />
                <Portal>
                <MenuList fontSize="sm" bg="bg.surface" borderColor="border.default" zIndex="popover" minW="160px">
                    <MenuItem icon={<FiEdit2 />} onClick={() => onRename(chat)} bg="transparent" _hover={{ bg: "bg.hover" }}>Rename</MenuItem>
                    <MenuItem icon={chat.pinned ? <BsPinFill /> : <BsPin />} onClick={() => actions.togglePin(chat)} bg="transparent" _hover={{ bg: "bg.hover" }}>
                        {chat.pinned ? "Unpin" : "Pin"}
                    </MenuItem>
                    <MenuItem
                        icon={<FiTrash2 />}
                        color="red.400"
                        bg="transparent"
                        _hover={{ bg: "bg.hover" }}
                        onClick={async () => {
                            const ok = await actions.remove(chat.chatId);
                            if (ok && active) navigate("/dashboard", { replace: true });
                        }}
                    >
                        Delete
                    </MenuItem>
                </MenuList>
                </Portal>
            </Menu>
        </Flex>
    );
}

// Chat history in the expanded sidebar.
export default function RecentChats({ userId }) {
    const userChats = useAiChatStore((state) => state.userChats);
    const { fetchUserChats } = useAiChatActions();
    const actions = useChatListActions(userId);
    const { chatId } = useParams();
    const rename = useDisclosure();
    const [renaming, setRenaming] = useState(null);

    useEffect(() => {
        if (userId) fetchUserChats(userId, { silent: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const groups = useMemo(() => groupChats(userChats), [userChats]);
    if (groups.length === 0) return <Box flex={1} />;

    return (
        <Box flex={1} minH={0} overflowY="auto" mx={-1} px={1} className="scroll-on-hover">
            {groups.map((group) => (
                <Box key={group.label} mb={3}>
                    <Text fontSize="xs" fontWeight="semibold" color="text.muted" px={3} mb={1}>
                        {group.label}
                    </Text>
                    <VStack spacing={0.5} align="stretch">
                        {group.items.map((chat) => (
                            <ChatRow
                                key={chat.chatId}
                                chat={chat}
                                active={String(chat.chatId) === String(chatId)}
                                actions={actions}
                                onRename={(c) => {
                                    setRenaming(c);
                                    rename.onOpen();
                                }}
                            />
                        ))}
                    </VStack>
                </Box>
            ))}
            <RenameChatModal
                isOpen={rename.isOpen}
                onClose={rename.onClose}
                initialTitle={renaming && renaming.title !== "." ? renaming.title : ""}
                onSave={(title) => actions.rename(renaming.chatId, title)}
            />
        </Box>
    );
}
