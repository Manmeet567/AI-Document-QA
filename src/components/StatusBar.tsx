import type { HealthResponse } from "../types/api";

type StatusBarProps = {
  health: HealthResponse | null;
  error: string | null;
};

export function StatusBar({ health, error }: StatusBarProps) {
  const isHealthy = health?.status === "healthy";

  return (
    <section className="status-bar" aria-live="polite">
      <div>
        <span className={isHealthy ? "status-dot online" : "status-dot"} />
        <span className="status-label">
          {error ? "Backend unavailable" : isHealthy ? "Backend connected" : "Checking backend"}
        </span>
      </div>
      <div className="status-meta">
        <span>{health?.model ?? "deepseek-chat"}</span>
        <span>{health?.key_loaded ? "API key loaded" : "API key not confirmed"}</span>
      </div>
    </section>
  );
}
