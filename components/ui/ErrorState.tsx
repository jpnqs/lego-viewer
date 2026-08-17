"use client";

import { Button } from "@/components/ui/Button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="max-w-sm font-serif text-xl text-anthracite-800">
        {message}
      </p>
      <Button onClick={onRetry} variant="primary" size="md">
        Erneut versuchen
      </Button>
    </div>
  );
}
