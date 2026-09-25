import NewChat from "./NewChat";
import SearchChats from "./SearchChats";
import HistoryLink from "./HistoryLink";

const SidebarItems = ({ authUser, compact }) => {
	return (
		<>
			<NewChat compact={compact} />
			<SearchChats authUser={authUser} compact={compact} />
			<HistoryLink compact={compact} />
		</>
	);
};

export default SidebarItems;
