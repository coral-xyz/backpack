import type { SECURE_EVENTS } from "../events";
import type { SecureRequestType, SecureResponse } from "../types/transports";

export async function safeClientResponse<
  T extends SECURE_EVENTS,
  R extends SecureRequestType
>(
  p: Promise<SecureResponse<T, R>>
): Promise<NonNullable<SecureResponse<T, R>["response"]>> {
  const response = await p;
  if (response.error) {
    throw response.error;
  }
  return response.response!;
}
