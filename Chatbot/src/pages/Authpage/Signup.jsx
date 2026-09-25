import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
	Alert,
	AlertIcon,
	Button,
	FormControl,
	FormLabel,
	IconButton,
	Input,
	InputGroup,
	InputRightElement,
	SimpleGrid,
	VStack,
} from "@chakra-ui/react";
import useSignup from "../../hooks/useSignup";

export default function Signup() {
	const [form, setForm] = useState({ firstName: "", lastName: "", username: "", email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const { signup, isLoading, error } = useSignup();

	const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		signup(form.email.trim(), form.password, form.firstName.trim(), form.lastName.trim(), form.username.trim());
	};

	return (
		<VStack as="form" spacing={4} onSubmit={handleSubmit} noValidate>
			<SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} w="full">
				<FormControl>
					<FormLabel fontSize="sm">First name</FormLabel>
					<Input autoComplete="given-name" value={form.firstName} onChange={update("firstName")} fontSize="16px" />
				</FormControl>
				<FormControl>
					<FormLabel fontSize="sm">Last name</FormLabel>
					<Input autoComplete="family-name" value={form.lastName} onChange={update("lastName")} fontSize="16px" />
				</FormControl>
			</SimpleGrid>
			<FormControl>
				<FormLabel fontSize="sm">Username</FormLabel>
				<Input autoComplete="username" value={form.username} onChange={update("username")} fontSize="16px" />
			</FormControl>
			<FormControl>
				<FormLabel fontSize="sm">Email</FormLabel>
				<Input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update("email")} fontSize="16px" />
			</FormControl>
			<FormControl>
				<FormLabel fontSize="sm">Password</FormLabel>
				<InputGroup>
					<Input
						type={showPassword ? "text" : "password"}
						autoComplete="new-password"
						value={form.password}
						onChange={update("password")}
						fontSize="16px"
					/>
					<InputRightElement>
						<IconButton
							variant="ghost"
							size="sm"
							aria-label={showPassword ? "Hide password" : "Show password"}
							icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
							onClick={() => setShowPassword(!showPassword)}
						/>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			{error && (
				<Alert status="error" fontSize="sm" borderRadius="md">
					<AlertIcon />
					{error}
				</Alert>
			)}
			<Button type="submit" w="full" colorScheme="blue" isLoading={isLoading}>
				Create account
			</Button>
		</VStack>
	);
}
