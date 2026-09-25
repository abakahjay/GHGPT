import { useEffect, useState } from "react";
import { Box, chakra, Circle, Flex, HStack, Image, Text, keyframes } from "@chakra-ui/react";
import { FiArrowUp } from "react-icons/fi";
import { TypeAnimation } from "react-type-animation";
import { ChatGptLogo1 } from "../../assets/constants.jsx";

const Logo = chakra(ChatGptLogo1);

const CONVERSATIONS = [
  { user: "Summarize this 10-page report for me.", bot: "Done! Here are the 5 key takeaways, with the numbers that matter most highlighted." },
  { user: "Convert this Python function to JavaScript.", bot: "Here's the JavaScript version — same logic, with async/await instead of callbacks." },
  { user: "Explain Newton's second law simply.", bot: "Force equals mass times acceleration: push a heavier object and it speeds up more slowly." },
  { user: "Write a job post for a React developer.", bot: "Here's a clear job post with responsibilities, requirements and benefits sections." },
  { user: "Give me 5 names for a sci-fi novel.", bot: "Echoes of Kepler, The Last Signal, Starfall Accord, Hollow Orbit and Afterlight." },
];

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Animated product preview for the landing page: a chat window where the
// assistant "types" answers to a rotating set of questions.
export default function ChatShowcase() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("thinking"); // thinking -> answering
  const convo = CONVERSATIONS[index % CONVERSATIONS.length];

  useEffect(() => {
    setPhase("thinking");
    const t = setTimeout(() => setPhase("answering"), 1100);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <Box position="relative" w="full" maxW={{ base: "340px", sm: "400px", md: "420px" }} mx="auto" pt="56px">
      {/* Soft Ghana-flag glow */}
      <Box position="absolute" inset="10% -10% -5% -10%" zIndex={0} pointerEvents="none" filter="blur(60px)" opacity={0.35}>
        <Box position="absolute" top="0" left="5%" w="45%" h="45%" bg="#ce1126" borderRadius="full" />
        <Box position="absolute" top="30%" right="0" w="45%" h="45%" bg="#fcd116" borderRadius="full" />
        <Box position="absolute" bottom="0" left="25%" w="50%" h="45%" bg="#007940" borderRadius="full" />
      </Box>

      {/* Floating bot */}
      <Image
        src="/bot.png"
        alt="GH-GPT robot"
        position="absolute"
        top={0}
        left="50%"
        ml={{ base: "-48px", md: "-56px" }}
        boxSize={{ base: "96px", md: "112px" }}
        zIndex={2}
        animation={`${float} 4s ease-in-out infinite`}
        filter="drop-shadow(0 12px 18px rgba(0,0,0,0.35))"
        pointerEvents="none"
      />

      {/* Chat window */}
      <Box
        position="relative"
        zIndex={1}
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="2xl"
        boxShadow="0 24px 60px -24px rgba(0, 0, 0, 0.45)"
        overflow="hidden"
      >
        <Flex align="center" gap={3} px={4} pt={12} pb={3} borderBottomWidth="1px" borderColor="border.default">
          <Box position="relative">
            <Logo boxSize="32px" />
            <Circle size="10px" bg="green.400" position="absolute" bottom="0" right="0" borderWidth="2px" borderColor="bg.surface" />
          </Box>
          <Box flex={1} lineHeight="short">
            <Text fontWeight="semibold" fontSize="sm">GH-GPT Assistant</Text>
            <Text fontSize="xs" color="green.400">Online</Text>
          </Box>
          <HStack spacing={1.5}>
            {["#ce1126", "#fcd116", "#007940"].map((c) => <Circle key={c} size="8px" bg={c} />)}
          </HStack>
        </Flex>

        <Flex direction="column" gap={3} px={4} py={5} minH={{ base: "200px", md: "220px" }} fontSize="sm">
          <Box
            key={`u-${index}`}
            alignSelf="flex-end"
            maxW="85%"
            bg="bubble.user"
            color="white"
            px={3.5}
            py={2}
            borderRadius="2xl"
            borderBottomRightRadius="sm"
            animation={`${fadeUp} 0.35s ease-out`}
          >
            {convo.user}
          </Box>

          <Flex key={`b-${index}`} gap={2} align="flex-end" maxW="90%" animation={`${fadeUp} 0.35s ease-out`}>
            <Logo boxSize="24px" flexShrink={0} />
            <Box bg="bubble.bot" px={3.5} py={2} borderRadius="2xl" borderBottomLeftRadius="sm" minH="36px">
              {phase === "thinking" ? (
                <HStack spacing={1} h="20px" align="center">
                  {[0, 1, 2].map((i) => (
                    <Box key={i} boxSize="6px" borderRadius="full" bg="text.muted" animation={`${bounce} 1.2s ${i * 0.16}s infinite ease-in-out`} />
                  ))}
                </HStack>
              ) : (
                <TypeAnimation
                  key={index}
                  sequence={[convo.bot, 2600, () => setIndex((i) => i + 1)]}
                  speed={70}
                  cursor={false}
                  wrapper="span"
                />
              )}
            </Box>
          </Flex>
        </Flex>

        <Flex align="center" gap={2} mx={4} mb={4} px={3} py={2} bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.default">
          <Text flex={1} fontSize="sm" color="text.muted">Ask GH-GPT anything…</Text>
          <Circle size="28px" bg="blue.500" color="white"><FiArrowUp /></Circle>
        </Flex>
      </Box>
    </Box>
  );
}
