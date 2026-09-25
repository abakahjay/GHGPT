import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FiArrowRight, FiBriefcase, FiCode, FiEdit3, FiImage, FiMic } from "react-icons/fi";
import Navbar from "../../components/NavBar/Navbar.jsx";
import ChatShowcase from "../../components/Home/ChatShowcase.jsx";

const FEATURES = [
  { icon: FiEdit3, title: "Write & summarize", text: "Drafts, rewrites and summaries in seconds." },
  { icon: FiCode, title: "Code help", text: "Explain, convert and debug with highlighted code." },
  { icon: FiImage, title: "Ask about images", text: "Upload or paste an image and ask questions." },
  { icon: FiMic, title: "Voice in & out", text: "Dictate prompts and listen to replies." },
];

const Homepage = ({ authUser }) => {
  return (
    <Flex direction="column" minH="100dvh" bg="bg.canvas" position="relative" overflowX="clip">
      <Navbar authUser={authUser} />

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
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600", transform: "translateY(-1px)", boxShadow: "lg" }}
                _active={{ bg: "blue.700" }}
                size="lg"
                rightIcon={<FiArrowRight />}
                borderRadius="full"
                px={7}
              >
                Get started
              </Button>
            </HStack>
          </Stack>

          {/* Product preview */}
          <Flex flex={1} w="full" justify="center">
            <ChatShowcase />
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
          <Link as={RouterLink} to="/terms">Terms of Use</Link>
          <Text>|</Text>
          <Link as={RouterLink} to="/privacy">Privacy Policy</Link>
          <Text>|</Text>
          <Link as={RouterLink} to="/install">Get the app</Link>
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
