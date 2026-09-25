import { Link as RouterLink } from "react-router-dom";
import "./homepage.css";
import { useMemo, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FiArrowRight, FiBriefcase, FiCode, FiEdit3, FiImage, FiMic } from "react-icons/fi";
import Navbar from "../../components/NavBar/Navbar.jsx";

const CONVERSATION = [
  // Productivity
  "User: Summarize this 10-page PDF for me.", 2000, "bot",
  "GH-GPT: Done. Here's a 3-paragraph summary with key bullet points.", 2000, "human2",
  "User: Can you rewrite this in simpler English?", 2000, "bot",
  "GH-GPT: Sure. Here's the revised version with improved clarity.", 2000, "human1",
  // Developer
  "User: Convert this Python function to JavaScript.", 2000, "bot",
  "GH-GPT: Converted! Here's the JavaScript version of your code.", 2000, "human2",
  "User: Explain how OAuth 2.0 works in simple terms.", 2000, "bot",
  "GH-GPT: It's like a valet key to access data without sharing passwords.", 2000, "human1",
  // Academic
  "Student: Can you explain Newton's second law?", 2000, "bot",
  "GH-GPT: Sure! F = ma — force equals mass times acceleration.", 2000, "human2",
  "Student: Help me cite this article in APA.", 2000, "bot",
  "GH-GPT: Here's the correct APA format for your reference.", 2000, "human1",
  // Business
  "Manager: Create a weekly meeting agenda.", 2000, "bot",
  "GH-GPT: Here's a structured agenda with time slots.", 2000, "human2",
  "Manager: Write a job description for a React developer.", 2000, "bot",
  "GH-GPT: Here's a complete job posting template.", 2000, "human1",
  // Creative
  "Writer: Start a short story about a lost robot.", 2000, "bot",
  "GH-GPT: In a forgotten scrapyard, a robot blinked awake for the first time...", 2000, "human2",
  "Writer: Suggest 5 titles for a sci-fi novel.", 2000, "bot",
  "GH-GPT: Here's a list of futuristic and engaging titles.", 2000, "human1",
];

const AVATARS = { human1: "/human1.jpeg", human2: "/human2.jpeg", bot: "/bot.png" };

const FEATURES = [
  { icon: FiEdit3, title: "Write & summarize", text: "Drafts, rewrites and summaries in seconds." },
  { icon: FiCode, title: "Code help", text: "Explain, convert and debug with highlighted code." },
  { icon: FiImage, title: "Ask about images", text: "Upload or paste an image and ask questions." },
  { icon: FiMic, title: "Voice in & out", text: "Dictate prompts and listen to replies." },
];

const Homepage = ({ authUser }) => {
  const [typingStatus, setTypingStatus] = useState("human1");

  // Turn the "who speaks next" markers into callbacks for TypeAnimation.
  // TypeAnimation reads the sequence once, so build it once.
  const sequence = useMemo(
    () => CONVERSATION.map((step) => (AVATARS[step] ? () => setTypingStatus(step) : step)),
    []
  );

  return (
    <Flex direction="column" minH="100dvh" bg="bg.canvas" position="relative" overflowX="hidden">
      <Navbar authUser={authUser} />

      <Image
        src="/orbital.png"
        alt=""
        className="hp-orbital"
        position="absolute"
        bottom={0}
        left={0}
        opacity={0.05}
        zIndex={0}
        pointerEvents="none"
        maxW={{ base: "120%", md: "60%" }}
      />

      <Container maxW="6xl" flex={1} display="flex" alignItems="center" py={{ base: 8, md: 12 }} position="relative" zIndex={1}>
        <Stack
          direction={{ base: "column", lg: "row" }}
          align="center"
          spacing={{ base: 10, lg: 16 }}
          w="full"
        >
          {/* Copy */}
          <Stack flex={1} spacing={5} textAlign={{ base: "center", lg: "left" }} align={{ base: "center", lg: "flex-start" }}>
            <Heading
              as="h1"
              fontSize={{ base: "5xl", sm: "6xl", md: "7xl", xl: "8xl" }}
              fontWeight="800"
              lineHeight="1"
              letterSpacing="-0.03em"
              bgGradient="linear(to-r, #ce1126, #e0a800, #007940)"
              bgClip="text"
            >
              GH-GPT
            </Heading>
            <Heading as="h2" fontSize={{ base: "xl", md: "3xl" }} fontWeight="600" color="text.muted">
              Boost creativity. Work smarter.
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} maxW="lg" color="text.default">
              Your intelligent assistant for writing, coding, and idea generation —
              designed to help you move faster and think bigger.
            </Text>
            <HStack spacing={3} pt={2}>
              <Button
                as={RouterLink}
                to={authUser ? "/dashboard" : "/auth"}
                colorScheme="blue"
                size="lg"
                rightIcon={<FiArrowRight />}
                borderRadius="full"
                px={7}
              >
                Get started
              </Button>
            </HStack>
          </Stack>

          {/* Animated bot card */}
          <Flex flex={1} direction="column" align="center" w="full" gap={4}>
            <Box
              position="relative"
              w="full"
              maxW={{ base: "240px", sm: "280px", md: "320px" }}
              aspectRatio={1}
              bg="#140e2d"
              borderRadius="3xl"
              overflow="hidden"
              boxShadow="0 20px 60px -20px rgba(33, 123, 254, 0.45)"
            >
              <Box position="absolute" inset={0} opacity={0.2} w="200%" className="hp-bg" />
              <Image
                src="/bot.png"
                alt="GH-GPT robot"
                className="hp-bot"
                position="relative"
                w="70%"
                h="70%"
                objectFit="contain"
                m="15%"
              />
            </Box>

            <Flex
              align="center"
              gap={3}
              px={4}
              py={3}
              w="full"
              maxW="420px"
              minH="64px"
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="xl"
              boxShadow="md"
              fontSize={{ base: "sm", md: "md" }}
            >
              <Image
                src={AVATARS[typingStatus]}
                alt=""
                boxSize="32px"
                borderRadius="full"
                objectFit="cover"
                flexShrink={0}
              />
              <TypeAnimation
                sequence={sequence}
                wrapper="span"
                repeat={Infinity}
                cursor={true}
                omitDeletionAnimation={true}
              />
            </Flex>
          </Flex>
        </Stack>
      </Container>

      <Container maxW="6xl" pb={10} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          {FEATURES.map((f) => (
            <Box
              key={f.title}
              p={5}
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="xl"
              transition="transform 0.2s, box-shadow 0.2s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
            >
              <Flex boxSize="40px" align="center" justify="center" borderRadius="lg" bg="bg.subtle" color="accent" mb={3}>
                <Icon as={f.icon} boxSize={5} />
              </Flex>
              <Text fontWeight="semibold" mb={1}>{f.title}</Text>
              <Text fontSize="sm" color="text.muted">{f.text}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      <Flex
        as="footer"
        direction="column"
        align="center"
        gap={2}
        py={6}
        px={4}
        borderTop="1px solid"
        borderColor="border.default"
        fontSize="xs"
        color="text.muted"
        textAlign="center"
      >
        <HStack spacing={3}>
          <Link as={RouterLink} to="/">Terms of Service</Link>
          <Text>|</Text>
          <Link as={RouterLink} to="/">Privacy Policy</Link>
        </HStack>
        <Text>
          Copyright &copy; {new Date().getFullYear()} Built by{" "}
          <Link
            href="https://portfolio-8jmo.onrender.com/"
            isExternal
            color="accent"
            display="inline-flex"
            alignItems="center"
            gap={1}
          >
            <FiBriefcase size={12} /> Abakah Joshua
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default Homepage;
