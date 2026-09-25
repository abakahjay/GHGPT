import { chakra, Flex, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ChatGptLogo1 } from "../../assets/constants.jsx";

const Logo = chakra(ChatGptLogo1);

// GH-GPT logo with the Ghana-flag gradient wordmark.
const Brand = ({ size = "32px", fontSize = "xl", showText = true, to = "/" }) => (
    <Flex as={RouterLink} to={to} align="center" gap={2} flexShrink={0} aria-label="GH-GPT home">
        <Logo boxSize={size} />
        {showText && (
            <Text
                fontSize={fontSize}
                fontWeight="800"
                letterSpacing="-0.02em"
                whiteSpace="nowrap"
                bgGradient="linear(to-r, #ce1126, #e0a800, #007940)"
                bgClip="text"
            >
                GH-GPT
            </Text>
        )}
    </Flex>
);

export default Brand;
