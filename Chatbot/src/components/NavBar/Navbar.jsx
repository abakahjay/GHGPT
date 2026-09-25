import { Avatar, Button, Flex, HStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Brand from "../ui/Brand.jsx";
import ColorModeToggle from "../ui/ColorModeToggle.jsx";
import { unwrapUser } from "../../utils/auth";
import { useProfilePic } from "../../utils/imageUrl";

const Navbar = ({ authUser }) => {
	const user = unwrapUser(authUser);
	const avatar = useProfilePic(user);

	return (
		<Flex
			as="header"
			position="sticky"
			top={0}
			zIndex={10}
			w="100%"
			h={{ base: "60px", md: "68px" }}
			px={{ base: 4, md: 8 }}
			align="center"
			justify="space-between"
			bg="bg.canvas"
			backdropFilter="saturate(180%) blur(8px)"
			borderBottom="1px solid"
			borderColor="border.default"
		>
			<Brand size="32px" fontSize={{ base: "lg", md: "xl" }} />

			<HStack spacing={{ base: 1, md: 3 }}>
				<ColorModeToggle />
				{user ? (
					<>
						<Button as={RouterLink} to="/dashboard" colorScheme="blue" size="sm">
							Open app
						</Button>
						<Avatar
							as={RouterLink}
							to={`/${user.username}`}
							size="sm"
							src={avatar}
							name={[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}
							display={{ base: "none", sm: "flex" }}
						/>
					</>
				) : (
					<>
						<Button as={RouterLink} to="/auth" variant="ghost" size="sm">
							Log in
						</Button>
						<Button as={RouterLink} to="/auth?mode=signup" colorScheme="blue" size="sm">
							Sign up
						</Button>
					</>
				)}
			</HStack>
		</Flex>
	);
};

export default Navbar;
