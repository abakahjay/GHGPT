import { Flex, HStack, Image, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { AuthForm } from "./AuthForm";
import Brand from "../../components/ui/Brand";
import ColorModeToggle from "../../components/ui/ColorModeToggle";

export function Authpage({ onAuth }) {
	return (
		<Flex direction="column" minH="100dvh" bg="bg.canvas">
			<Flex as="header" h="64px" px={{ base: 4, md: 8 }} align="center" justify="space-between">
				<Brand size="30px" fontSize="lg" />
				<ColorModeToggle />
			</Flex>

			<Flex flex={1} align="center" justify="center" px={4} py={{ base: 6, md: 10 }}>
				<Flex direction="column" gap={4} w="full" maxW="400px">
					<AuthForm onAuth={onAuth} />
					<Link as={RouterLink} to="/install" textAlign="center" fontSize="sm" color="text.muted" _hover={{ color: "accent" }}>
						Get the app for iPhone, Android, Windows &amp; Mac
					</Link>
					<HStack as={RouterLink} to="/install" spacing={4} justify="center">
						<Image src='/playstore.png' h="10" alt='Install on Android' />
						<Image src='/microsoft.png' h="10" alt='Install on Windows' />
					</HStack>
				</Flex>
			</Flex>
		</Flex>
	);
}
