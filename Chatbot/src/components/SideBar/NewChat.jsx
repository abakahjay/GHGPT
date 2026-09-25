import { FiEdit } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import NavItem from "./NavItem";

// The dashboard's prompt box creates the chat on first send, so "New Chat"
// just goes there instead of creating an empty chat on the server.
const NewChat = ({ compact }) => {
	const { pathname } = useLocation();
	return (
		<NavItem
			to="/dashboard"
			icon={<FiEdit />}
			label="New chat"
			compact={compact}
			isActive={pathname === "/dashboard"}
		/>
	);
};

export default NewChat;
