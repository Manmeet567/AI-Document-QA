type QuestionBoxProps = {
  question: string;
  isAsking: boolean;
  disabled: boolean;
  onQuestionChange: (question: string) => void;
  onAsk: () => void;
};

export function QuestionBox({
  question,
  isAsking,
  disabled,
  onQuestionChange,
  onAsk,
}: QuestionBoxProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAsk();
  }

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <label htmlFor="question">Ask a question</label>
      <div className="question-row">
        <input
          id="question"
          type="text"
          value={question}
          disabled={disabled}
          placeholder="What are the main points in this PDF?"
          onChange={(event) => onQuestionChange(event.target.value)}
        />
        <button type="submit" disabled={disabled || !question.trim()}>
          {isAsking ? "Thinking..." : "Ask"}
        </button>
      </div>
    </form>
  );
}
