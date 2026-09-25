import { Divider, Flex, VStack, useDisclosure } from "@chakra-ui/react";
import SidebarItems from "./SidebarItems";
import RecentChats from "./RecentChats";
import ProfileMenu from "./ProfileMenu";
import Brand from "../ui/Brand";
import ColorModeToggle from "../ui/ColorModeToggle";
import SettingsModal from "../Settings/SettingsModal";
import { unwrapUser } from "../../utils/auth";

// `compact` renders an icon-only rail (tablet widths); otherwise full labels.
export function SideBar({ authUser, onLogout, compact = false, onNavigate }) {
    const user = unwrapUser(authUser);
    const settings = useDisclosure();

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
                <Brand showText={!compact} size="32px" to="/dashboard" />
                {!compact && <ColorModeToggle />}
            </Flex>

            <VStack spacing={1} align="stretch">
                <SidebarItems authUser={authUser} compact={compact} />
            </VStack>

            {compact ? <Flex flex={1} /> : (
                <>
                    <Divider my={2} borderColor="border.default" />
                    <RecentChats userId={user?._id} />
                </>
            )}

            <VStack spacing={1} align="stretch" pt={2} borderTopWidth={compact ? 0 : "1px"} borderColor="border.default">
                {compact && <Flex justify="center"><ColorModeToggle /></Flex>}
                <ProfileMenu
                    authUser={authUser}
                    compact={compact}
                    onSettings={settings.onOpen}
                    onLogout={onLogout}
                    onNavigate={onNavigate}
                />
            </VStack>

            <SettingsModal isOpen={settings.isOpen} onClose={settings.onClose} />
        </Flex>
    );
}
