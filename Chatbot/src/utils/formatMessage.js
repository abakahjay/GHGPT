import { API_URL } from "./config";

// Converts one backend history entry ({ role, parts: [{ text }], img? })
// into the shape the chat UI renders.
export const formatMessage = (msg) => {
    const base = {
        text: msg.parts?.[0]?.text || "",
        fromUser: msg.role === "user",
    };
    if (msg.img) {
        return {
            ...base,
            type: "image",
            image: `${API_URL}/api/v1/ai/image/${msg.img}`,
            fileId: msg.img,
        };
    }
    return { ...base, type: "text" };
};

export const formatHistory = (history) => (history || []).map(formatMessage);
