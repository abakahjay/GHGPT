import { useCallback, useEffect, useRef, useState } from "react";
import useShowToast from "./useShowToast";

// Browser speech-to-text. Each final result is handed to `onResult`.
const useSpeechRecognition = (onResult) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const onResultRef = useRef(onResult);
    const showToast = useShowToast();

    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => () => recognitionRef.current?.abort(), []);

    const start = useCallback(() => {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) {
            showToast("Not supported", "Voice input isn't supported in this browser. Try Chrome or Edge.", "warning");
            return;
        }
        const recognition = new Recognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            if (text) onResultRef.current?.(text);
        };
        recognition.onerror = (event) => {
            if (event.error !== "aborted" && event.error !== "no-speech") {
                showToast("Voice input", `Microphone error: ${event.error}`, "error");
            }
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [showToast]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    const toggle = useCallback(() => (isListening ? stop() : start()), [isListening, start, stop]);

    return { isListening, start, stop, toggle };
};

export default useSpeechRecognition;
