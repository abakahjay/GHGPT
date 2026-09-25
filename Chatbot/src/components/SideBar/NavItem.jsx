import { Box, Flex, Spinner, Tooltip } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

// One sidebar row. In compact mode only the icon shows and the label moves
// into a tooltip.
const NavItem = ({ icon, label, to, onClick, isActive, compact, isLoading, children }) => {
    const linkProps = to ? { as: RouterLink, to } : { as: "button", type: "button", onClick };

    return (
        <Tooltip label={label} placement="right" hasArrow openDelay={300} isDisabled={!compact}>
            <Flex
                {...linkProps}
                align="center"
                gap={3}
                px={compact ? 0 : 3}
                py={2}
                w="full"
                minH="40px"
                justify={compact ? "center" : "flex-start"}
                borderRadius="lg"
                fontSize="sm"
                fontWeight={isActive ? "semibold" : "medium"}
                bg={isActive ? "bg.muted" : "transparent"}
                color="text.default"
                _hover={{ bg: isActive ? "bg.muted" : "bg.hover" }}
                transition="background 0.15s"
                aria-label={compact ? label : undefined}
                textAlign="left"
            >
                <Flex fontSize="lg" flexShrink={0} align="center" justify="center" boxSize="24px">
                    {isLoading ? <Spinner size="sm" /> : icon}
                </Flex>
                {!compact && (
                    <Box flex={1} noOfLines={1}>
                        {children || label}
                    </Box>
                )}
            </Flex>
        </Tooltip>
    );
};

export default NavItem;
