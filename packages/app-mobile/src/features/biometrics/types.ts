export enum BiometricSettingType {
  RequiredForAppAccess,
  RequiredForTransactions,
}

export interface BiometricSettingsState {
  requiredForAppAccess: boolean;
  requiredForTransactions: boolean;
}

export const initialBiometricsSettingsState: BiometricSettingsState = {
  requiredForAppAccess: false,
  requiredForTransactions: false,
};
