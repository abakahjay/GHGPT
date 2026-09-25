import { API_URL } from "./config";

// GridFS files (uploads, generated images, documents) are served by this route.
export const fileUrl = (id) => `${API_URL}/api/v1/ai/image/${id}`;

// Converts one backend history entry
// ({ role, parts: [{ text }], img?, attachments? }) into the shape the chat UI renders.
// `img` on a user message is an uploaded picture; on a model message it's an
// image GH-GPT generated.
export const formatMessage = (msg) => {
    const base = {
        text: msg.parts?.[0]?.text || "",
        fromUser: msg.role === "user",
        attachments: (msg.attachments || []).map((a) => ({
            name: a.name,
            size: a.size,
            kind: a.kind,
            url: a.fileId ? fileUrl(a.fileId) : undefined,
        })),
    };
    if (msg.img) {
        return { ...base, type: "image", image: fileUrl(msg.img), fileId: msg.img, generated: msg.role === "model" };
    }
    return { ...base, type: "text" };
};

export const formatHistory = (history) => (history || []).map(formatMessage);
