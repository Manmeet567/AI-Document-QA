import type { ChatMessage } from "../types/api";

type ChatAreaProps = {
  messages: ChatMessage[];
  isAsking: boolean;
};

export function ChatArea({ messages, isAsking }: ChatAreaProps) {
  return (
    <section className="chat-panel" aria-live="polite">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <h2>Ready for questions</h2>
          <p>Upload a PDF, then ask about details, summaries, decisions, or requirements.</p>
        </div>
      ) : (
        <div className="messages">
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <div className="message-label">
                {message.role === "user" ? "You" : "AI answer"}
              </div>
              <p>{message.content}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="sources">
                  <span>Sources</span>
                  {message.sources.map((source) => (
                    <code key={source}>{source}</code>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {isAsking && (
        <div className="message assistant loading-message">
          <div className="message-label">AI answer</div>
          <p>Reading the retrieved document context...</p>
        </div>
      )}
    </section>
  );
}
