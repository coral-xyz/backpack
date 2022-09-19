const API_URL = "https://authenticator.backpack.workers.dev";

export const checkInviteCode = async (inviteCode: string) => {
  try {
    const cleanCode = inviteCode.trim();
    if (
      !cleanCode.match(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      )
    ) {
      throw new Error("Invalid invite code");
    }
    await apiRequest("check-invite-code", { inviteCode: cleanCode });
  } catch (err) {
    throw new Error(err.message);
  }
};

export const signup = async (
  username: string,
  password: string,
  inviteCode: string
) => {
  try {
    if (!username.match(/^[a-z0-9_]{4,16}$/)) {
      throw new Error(
        "username must be 4-16 characters long and only contain letters, numbers, and underscores"
      );
    }
    await apiRequest("/signup", {
      username,
      password: await createInsecurePasswordHashForTransit(password),
      invite_code: inviteCode,
    });
  } catch (err) {
    throw new Error(err.message);
  }
};

export const signin = async (username: string, password: string) =>
  apiRequest("signin", {
    username,
    password: await createInsecurePasswordHashForTransit(password),
  });

const apiRequest = async (path: string, body: any = {}) => {
  const res = await fetch([API_URL, path].join("/"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
};

const sha256 = async (message: string) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

const createInsecurePasswordHashForTransit = (password: string) =>
  sha256(password);
