import API from "./api";
import { API_URL } from "./config";
import useAuthStore from "../store/useAuthStore";

// Client for the logged-in GH-GPT API (/api/v1/ghgpt) on FullBackendd.

const authHeader = () => {
    const token = useAuthStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Streams an answer (Server-Sent Events). `body` is
 * { prompt?, imageId?, customInstructions?, mode?: 'send'|'regenerate'|'edit', editIndex? }.
 * Calls onEvent({ type: 'token'|'done'|'title'|'error', ... }) for each event.
 * Pass an AbortSignal to stop; the backend saves the partial answer.
 */
export async function streamMessage(chatId, body, { onEvent, signal }) {
    const res = await fetch(`${API_URL}/api/v1/ghgpt/chats/${chatId}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(body),
        signal,
    });
    if (!res.ok || !res.body) {
        let message = `Request failed (${res.status})`;
        try {
            const data = await res.json();
            message = data.msg || data.error || message;
        } catch {
            // not JSON
        }
        throw new Error(message);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let split;
        while ((split = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, split);
            buffer = buffer.slice(split + 2);
            const line = raw.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            let event;
            try {
                event = JSON.parse(line.slice(6));
            } catch {
                continue; // ignore a malformed event
            }
            onEvent(event); // may throw (e.g. on an error event) to end the stream
        }
    }
}

export async function uploadChatImage(file) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await API.post("/api/v1/ghgpt/uploads", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data.fileId;
}

export const renameChat = (chatId, title) =>
    API.patch(`/api/v1/ghgpt/chats/${chatId}/title`, { title }).then((r) => r.data.chat);

export const pinChat = (chatId, pinned) =>
    API.patch(`/api/v1/ghgpt/chats/${chatId}/pin`, { pinned }).then((r) => r.data.chat);

export const emailChat = (chatId) => API.post(`/api/v1/ghgpt/chats/${chatId}/email`).then((r) => r.data);

export const getSettings = () => API.get("/api/v1/ghgpt/settings").then((r) => r.data);

export const setEmailNotifications = (emailNotifications) =>
    API.patch("/api/v1/ghgpt/settings/email", { emailNotifications }).then((r) => r.data);

// A random id per browser, so the backend can spot sign-ins from new devices.
const deviceId = () => {
    try {
        let id = localStorage.getItem("ghgpt-device-id");
        if (!id) {
            id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            localStorage.setItem("ghgpt-device-id", id);
        }
        return id;
    } catch {
        return "unknown-device";
    }
};

// Tells the backend someone signed up / signed in (welcome + new-device emails).
// Fire-and-forget: never blocks or breaks sign-in.
export const sendAuthEvent = (type, token) =>
    API.post(
        "/api/v1/ghgpt/events",
        { type, deviceId: deviceId() },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    ).catch(() => {});

// Custom instructions live in this browser and are sent with every message.
const CI_KEY = "ghgpt-custom-instructions";
export const getCustomInstructions = () => {
    try {
        return localStorage.getItem(CI_KEY) || "";
    } catch {
        return "";
    }
};
export const saveCustomInstructions = (text) => {
    try {
        localStorage.setItem(CI_KEY, text || "");
    } catch {
        // storage unavailable
    }
};
