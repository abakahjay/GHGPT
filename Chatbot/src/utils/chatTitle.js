// A chat list entry's title for display ("." is the placeholder of a brand-new chat).
export const displayTitle = (chat) => (chat?.title && chat.title !== "." ? chat.title : "New chat");
