import { Avatar, Box, Flex, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Portal, Text } from "@chakra-ui/react";
import { BiLogOut } from "react-icons/bi";
import { FiDownload, FiSettings, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { unwrapUser } from "../../utils/auth";
import { useProfilePic } from "../../utils/imageUrl";

// Account button at the bottom of the sidebar (like ChatGPT/Claude):
// profile, settings, get the app, log out.
const ProfileMenu = ({ authUser, compact, onSettings, onLogout, onNavigate }) => {
    const user = unwrapUser(authUser);
    const avatar = useProfilePic(user);
    const navigate = useNavigate();
    if (!user) return null;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;

    const go = (path) => {
        navigate(path);
        onNavigate?.();
    };

    return (
        <Menu placement={compact ? "right-end" : "top"} isLazy>
            <MenuButton
                as={Flex}
                role="button"
                tabIndex={0}
                align="center"
                gap={3}
                px={compact ? 0 : 2}
                py={2}
                w="full"
                justifyContent={compact ? "center" : "flex-start"}
                borderRadius="lg"
                cursor="pointer"
                _hover={{ bg: "bg.hover" }}
                aria-label="Account menu"
            >
                <Flex align="center" gap={3} justify={compact ? "center" : "flex-start"}>
                    <Avatar size="sm" src={avatar} name={fullName} />
                    {!compact && (
                        <Box minW={0} lineHeight="short" textAlign="left">
                            <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{fullName}</Text>
                            <Text fontSize="xs" color="text.muted" noOfLines={1}>@{user.username}</Text>
                        </Box>
                    )}
                </Flex>
            </MenuButton>
            <Portal>
                <MenuList fontSize="sm" bg="bg.surface" borderColor="border.default" zIndex="popover" minW="220px">
                    <MenuItem icon={<FiUser />} bg="transparent" _hover={{ bg: "bg.hover" }} onClick={() => go(`/${user.username}`)}>Profile</MenuItem>
                    <MenuItem icon={<FiSettings />} bg="transparent" _hover={{ bg: "bg.hover" }} onClick={onSettings}>Settings</MenuItem>
                    <MenuItem icon={<FiDownload />} bg="transparent" _hover={{ bg: "bg.hover" }} onClick={() => go("/install")}>Get the app</MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<BiLogOut />} bg="transparent" _hover={{ bg: "bg.hover" }} onClick={() => onLogout?.(user._id)}>Log out</MenuItem>
                </MenuList>
            </Portal>
        </Menu>
    );
};

export default ProfileMenu;
