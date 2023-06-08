import {
  authenticateAsync,
  hasHardwareAsync,
  isEnrolledAsync,
  LocalAuthenticationOptions,
} from "expo-local-authentication";

/**
 * Biometric authentication statuses
 * Note. Sorted by authentication level
 */
export enum BiometricAuthenticationStatus {
  Unsupported = "UNSUPPORTED",
  MissingEnrollment = "MISSING_ENROLLMENT",
  Rejected = "REJECTED",
  Authenticated = "AUTHENTICATED",
  Canceled = "CANCELED",
  Authenticating = "AUTHENTICATING",
}

export async function tryLocalAuthenticate(
  authenticateOptions?: LocalAuthenticationOptions
): Promise<BiometricAuthenticationStatus> {
  try {
    const compatible = await hasHardwareAsync();
    if (!compatible) {
      return BiometricAuthenticationStatus.Unsupported;
    }

    const enrolled = await isEnrolledAsync();
    if (!enrolled) {
      return BiometricAuthenticationStatus.MissingEnrollment;
    }

    const result = await authenticateAsync(authenticateOptions);
    if (result.success === false) {
      return BiometricAuthenticationStatus.Rejected;
    }

    return BiometricAuthenticationStatus.Authenticated;
  } catch (e) {
    console.error(e);

    return BiometricAuthenticationStatus.Rejected;
  }
}

export const BIOMETRIC_PASSWORD = "SECRET_VARIABLE_DO_NOT_CHANGE";
