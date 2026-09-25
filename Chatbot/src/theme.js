import { extendTheme } from "@chakra-ui/react";

// Semantic tokens let every page switch between light and dark mode without
// hardcoding colors. Use e.g. bg="bg.surface" / color="text.muted".
const theme = extendTheme({
    config: {
        initialColorMode: "dark",
        useSystemColorMode: false,
    },
    fonts: {
        heading: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
        body: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
    },
    semanticTokens: {
        colors: {
            "bg.canvas": { default: "#f7f7fb", _dark: "#0b0a12" },
            "bg.surface": { default: "#ffffff", _dark: "#15131f" },
            "bg.subtle": { default: "#eef0f6", _dark: "#1d1a2a" },
            "bg.muted": { default: "#e3e6ef", _dark: "#282438" },
            "bg.hover": { default: "blackAlpha.100", _dark: "whiteAlpha.100" },
            "border.default": { default: "blackAlpha.200", _dark: "whiteAlpha.200" },
            "text.default": { default: "gray.800", _dark: "whiteAlpha.900" },
            "text.muted": { default: "gray.500", _dark: "gray.400" },
            "bubble.user": { default: "blue.500", _dark: "blue.600" },
            "bubble.bot": { default: "#eef0f6", _dark: "#211e2f" },
            accent: { default: "blue.500", _dark: "blue.300" },
        },
    },
    styles: {
        global: {
            "html, body, #root": {
                minHeight: "100%",
            },
            body: {
                bg: "bg.canvas",
                color: "text.default",
                overflowX: "clip",
            },
        },
    },
    components: {
        Button: {
            baseStyle: { borderRadius: "lg", fontWeight: "semibold" },
            variants: {
                // Chakra's dark mode turns solid blue into a pale blue with dark
                // text; keep the brand blue with white text in both modes.
                solid: (props) =>
                    props.colorScheme === "blue"
                        ? {
                              bg: "blue.500",
                              color: "white",
                              _hover: { bg: "blue.600", _disabled: { bg: "blue.500" } },
                              _active: { bg: "blue.700" },
                          }
                        : {},
            },
        },
        Modal: {
            baseStyle: {
                dialog: { bg: "bg.surface", borderRadius: "xl" },
            },
        },
        Drawer: {
            baseStyle: {
                dialog: { bg: "bg.surface" },
            },
        },
    },
});

export default theme;
