import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";

const ColorModeToggle = (props) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";

    return (
        <Tooltip label={label} hasArrow openDelay={400}>
            <IconButton
                aria-label={label}
                icon={isDark ? <FiSun /> : <FiMoon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
                fontSize="lg"
                borderRadius="full"
                {...props}
            />
        </Tooltip>
    );
};

export default ColorModeToggle;
