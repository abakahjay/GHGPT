import { Avatar, Box, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useProfilePic } from "../../utils/imageUrl";
import { unwrapUser } from "../../utils/auth";
import NavItem from "./NavItem";

const ProfileLink = ({ authUser, compact }) => {
	const user = unwrapUser(authUser);
	const url = useProfilePic(user);
	const { pathname } = useLocation();
	if (!user) return null;

	const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

	return (
		<NavItem
			to={`/${user.username}`}
			icon={<Avatar size="xs" src={url} name={fullName || user.username} />}
			label="Profile"
			compact={compact}
			isActive={pathname === `/${user.username}`}
		>
			<Box lineHeight="short">
				<Text noOfLines={1} fontWeight="semibold">{fullName || user.username}</Text>
				<Text noOfLines={1} fontSize="xs" color="text.muted">@{user.username}</Text>
			</Box>
		</NavItem>
	);
};

export default ProfileLink;
