import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Switch,
    Text,
    Textarea,
    useColorMode,
} from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";
import PushSettings from "./PushSettings";
import { Link as RouterLink } from "react-router-dom";
import useShowToast from "../../hooks/useShowToast";
import {
    getCustomInstructions,
    getSettings,
    saveCustomInstructions,
    setEmailNotifications,
} from "../../utils/ghgptApi";

const MAX_INSTRUCTIONS = 1500;

// Personalisation (custom instructions), email preferences, theme and app install.
const SettingsModal = ({ isOpen, onClose }) => {
    const showToast = useShowToast();
    const { colorMode, toggleColorMode } = useColorMode();
    const [instructions, setInstructions] = useState("");
    const [emailOn, setEmailOn] = useState(true);
    const [emailInfo, setEmailInfo] = useState(null);
    const [savingEmail, setSavingEmail] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setInstructions(getCustomInstructions());
        getSettings()
            .then((s) => {
                setEmailOn(s.emailNotifications);
                setEmailInfo(s);
            })
            .catch(() => setEmailInfo(null));
    }, [isOpen]);

    const toggleEmail = async (value) => {
        setEmailOn(value);
        setSavingEmail(true);
        try {
            await setEmailNotifications(value);
        } catch {
            setEmailOn(!value);
            showToast("Error", "Could not update your email preference", "error");
        } finally {
            setSavingEmail(false);
        }
    };

    const save = () => {
        saveCustomInstructions(instructions.trim());
        showToast("Saved", "Your settings were saved.", "success", 1500);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "lg" }} scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderWidth="1px" borderColor="border.default" mx={{ base: 0, sm: 4 }}>
                <ModalHeader>Settings</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel fontWeight="semibold">Custom instructions</FormLabel>
                        <Textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value.slice(0, MAX_INSTRUCTIONS))}
                            placeholder={"What should GH-GPT know about you, and how should it respond?\ne.g. I'm a nursing student in Kumasi. Keep answers short and use simple English."}
                            rows={5}
                            fontSize="16px"
                        />
                        <FormHelperText display="flex" justifyContent="space-between">
                            <span>Used in every new message you send.</span>
                            <span>{instructions.length}/{MAX_INSTRUCTIONS}</span>
                        </FormHelperText>
                    </FormControl>

                    <Divider my={5} borderColor="border.default" />

                    <Flex align="center" justify="space-between" gap={4}>
                        <Box>
                            <Text fontWeight="semibold">Email updates</Text>
                            <Text fontSize="sm" color="text.muted">
                                Welcome and product emails{emailInfo?.email ? ` to ${emailInfo.email}` : ""}. Security alerts are always sent.
                            </Text>
                        </Box>
                        <Switch isChecked={emailOn} onChange={(e) => toggleEmail(e.target.checked)} isDisabled={savingEmail || !emailInfo} colorScheme="blue" />
                    </Flex>

                    <Divider my={5} borderColor="border.default" />

                    <PushSettings onNavigate={onClose} />

                    <Divider my={5} borderColor="border.default" />

                    <Flex align="center" justify="space-between" gap={4}>
                        <Box>
                            <Text fontWeight="semibold">Dark mode</Text>
                            <Text fontSize="sm" color="text.muted">Switch between light and dark themes.</Text>
                        </Box>
                        <Switch isChecked={colorMode === "dark"} onChange={toggleColorMode} colorScheme="blue" />
                    </Flex>

                    <Divider my={5} borderColor="border.default" />

                    <Flex align="center" justify="space-between" gap={4}>
                        <Box>
                            <Text fontWeight="semibold">Get the app</Text>
                            <Text fontSize="sm" color="text.muted">Install GH-GPT on your phone or computer.</Text>
                        </Box>
                        <Button as={RouterLink} to="/install" size="sm" leftIcon={<FiDownload />} onClick={onClose} flexShrink={0}>
                            Install
                        </Button>
                    </Flex>
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" onClick={save}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SettingsModal;
