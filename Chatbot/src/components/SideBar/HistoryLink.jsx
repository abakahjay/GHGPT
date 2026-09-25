import { FiClock } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import NavItem from "./NavItem";

const HistoryLink = ({ compact }) => {
	const { pathname } = useLocation();
	return (
		<NavItem
			to="/history"
			icon={<FiClock />}
			label="History"
			compact={compact}
			isActive={pathname === "/history"}
		/>
	);
};

export default HistoryLink;
