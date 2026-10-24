import { useState } from "react";
import { Box, Button, Checkbox, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import GoogleAuth from "./GoogleAuth";
import useAuthStore from "../../store/useAuthStore";

export function AuthForm({ onAuth }) {
    const [params, setParams] = useSearchParams();
    const isLogin = params.get("mode") !== "signup";
    const setError = useAuthStore((state) => state.setError);
    // Age + terms confirmation, required before an account is created by email or Google.
    const [agreed, setAgreed] = useState(false);
    const [consentNudge, setConsentNudge] = useState(false);
    const needsConsent = !isLogin && !agreed;
    const askConsent = () => setConsentNudge(true);
    const toggle = () => {
        setError(null);
        setParams(isLogin ? { mode: "signup" } : {}, { replace: true });
    };

    return (
        <Box
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="2xl"
            boxShadow="lg"
            p={{ base: 6, sm: 8 }}
        >
            <VStack spacing={1} mb={6} textAlign="center">
                <Heading size="lg" letterSpacing="-0.02em">
                    {isLogin ? "Welcome back" : "Create your account"}
                </Heading>
                <Text color="text.muted" fontSize="sm">
                    {isLogin ? "Log in to continue to GH-GPT" : "Start chatting with GH-GPT for free"}
                </Text>
            </VStack>

            {!isLogin && (
                <Checkbox
                    isChecked={agreed}
                    onChange={(e) => { setAgreed(e.target.checked); setConsentNudge(false); }}
                    isInvalid={consentNudge}
                    mb={4}
                    alignItems="flex-start"
                    fontSize="sm"
                    data-testid="checkbox-consent"
                >
                    <Text as="span" fontSize="sm" color="text.muted">
                        I&apos;m 13 or older and agree to the{" "}
                        <Link as={RouterLink} to="/terms" color="accent" textDecoration="underline">Terms of Use</Link> and{" "}
                        <Link as={RouterLink} to="/privacy" color="accent" textDecoration="underline">Privacy Policy</Link>.
                    </Text>
                </Checkbox>
            )}
            {consentNudge && (
                <Text role="alert" fontSize="sm" color="red.400" mt={-2} mb={4}>
                    Please confirm you are 13 or older and agree to the terms.
                </Text>
            )}

            {isLogin ? <Login onAuth={onAuth} /> : <Signup onAuth={onAuth} needsConsent={needsConsent} onNeedConsent={askConsent} />}

            <Flex align="center" gap={3} my={5}>
                <Box flex={1} h="1px" bg="border.default" />
                <Text fontSize="xs" color="text.muted" fontWeight="semibold">OR</Text>
                <Box flex={1} h="1px" bg="border.default" />
            </Flex>

            <GoogleAuth prefix={isLogin ? "Continue" : "Sign up"} needsConsent={needsConsent} onNeedConsent={askConsent} />

            <Flex justify="center" align="center" gap={1} mt={6} fontSize="sm">
                <Text color="text.muted">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                </Text>
                <Button variant="link" colorScheme="blue" size="sm" onClick={toggle}>
                    {isLogin ? "Sign up" : "Log in"}
                </Button>
            </Flex>
        </Box>
    );
}
