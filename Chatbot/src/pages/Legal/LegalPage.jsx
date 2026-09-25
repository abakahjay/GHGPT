import { Box, Container, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Navbar from "../../components/NavBar/Navbar.jsx";
import { SUPPORT_EMAIL } from "../../utils/config";
const UPDATED = "25 September 2026";

const Section = ({ title, children }) => (
    <Box mb={7}>
        <Heading as="h2" size="md" mb={3}>{title}</Heading>
        <Box color="text.default" lineHeight="1.8" sx={{ p: { mb: 3 } }}>{children}</Box>
    </Box>
);

function Privacy() {
    return (
        <>
            <Heading size="xl" mb={2}>Privacy Policy</Heading>
            <Text color="text.muted" mb={8}>Last updated {UPDATED}</Text>

            <Section title="Who we are">
                <Text>GH-GPT is an AI assistant built in Ghana by Abakah Joshua, available at gh-gpt.onrender.com and as an installable app. Questions about this policy: <Link href={`mailto:${SUPPORT_EMAIL}`} color="accent">{SUPPORT_EMAIL}</Link>.</Text>
            </Section>

            <Section title="What we collect">
                <UnorderedList spacing={2}>
                    <ListItem><b>Account details:</b> your name, username, email address and a securely hashed password (or your Google account name, email and profile photo if you sign in with Google).</ListItem>
                    <ListItem><b>Your chats:</b> the messages you send, GH-GPT&apos;s answers, chat titles, and images and documents you attach (PDF, Word, Excel, PowerPoint, CSV, text), including the text extracted from them so GH-GPT can answer follow-up questions.</ListItem>
                    <ListItem><b>Images GH-GPT creates</b> for you.</ListItem>
                    <ListItem><b>Device sign-in records:</b> a random identifier for each browser you sign in from (stored as a one-way hash), used to warn you about sign-ins from new devices.</ListItem>
                    <ListItem><b>Settings kept on your device:</b> your theme, custom instructions and sign-in session are stored in your browser&apos;s local storage.</ListItem>
                </UnorderedList>
                <Text mt={3}>We don&apos;t sell your data, show ads, or use tracking cookies.</Text>
            </Section>

            <Section title="How your messages are processed">
                <Text>To answer you, your message, the recent conversation, your custom instructions and the text of attached documents are sent to an AI service. Depending on availability this is OpenRouter (which routes to model providers such as Google, OpenAI or Qwen), Google Gemini, OpenAI, or Pollinations. Image requests are sent to Pollinations or, if configured, an OpenRouter image model. These services process the content under their own privacy terms. Please don&apos;t share passwords, card numbers or other highly sensitive information in chats.</Text>
            </Section>

            <Section title="Emails">
                <Text>We email you a welcome message when you first use GH-GPT, security alerts about sign-ins from new devices, and copies of chats you choose to email to yourself. You can turn off non-essential emails in Settings or with the unsubscribe link in any email.</Text>
            </Section>

            <Section title="Storage and security">
                <Text>Data is stored in a MongoDB Atlas database and served from Render. Connections use HTTPS, passwords are hashed, and access to your chats requires your sign-in token.</Text>
            </Section>

            <Section title="Your choices">
                <UnorderedList spacing={2}>
                    <ListItem>Delete any chat or message from the app at any time; deleted chats are removed from our database.</ListItem>
                    <ListItem>Download a chat as a Markdown file, or email it to yourself.</ListItem>
                    <ListItem>To delete your account and all its data, email <Link href={`mailto:${SUPPORT_EMAIL}`} color="accent">{SUPPORT_EMAIL}</Link> from your account&apos;s email address.</ListItem>
                </UnorderedList>
            </Section>

            <Section title="Children">
                <Text>GH-GPT is not directed at children under 13, and we don&apos;t knowingly collect their data.</Text>
            </Section>

            <Section title="Changes">
                <Text>We&apos;ll update this page if our practices change and show the new date at the top.</Text>
            </Section>
        </>
    );
}

function Terms() {
    return (
        <>
            <Heading size="xl" mb={2}>Terms of Use</Heading>
            <Text color="text.muted" mb={8}>Last updated {UPDATED}</Text>

            <Section title="Using GH-GPT">
                <Text>GH-GPT is provided free of charge, as is. By using it you agree to these terms and to our <Link as={RouterLink} to="/privacy" color="accent">Privacy Policy</Link>.</Text>
            </Section>
            <Section title="AI answers can be wrong">
                <Text>GH-GPT&apos;s answers, charts and images are generated by AI and may be inaccurate, incomplete or out of date. Check important information, and don&apos;t rely on GH-GPT for medical, legal, financial or safety decisions.</Text>
            </Section>
            <Section title="Acceptable use">
                <Text>Don&apos;t use GH-GPT to break the law, harm or harass others, create sexual content involving minors, infringe others&apos; rights, or attempt to disrupt or gain unauthorised access to the service. We may suspend accounts that do.</Text>
            </Section>
            <Section title="Your content">
                <Text>You keep ownership of what you send and upload. You give us permission to store and process it only to provide the service, including sending it to the AI providers described in the Privacy Policy. You&apos;re responsible for having the right to upload the files you attach.</Text>
            </Section>
            <Section title="Availability">
                <Text>We may change, pause or stop features at any time. The free AI services GH-GPT relies on can be slow or unavailable.</Text>
            </Section>
            <Section title="Contact">
                <Text><Link href={`mailto:${SUPPORT_EMAIL}`} color="accent">{SUPPORT_EMAIL}</Link></Text>
            </Section>
        </>
    );
}

export default function LegalPage({ authUser, page = "privacy" }) {
    return (
        <Box minH="100dvh" bg="bg.canvas">
            <Navbar authUser={authUser} />
            <Container maxW="3xl" px={{ base: 4, md: 8 }} py={{ base: 8, md: 14 }}>
                {page === "terms" ? <Terms /> : <Privacy />}
            </Container>
        </Box>
    );
}
