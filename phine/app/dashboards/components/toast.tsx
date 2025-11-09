interface ToastProps {
  show: boolean;
}

export function Toast({ show }: ToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-3 shadow-lg dark:bg-zinc-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="text-sm font-medium text-white">Copied to clipboard!</span>
      </div>
    </div>
  );
}

