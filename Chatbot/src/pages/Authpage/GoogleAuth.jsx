import { Button, Image } from "@chakra-ui/react";
import { API_URL } from "../../utils/config";

// The backend sends the token back to whatever redirect_uri we pass, so the
// same code works on localhost and on the deployed site.
const GoogleAuth = ({ prefix }) => {
	const handleGoogleAuth = () => {
		const redirectUri = `${window.location.origin}/auth/callback`;
		window.location.href = `${API_URL}/api/v1/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
	};

	return (
		<Button
			w="full"
			variant="outline"
			borderColor="border.default"
			leftIcon={<Image src='/google.png' w={5} alt='' />}
			onClick={handleGoogleAuth}
			fontWeight="medium"
		>
			{prefix} with Google
		</Button>
	);
};

export default GoogleAuth;
