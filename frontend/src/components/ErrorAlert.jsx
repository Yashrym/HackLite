export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-hazard-crimson/40 bg-hazard-crimson/10 px-3 py-2 text-sm text-red-200" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="mt-1 text-xs font-semibold underline" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
