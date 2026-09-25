import { API_URL } from "../utils/config";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import useShowToast from "./useShowToast";
import useProfileStore from "../store/userProfileStore";
import API from "../utils/api";
import { unwrapUser } from "../utils/auth";

// Saves profile fields (and optionally a new picture). Resolves to the
// updated user, or null on failure.
const useEditProfile = () => {
	const [isUpdating, setIsUpdating] = useState(false);
	const authUser = unwrapUser(useAuthStore((state) => state.user));
	const setAuthUser = useAuthStore((state) => state.setAuthUser);
	const setUserProfile = useProfileStore((state) => state.setUserProfile);
	const showToast = useShowToast();

	const editProfile = async (inputs, selectedFile, formDatas, username) => {
		if (isUpdating || !authUser) return null;
		setIsUpdating(true);
		try {
			let pictureId = "";
			if (selectedFile) {
				const res = await fetch(`${API_URL}/api/v1/userse/${username}/editUserProfile`, {
					method: 'PATCH',
					body: formDatas,
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || data.msg || "Failed to upload picture");
				pictureId = data.user?.profile_picture_id;
			}

			const updatedUser = {
				...authUser,
				firstName: inputs.firstName || authUser.firstName,
				lastName: inputs.lastName || authUser.lastName,
				username: inputs.username || authUser.username,
				usernames: inputs.username || authUser.username,
				bio: inputs.bio || authUser.bio,
				profile_picture_id: pictureId || authUser.profile_picture_id,
			};

			const { data } = await API.patch(`/api/v1/users/${username}/editUser`, { updatedUser });
			if (data.error) throw new Error(data.error);

			const merged = { ...authUser, ...(data.user || {}), profile_picture_id: updatedUser.profile_picture_id };
			delete merged.usernames;
			setAuthUser(merged);
			setUserProfile({ user: merged });
			showToast("Success", "Profile updated successfully", "success");
			return merged;
		} catch (error) {
			const message = error.response?.data?.error || error.response?.data?.msg || error.message;
			showToast("Error", message, "error");
			return null;
		} finally {
			setIsUpdating(false);
		}
	};

	return { editProfile, isUpdating };
};

export default useEditProfile;
