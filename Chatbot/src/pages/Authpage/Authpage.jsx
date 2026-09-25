import { Flex, HStack, Image, Text } from "@chakra-ui/react";
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
					<Text textAlign="center" fontSize="sm" color="text.muted">Get the app</Text>
					<HStack spacing={4} justify="center">
						<Image src='/playstore.png' h="10" alt='Get it on Google Play' />
						<Image src='/microsoft.png' h="10" alt='Get it from Microsoft' />
					</HStack>
				</Flex>
			</Flex>
		</Flex>
	);
}
