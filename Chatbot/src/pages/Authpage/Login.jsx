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
	VStack,
} from "@chakra-ui/react";
import useLogin from "../../hooks/useLogin";

export default function Login() {
	const { login, isLoading, error } = useLogin();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		login(email.trim(), password);
	};

	return (
		<VStack as="form" spacing={4} onSubmit={handleSubmit} noValidate>
			<FormControl>
				<FormLabel fontSize="sm">Email</FormLabel>
				<Input
					type="email"
					autoComplete="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					fontSize="16px"
				/>
			</FormControl>
			<FormControl>
				<FormLabel fontSize="sm">Password</FormLabel>
				<InputGroup>
					<Input
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						placeholder="Your password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
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
				Log in
			</Button>
		</VStack>
	);
}
