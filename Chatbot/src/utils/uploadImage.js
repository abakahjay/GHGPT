import useShowToast from "../hooks/useShowToast";
import API from "./api";

// Uploads a new profile picture and resolves to { pictureId }.
export const useUpdatePic = () => {
    const showToast = useShowToast();

    const updateProfileImage = async (selectedFile) => {
        const formDatas = new FormData();
        formDatas.append("profile_pictures", selectedFile);
        try {
            const { data } = await API.patch("/api/v1/uploadFiles/upload-profile-pic", formDatas, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return { pictureId: data.fileId };
        } catch (error) {
            showToast("Error uploading profile picture", "", "error");
            throw new Error("Failed to update image", { cause: error });
        }
    };

    return { updateProfileImage };
};
