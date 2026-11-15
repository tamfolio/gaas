"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function ContinueButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-10" disabled={pending}>
      {pending ? "Signing you in…" : label}
    </Button>
  );
}
