export interface SignRequestInput {
  method: string;
  path: string;
  body?: string | null;
  timestamp?: number;
  nonce?: string;
}

export interface SignedHeaders {
  "x-liner-timestamp": string;
  "x-liner-nonce": string;
  "x-liner-signature": string;
}

export function generateNonce(): string {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getAdjustedTimestamp(): number {
  return Date.now();
}

export function signApiRequest(input: SignRequestInput): SignedHeaders {
  const timestamp = input.timestamp ?? getAdjustedTimestamp();
  const nonce = input.nonce ?? generateNonce();

  const bodyHash = await sha256(input.body ?? "");
  const message = `${input.method.toUpperCase()}${input.path}${timestamp}${nonce}${bodyHash}`;
  const signature = await hmacSha256(message);

  return {
    "x-liner-timestamp": String(timestamp),
    "x-liner-nonce": nonce,
    "x-liner-signature": signature,
  };
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("liner-mobile-signing-key"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
