import {
    Box,
    Drawer,
    DrawerContent,
    DrawerOverlay,
    Flex,
    IconButton,
    useDisclosure,
} from "@chakra-ui/react";
import { FiMenu, FiEdit } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { SideBar } from '../../components/SideBar/SideBar.jsx'
import Brand from "../../components/ui/Brand.jsx";
import ColorModeToggle from "../../components/ui/ColorModeToggle.jsx";

// Shell for logged-in pages:
//   - phones (< md): top bar + slide-out drawer
//   - tablets (md): 72px icon rail
//   - desktops (lg+): 264px sidebar with labels and recent chats
const PageLayout = ({ authUser, onLogout, children }) => {
    const drawer = useDisclosure();

    return (
        <Flex h="100dvh" w="100%" overflow="hidden" bg="bg.canvas">
            {/* Tablet icon rail */}
            <Box
                as="nav"
                display={{ base: "none", md: "block", lg: "none" }}
                w="72px"
                flexShrink={0}
                borderRight="1px solid"
                borderColor="border.default"
                bg="bg.surface"
            >
                <SideBar authUser={authUser} onLogout={onLogout} compact />
            </Box>

            {/* Desktop sidebar */}
            <Box
                as="nav"
                display={{ base: "none", lg: "block" }}
                w="264px"
                flexShrink={0}
                borderRight="1px solid"
                borderColor="border.default"
                bg="bg.surface"
            >
                <SideBar authUser={authUser} onLogout={onLogout} />
            </Box>

            {/* Mobile drawer */}
            <Drawer isOpen={drawer.isOpen} onClose={drawer.onClose} placement="left" size="xs">
                <DrawerOverlay backdropFilter="blur(2px)" />
                <DrawerContent maxW="280px">
                    <SideBar authUser={authUser} onLogout={onLogout} onNavigate={drawer.onClose} />
                </DrawerContent>
            </Drawer>

            <Flex direction="column" flex={1} minW={0} h="100%">
                {/* Mobile top bar */}
                <Flex
                    display={{ base: "flex", md: "none" }}
                    align="center"
                    justify="space-between"
                    h="56px"
                    px={2}
                    flexShrink={0}
                    borderBottom="1px solid"
                    borderColor="border.default"
                    bg="bg.surface"
                >
                    <IconButton
                        aria-label="Open menu"
                        icon={<FiMenu />}
                        variant="ghost"
                        fontSize="xl"
                        onClick={drawer.onOpen}
                    />
                    <Brand size="26px" fontSize="lg" to="/dashboard" />
                    <Flex gap={1}>
                        <ColorModeToggle />
                        <IconButton
                            as={RouterLink}
                            to="/dashboard"
                            aria-label="New chat"
                            icon={<FiEdit />}
                            variant="ghost"
                            size="sm"
                            fontSize="lg"
                        />
                    </Flex>
                </Flex>

                <Box as="main" flex={1} minH={0} overflowY="auto">
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
};

export default PageLayout;
