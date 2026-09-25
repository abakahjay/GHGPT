import {
	Avatar,
	Button,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	SimpleGrid,
	Stack,
	Textarea,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { useProfilePic } from "../../utils/imageUrl";
import { unwrapUser } from "../../utils/auth";
import usePreviewImg from "../../hooks/usePreviewing";
import useEditProfile from "../../hooks/useEditProfile";

const EditProfile = ({ isOpen, onClose }) => {
	const { editProfile, isUpdating } = useEditProfile();
	const user = unwrapUser(useAuthStore((state) => state.user));
	const url = useProfilePic(user);
	const fileRef = useRef(null);
	const navigate = useNavigate();
	const { selectedFile, handleImageChange, formDatas, setSelectedFile } = usePreviewImg();

	const [inputs, setInputs] = useState({
		firstName: user.firstName || "",
		lastName: user.lastName || "",
		username: user.username || "",
		bio: user.bio || "",
	});
	const update = (field) => (e) => setInputs({ ...inputs, [field]: e.target.value });

	const handleEditProfile = async () => {
		const updated = await editProfile(inputs, selectedFile, formDatas, user.username);
		if (!updated) return;
		setSelectedFile(null);
		onClose();
		if (updated.username !== user.username) navigate(`/${updated.username}`, { replace: true });
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "lg" }} scrollBehavior="inside">
			<ModalOverlay backdropFilter="blur(4px)" />
			<ModalContent borderWidth="1px" borderColor="border.default" mx={{ base: 0, sm: 4 }}>
				<ModalHeader>Edit profile</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Stack spacing={5}>
						<Stack direction={{ base: "column", sm: "row" }} spacing={5} align="center">
							<Avatar size="xl" src={selectedFile || url} name={user.username} />
							<Button w={{ base: "full", sm: "auto" }} variant="outline" onClick={() => fileRef.current.click()}>
								Change picture
							</Button>
							<Input type="file" accept="image/*" hidden ref={fileRef} onChange={handleImageChange} />
						</Stack>

						<SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
							<FormControl>
								<FormLabel fontSize="sm">First name</FormLabel>
								<Input value={inputs.firstName} onChange={update("firstName")} fontSize="16px" />
							</FormControl>
							<FormControl>
								<FormLabel fontSize="sm">Last name</FormLabel>
								<Input value={inputs.lastName} onChange={update("lastName")} fontSize="16px" />
							</FormControl>
						</SimpleGrid>

						<FormControl>
							<FormLabel fontSize="sm">Username</FormLabel>
							<Input value={inputs.username} onChange={update("username")} fontSize="16px" />
						</FormControl>

						<FormControl>
							<FormLabel fontSize="sm">Bio</FormLabel>
							<Textarea value={inputs.bio} onChange={update("bio")} rows={3} fontSize="16px" />
						</FormControl>
					</Stack>
				</ModalBody>
				<ModalFooter gap={3}>
					<Button variant="ghost" onClick={onClose}>Cancel</Button>
					<Button colorScheme="blue" onClick={handleEditProfile} isLoading={isUpdating}>
						Save changes
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default EditProfile;
