const PAYSTACK_BASE_URL = "https://api.paystack.co";

async function paystackRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Paystack request failed");
  }

  return data;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackRequest<{
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({ ...params, amount: params.amount * 100 }),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackRequest<{
    status: boolean;
    data: {
      status: string;
      reference: string;
      amount: number;
      customer: { email: string };
    };
  }>(`/transaction/verify/${reference}`);
}

export async function createSubscriptionPlan(params: {
  name: string;
  interval: "monthly" | "quarterly" | "annually";
  amount: number;
}) {
  return paystackRequest<{
    status: boolean;
    data: { id: number; plan_code: string };
  }>("/plan", {
    method: "POST",
    body: JSON.stringify({ ...params, amount: params.amount * 100 }),
  });
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest("hex");
  return hash === signature;
}
