const FIXED_SALT = "backpack";

const sha256 = async (message: string) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

const createInsecurePasswordHash = (password: string) =>
  sha256(`${password}${FIXED_SALT}`);

export const checkInviteCode = async (inviteCode: string) => {
  const cleanCode = inviteCode.trim();
  if (
    !cleanCode.match(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
    )
  ) {
    throw new Error("Invalid invite code");
  }
  const res = await fetch("http://localhost:8787/check-invite-code", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ code: cleanCode }),
  });
  if (!res.ok) throw new Error(await res.text());
};

export const signup = async (
  username: string,
  password: string,
  inviteCode: string
) => {
  if (!username.match(/^[a-z0-9_]{4,16}$/)) {
    throw new Error(
      "username must be 4-16 characters long and only contain letters, numbers, and underscores"
    );
  }
  const res = await fetch("http://localhost:8787/signup", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      username,
      password: await createInsecurePasswordHash(password),
      invite_code: inviteCode,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
};

export const signin = async (username: string, password: string) => {
  const res = await fetch("http://localhost:8787/signin", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      username,
      password: await createInsecurePasswordHash(password),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
};
