function hostedHint(body) {
  if (typeof window !== "undefined" && /\.vercel\.app$/i.test(window.location.hostname)) {
    return "Allow local network access if the browser asks, and keep python app.py running on this PC.";
  }
  return body;
}

export function ErrorState({ title, body, actionLabel = "Reconnect", onRetry }) {
  return (
    <div className="banner" role="alert" aria-live="assertive">
      <div>
        <strong>{title}</strong>
        <div className="muted">{hostedHint(body)}</div>
      </div>
      {onRetry ? (
        <button type="button" className="btn" onClick={onRetry}>{actionLabel}</button>
      ) : null}
    </div>
  );
}
