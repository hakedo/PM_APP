import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ className = "w-8 h-8", text = "" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className={`${className} animate-spin text-gray-400`} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
}
