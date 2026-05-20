type ResetButtonProps = {
  isResetting: boolean;
  disabled: boolean;
  onReset: () => void;
};

export function ResetButton({ isResetting, disabled, onReset }: ResetButtonProps) {
  return (
    <button
      className="secondary-button"
      type="button"
      disabled={disabled}
      onClick={onReset}
    >
      {isResetting ? "Resetting..." : "Reset documents"}
    </button>
  );
}
