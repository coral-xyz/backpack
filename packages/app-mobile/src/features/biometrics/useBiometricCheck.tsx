import { useEffect } from "react";

import { useBiometricContext } from "~src/features/biometrics/context";
import {
  useBiometricAppSettings,
  useBiometricPrompt,
} from "~src/features/biometrics/hooks";
import { BiometricAuthenticationStatus } from "~src/features/biometrics/index";
import { useAppStateTrigger } from "~src/hooks/useAppStateTrigger";
import { hideSplashScreen } from "~src/lib/splashScreen";

export function useBiometricCheck(): void {
  const { requiredForAppAccess } = useBiometricAppSettings();
  const { authenticationStatus } = useBiometricContext();
  const successCallback = (): void => {
    setIsLockScreenVisible(false);
  };

  const setIsLockScreenVisible = (a) => {
    return a;
  };

  const { trigger } = useBiometricPrompt(successCallback);

  // on mount
  useEffect(() => {
    if (requiredForAppAccess) {
      trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs only once so it doesn't run on setting change

  useAppStateTrigger("background", "active", () => {
    if (requiredForAppAccess) {
      trigger();
    }
  });

  useAppStateTrigger("inactive", "background", () => {
    if (requiredForAppAccess) {
      setIsLockScreenVisible(true);
    }
  });

  useAppStateTrigger("inactive", "active", () => {
    hideSplashScreen(); // In case of a race condition where splash screen is not hidden, we want to hide when FaceID forces an app state change
    if (
      requiredForAppAccess &&
      authenticationStatus !== BiometricAuthenticationStatus.Authenticating &&
      authenticationStatus !== BiometricAuthenticationStatus.Rejected
    ) {
      setIsLockScreenVisible(false);
    }
  });

  useAppStateTrigger("active", "inactive", () => {
    hideSplashScreen(); // In case of a race condition where splash screen is not hidden, we want to hide when FaceID forces an app state change
    if (
      requiredForAppAccess &&
      authenticationStatus !== BiometricAuthenticationStatus.Authenticating
    ) {
      setIsLockScreenVisible(true);
    }
  });
}
