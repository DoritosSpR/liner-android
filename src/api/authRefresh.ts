import { getAuthSession, setAuthSession, clearAuthSession } from "./auth-session";
import { executeRequest } from "./executeRequest";

export async function refreshAuthSession(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session?.refreshToken) return false;

  try {
    const response = await executeRequest(
      "/v1/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      },
      { auth: false, skipAuthRefresh: true },
    );

    if (!response.ok) {
      await clearAuthSession();
      return false;
    }

    const data = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresAt: string;
      user?: import("@/src/contracts/auth").PublicUser;
      expiresAt?: number;
    };

    const updated: import("./auth-session").StoredAuthSession = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      user: data.user ?? session.user,
      expiresAt: data.expiresAt,
    };

    await setAuthSession(updated);
    return true;
  } catch {
    await clearAuthSession();
    return false;
  }
}
