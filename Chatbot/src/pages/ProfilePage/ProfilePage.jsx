import {
	Avatar,
	Box,
	Button,
	Divider,
	Flex,
	Heading,
	HStack,
	Skeleton,
	SkeletonCircle,
	Stack,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { MdEmail, MdEdit } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import { useGetUser } from "../../hooks/useGetUser";
import { useProfilePic } from "../../utils/imageUrl";
import { unwrapUser } from "../../utils/auth";
import EditProfile from "../../components/Profile/EditProfile";

function DetailRow({ label, icon, children }) {
	return (
		<Box>
			<Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" letterSpacing="wider" mb={2}>
				{label}
			</Text>
			<HStack spacing={3} align="center" wordBreak="break-all">
				<Box color="text.muted" flexShrink={0}>{icon}</Box>
				{children}
			</HStack>
		</Box>
	);
}

export function ProfilePage({ authUser }) {
	const me = unwrapUser(authUser);
	const { username } = useParams();
	const { isLoading, userProfile } = useGetUser(username);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const isOwnProfile = me?.username === username;
	// Our own profile comes from the session (it includes private fields like
	// email); anyone else's comes from the public lookup.
	const fetched = userProfile?.user;
	const profile = isOwnProfile ? me : fetched?.username === username ? fetched : null;
	const avatar = useProfilePic(profile);

	if (!isLoading && !profile && !isOwnProfile) return <UserNotFound />;

	const fullName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") : "";

	return (
		<Box maxW="820px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
			<Flex justify="space-between" align="center" mb={6} gap={4}>
				<Box>
					<Heading size="lg" letterSpacing="-0.02em">{isOwnProfile ? "Your account" : "Profile"}</Heading>
					{isOwnProfile && <Text color="text.muted" fontSize="sm" mt={1}>Manage your account info.</Text>}
				</Box>
				{isOwnProfile && profile && (
					<Button leftIcon={<MdEdit />} size="sm" variant="outline" borderColor="border.default" onClick={onOpen} flexShrink={0}>
						Edit profile
					</Button>
				)}
			</Flex>

			<Box bg="bg.surface" borderWidth="1px" borderColor="border.default" borderRadius="2xl" p={{ base: 5, md: 8 }}>
				{!profile ? (
					<HStack spacing={4}>
						<SkeletonCircle size="20" />
						<Stack flex={1}>
							<Skeleton h="20px" w="50%" />
							<Skeleton h="14px" w="30%" />
						</Stack>
					</HStack>
				) : (
					<>
						<Stack direction={{ base: "column", sm: "row" }} spacing={5} align={{ base: "center", sm: "center" }} textAlign={{ base: "center", sm: "left" }}>
							<Avatar size="xl" name={fullName || profile.username} src={avatar} />
							<Box minW={0}>
								<Text fontSize="2xl" fontWeight="bold" noOfLines={1}>{fullName || profile.username}</Text>
								<Text color="text.muted">@{profile.username}</Text>
								{profile.bio && <Text mt={2} fontSize="sm">{profile.bio}</Text>}
							</Box>
						</Stack>

						{isOwnProfile && (
							<>
								<Divider my={6} borderColor="border.default" />
								<Stack spacing={6}>
									<DetailRow label="Email address" icon={<MdEmail />}>
										<Text>{profile.email}</Text>
										<Text fontSize="xs" color="text.muted" flexShrink={0}>Primary</Text>
									</DetailRow>
									{profile.profile_picture?.includes("googleusercontent") && (
										<DetailRow label="Connected accounts" icon={<FaGoogle />}>
											<Text>Google · {profile.email}</Text>
										</DetailRow>
									)}
								</Stack>
							</>
						)}
					</>
				)}
			</Box>

			{isOpen && <EditProfile isOpen={isOpen} onClose={onClose} />}
		</Box>
	);
}

const UserNotFound = () => {
	return (
		<Flex direction="column" align="center" textAlign="center" py={20} px={4} gap={3}>
			<Heading size="md">User not found</Heading>
			<Text color="text.muted">This profile doesn&apos;t exist or has been removed.</Text>
			<Button as={RouterLink} to="/dashboard" colorScheme="blue" size="sm">
				Back to chat
			</Button>
		</Flex>
	);
};
