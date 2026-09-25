import { useEffect, useState } from "react";

// Chrome/Edge (Android, Windows, Mac, Linux) fire `beforeinstallprompt` once,
// early. We keep it so an "Install" button can open the native install dialog.
// Safari (iPhone/iPad/Mac) has no prompt: users use Share -> Add to Home Screen
// (or File -> Add to Dock on Mac), which the install page explains.
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault(); // we show our own button instead of the mini-infobar
        deferredPrompt = e;
        notify();
    });
    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        notify();
    });
}

export const isStandalone = () =>
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

export function detectPlatform() {
    const ua = navigator.userAgent || "";
    const isIPad = /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (/iPhone|iPod/.test(ua) || isIPad) return "ios";
    if (/Android/.test(ua)) return "android";
    if (/Windows/.test(ua)) return "windows";
    if (/Mac OS X|Macintosh/.test(ua)) return "mac";
    return "other";
}

export function useInstallPrompt() {
    const [, force] = useState(0);
    useEffect(() => {
        const fn = () => force((n) => n + 1);
        listeners.add(fn);
        return () => listeners.delete(fn);
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return "unavailable";
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        notify();
        return outcome; // 'accepted' | 'dismissed'
    };

    return { canPrompt: Boolean(deferredPrompt), promptInstall, installed: isStandalone() };
}
