// Downloads a conversation as a Markdown file.
export function downloadChatMarkdown(title, messages) {
    const heading = `# ${title || "GH-GPT chat"}\n\n_Exported from GH-GPT on ${new Date().toLocaleString()}_\n\n`;
    const body = messages
        .map((m) => `### ${m.fromUser ? "You" : "GH-GPT"}\n\n${m.image ? `![image](${m.image})\n\n` : ""}${m.text || ""}`)
        .join("\n\n---\n\n");
    const blob = new Blob([heading + body + "\n"], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "gh-gpt-chat").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "gh-gpt-chat"}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
