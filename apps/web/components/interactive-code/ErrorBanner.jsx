export function ErrorBanner({ workspace }) {
  const {
    state: { smartError },
    computed: { unsupportedIssue },
  } = workspace;

  if (!smartError && !unsupportedIssue) return null;

  return (
    <div
      className="shrink-0 border-t border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs"
      role="alert"
      aria-live="assertive"
    >
      {unsupportedIssue ? (
        <p className="font-bold">{unsupportedIssue}</p>
      ) : (
        <>
          <p className="font-mono font-bold">{smartError.original}</p>
          {smartError.file && (
            <p className="mt-1">
              {smartError.file}:{smartError.line}:{smartError.column}
            </p>
          )}
          <p className="mt-2">
            <strong>What happened:</strong> {smartError.explanation}
          </p>
          <p className="mt-1">
            <strong>Likely reason:</strong> {smartError.reason}
          </p>
          <p className="mt-1">
            <strong>Possible fix:</strong> {smartError.suggestion}
          </p>
        </>
      )}
    </div>
  );
}
