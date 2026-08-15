"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateReferralSettings } from "./actions";

export function ReferralSettings({ rewardDays }: { rewardDays: number }) {
  const [days, setDays] = useState(String(rewardDays));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateReferralSettings(fd);
      if (result?.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <Label htmlFor="referral_reward_days" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
          Free days per successful referral
        </Label>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>
          When a referred member completes their first payment, the referring member earns this many extra days on their membership.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Input
            id="referral_reward_days"
            name="referral_reward_days"
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => { setDays(e.target.value); setSaved(false); }}
            style={{ width: "100px" }}
            className="h-10"
          />
          <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>days</span>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: "0.8rem", color: "var(--destructive)" }}>{error}</p>
      )}

      <div>
        <Button
          type="submit"
          disabled={pending}
          style={{ height: "2.25rem", fontSize: "0.85rem", background: "var(--primary)", color: "white", border: "none" }}
        >
          {pending ? "Saving…" : saved ? "Saved" : "Save"}
        </Button>
      </div>
    </form>
  );
}
