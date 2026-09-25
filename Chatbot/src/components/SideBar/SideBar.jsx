import { useEffect } from "react";
import { Box, Divider, Flex, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import SidebarItems from "./SidebarItems";
import ProfileLink from "./ProfileLink";
import NavItem from "./NavItem";
import Brand from "../ui/Brand";
import ColorModeToggle from "../ui/ColorModeToggle";
import useLogout from '../../hooks/useLogout.js';
import useAiChatActions from "../../hooks/useAiChatActions";
import useAiChatStore from "../../store/useAiChatStore";
import { unwrapUser } from "../../utils/auth";

// Most recent chats, shown in the expanded sidebar.
function RecentChats({ userId, onNavigate }) {
    const userChats = useAiChatStore((state) => state.userChats);
    const { fetchUserChats } = useAiChatActions();
    const { chatId } = useParams();

    useEffect(() => {
        if (userId) fetchUserChats(userId, { silent: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const recent = [...userChats].reverse().slice(0, 15);
    if (recent.length === 0) return null;

    return (
        <Box flex={1} minH={0} overflowY="auto" mx={-1} px={1}>
            <Text fontSize="xs" fontWeight="semibold" color="text.muted" px={3} mb={1} textTransform="uppercase" letterSpacing="wider">
                Recent
            </Text>
            <VStack spacing={0.5} align="stretch">
                {recent.map((chat) => (
                    <Box
                        key={chat.chatId}
                        as={RouterLink}
                        to={`/chat/${chat.chatId}`}
                        onClick={onNavigate}
                        px={3}
                        py={1.5}
                        borderRadius="md"
                        fontSize="sm"
                        noOfLines={1}
                        bg={chat.chatId === chatId ? "bg.muted" : "transparent"}
                        color={chat.chatId === chatId ? "text.default" : "text.muted"}
                        _hover={{ bg: "bg.hover", color: "text.default" }}
                    >
                        {chat.title && chat.title !== "." ? chat.title : "New chat"}
                    </Box>
                ))}
            </VStack>
        </Box>
    );
}

// `compact` renders an icon-only rail (tablet widths); otherwise full labels.
export function SideBar({ authUser, onLogout, compact = false, onNavigate }) {
    const user = unwrapUser(authUser);
    const { isLoading } = useLogout();

    return (
        <Flex
            direction="column"
            h="100%"
            py={4}
            px={compact ? 2 : 3}
            gap={2}
            onClick={(e) => {
                // Close the mobile drawer after following any link inside it.
                if (onNavigate && e.target.closest("a")) onNavigate();
            }}
        >
            <Flex align="center" justify={compact ? "center" : "space-between"} px={compact ? 0 : 2} mb={4}>
                <Brand showText={!compact} size="32px" />
                {!compact && <ColorModeToggle />}
            </Flex>

            <VStack spacing={1} align="stretch">
                <SidebarItems authUser={authUser} compact={compact} />
            </VStack>

            {!compact && (
                <>
                    <Divider my={2} borderColor="border.default" />
                    <RecentChats userId={user?._id} />
                </>
            )}

            <VStack spacing={1} align="stretch" mt="auto" pt={2}>
                {compact && <Flex justify="center"><ColorModeToggle /></Flex>}
                <ProfileLink authUser={authUser} compact={compact} />
                <NavItem
                    icon={<BiLogOut />}
                    label="Log out"
                    compact={compact}
                    isLoading={isLoading}
                    onClick={() => onLogout?.(user?._id)}
                />
            </VStack>
        </Flex>
    );
}
