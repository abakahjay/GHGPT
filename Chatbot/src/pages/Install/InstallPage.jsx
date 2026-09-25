import { useState } from "react";
import {
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    Image,
    SimpleGrid,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack,
} from "@chakra-ui/react";
import { FaAndroid, FaApple, FaWindows } from "react-icons/fa";
import { FiCheckCircle, FiDownload, FiMonitor, FiShare, FiRefreshCw, FiSmartphone, FiZap } from "react-icons/fi";
import Navbar from "../../components/NavBar/Navbar.jsx";
import useShowToast from "../../hooks/useShowToast";
import { detectPlatform, useInstallPrompt } from "../../utils/installPrompt";

const PLATFORMS = [
    {
        key: "ios",
        label: "iPhone & iPad",
        icon: FaApple,
        steps: [
            <>Open <b>gh-gpt.onrender.com</b> in <b>Safari</b>.</>,
            <>Tap the <b>Share</b> button <Icon as={FiShare} verticalAlign="middle" /> at the bottom (top on iPad).</>,
            <>Scroll down and tap <b>Add to Home Screen</b>.</>,
            <>Tap <b>Add</b>. GH-GPT now opens full-screen from your Home Screen, like any app.</>,
        ],
    },
    {
        key: "android",
        label: "Android",
        icon: FaAndroid,
        steps: [
            <>Open GH-GPT in <b>Chrome</b> and tap <b>Install app</b> above, or</>,
            <>tap the <b>⋮</b> menu → <b>Install app</b> (or <b>Add to Home screen</b>).</>,
            <>Confirm with <b>Install</b>. GH-GPT appears in your app drawer and home screen.</>,
        ],
    },
    {
        key: "windows",
        label: "Windows",
        icon: FaWindows,
        steps: [
            <>Open GH-GPT in <b>Microsoft Edge</b> or <b>Chrome</b> and click <b>Install app</b> above, or</>,
            <>click the install icon <Icon as={FiDownload} verticalAlign="middle" /> at the right end of the address bar.</>,
            <>Click <b>Install</b>. GH-GPT gets its own window, Start menu entry and taskbar icon.</>,
        ],
    },
    {
        key: "mac",
        label: "Mac",
        icon: FiMonitor,
        steps: [
            <><b>Safari:</b> open GH-GPT, then choose <b>File → Add to Dock</b> (or Share → Add to Dock).</>,
            <><b>Chrome or Edge:</b> click <b>Install app</b> above, or the install icon in the address bar.</>,
            <>GH-GPT opens in its own window and stays in your Dock and Launchpad.</>,
        ],
    },
];

const PERKS = [
    { icon: FiZap, title: "Opens instantly", text: "Launch from your home screen, dock or Start menu." },
    { icon: FiSmartphone, title: "Full-screen app", text: "No browser bars — just GH-GPT." },
    { icon: FiRefreshCw, title: "Always up to date", text: "Updates install automatically. Nothing to download again." },
];

export default function InstallPage({ authUser }) {
    const showToast = useShowToast();
    const { canPrompt, promptInstall, installed } = useInstallPrompt();
    const detected = detectPlatform();
    const [tab, setTab] = useState(Math.max(0, PLATFORMS.findIndex((p) => p.key === detected)));

    const install = async () => {
        const outcome = await promptInstall();
        if (outcome === "accepted") showToast("Installing GH-GPT", "It will appear with your other apps.", "success");
    };

    return (
        <Box minH="100dvh" bg="bg.canvas">
            <Navbar authUser={authUser} />
            <Container maxW="4xl" px={{ base: 4, md: 8 }} py={{ base: 8, md: 14 }}>
                <VStack spacing={5} textAlign="center" mb={{ base: 8, md: 12 }}>
                    <Image src="/icons/icon-192.png" alt="GH-GPT app icon" boxSize={{ base: "88px", md: "104px" }} borderRadius="24%" boxShadow="xl" />
                    <Heading fontSize={{ base: "3xl", md: "4xl" }} letterSpacing="-0.02em">Get the GH-GPT app</Heading>
                    <Text color="text.muted" maxW="lg" fontSize={{ base: "md", md: "lg" }}>
                        Install GH-GPT on your iPhone, Android phone, Windows PC or Mac — free, no app store needed.
                    </Text>
                    <HStack spacing={2} flexWrap="wrap" justify="center">
                        {PLATFORMS.map((p) => (
                            <Badge key={p.key} px={2.5} py={1} borderRadius="full" variant="subtle" colorScheme="gray" display="inline-flex" alignItems="center" gap={1.5} textTransform="none" fontWeight="medium">
                                <Icon as={p.icon} /> {p.label}
                            </Badge>
                        ))}
                    </HStack>

                    {installed ? (
                        <HStack color="green.400" fontWeight="semibold"><FiCheckCircle /> <Text>You&apos;re using the installed app.</Text></HStack>
                    ) : canPrompt ? (
                        <Button size="lg" colorScheme="blue" leftIcon={<FiDownload />} borderRadius="full" px={8} onClick={install}>
                            Install app
                        </Button>
                    ) : (
                        <Text fontSize="sm" color="text.muted">Follow the steps for your device below.</Text>
                    )}
                </VStack>

                <Box bg="bg.surface" borderWidth="1px" borderColor="border.default" borderRadius="2xl" p={{ base: 4, md: 6 }}>
                    <Tabs index={tab} onChange={setTab} variant="soft-rounded" colorScheme="blue" isLazy>
                        <TabList flexWrap="wrap" gap={2} mb={4}>
                            {PLATFORMS.map((p) => (
                                <Tab key={p.key} fontSize="sm" gap={2}>
                                    <Icon as={p.icon} /> {p.label}
                                    {p.key === detected && <Badge ml={1} colorScheme="green" fontSize="0.6em">This device</Badge>}
                                </Tab>
                            ))}
                        </TabList>
                        <TabPanels>
                            {PLATFORMS.map((p) => (
                                <TabPanel key={p.key} px={0}>
                                    <VStack align="stretch" spacing={3}>
                                        {p.steps.map((step, i) => (
                                            <Flex key={i} gap={3} align="flex-start">
                                                <Flex boxSize="26px" flexShrink={0} borderRadius="full" bg="blue.500" color="white" fontSize="sm" fontWeight="bold" align="center" justify="center">
                                                    {i + 1}
                                                </Flex>
                                                <Text pt={0.5} lineHeight="1.6">{step}</Text>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={8}>
                    {PERKS.map((perk) => (
                        <Box key={perk.title} p={5} bg="bg.surface" borderWidth="1px" borderColor="border.default" borderRadius="xl">
                            <Icon as={perk.icon} boxSize={5} color="accent" mb={2} />
                            <Text fontWeight="semibold">{perk.title}</Text>
                            <Text fontSize="sm" color="text.muted">{perk.text}</Text>
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}
