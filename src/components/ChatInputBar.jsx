import "./styles/chatInputBar.css";

export default function ChatInputBar({ value, onChange, onSend }) {
  return (
    <div className="chat-input-bar">
      <input
        type="text"
        placeholder="Ask something..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onSend}>➤</button>
    </div>
  );
}