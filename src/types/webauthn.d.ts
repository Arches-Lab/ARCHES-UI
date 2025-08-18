// WebAuthn API TypeScript declarations
declare global {
  interface Window {
    PublicKeyCredential: typeof PublicKeyCredential;
  }
}

interface PublicKeyCredentialRequestOptions {
  challenge: ArrayBuffer;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  userVerification?: UserVerificationRequirement;
  timeout?: number;
}

interface PublicKeyCredentialCreationOptions {
  challenge: ArrayBuffer;
  rp: PublicKeyCredentialRpEntity;
  user: PublicKeyCredentialUserEntity;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  excludeCredentials?: PublicKeyCredentialDescriptor[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
  extensions?: AuthenticationExtensionsClientInputs;
}

interface PublicKeyCredentialRpEntity {
  id?: string;
  name: string;
  icon?: string;
}

interface PublicKeyCredentialUserEntity {
  id: ArrayBuffer;
  name: string;
  displayName: string;
  icon?: string;
}

interface PublicKeyCredentialParameters {
  type: PublicKeyCredentialType;
  alg: number;
}

interface PublicKeyCredentialDescriptor {
  type: PublicKeyCredentialType;
  id: ArrayBuffer;
  transports?: AuthenticatorTransport[];
}

interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment;
  residentKey?: ResidentKeyRequirement;
  requireResidentKey?: boolean;
  userVerification?: UserVerificationRequirement;
}

interface AuthenticatorAttestationResponse extends AuthenticatorResponse {
  attestationObject: ArrayBuffer;
}

interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
  authenticatorData: ArrayBuffer;
  signature: ArrayBuffer;
  userHandle?: ArrayBuffer;
}

interface AuthenticatorResponse {
  clientDataJSON: ArrayBuffer;
}

interface PublicKeyCredential extends Credential {
  readonly type: 'public-key';
  readonly rawId: ArrayBuffer;
  readonly response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
  getClientExtensionResults(): AuthenticationExtensionsClientOutputs;
}

declare class PublicKeyCredential extends Credential {
  static isUserVerifyingPlatformAuthenticatorAvailable(): Promise<boolean>;
  static isConditionalMediationAvailable(): Promise<boolean>;
}

type PublicKeyCredentialType = 'public-key';
type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal';
type AuthenticatorAttachment = 'platform' | 'cross-platform';
type ResidentKeyRequirement = 'required' | 'preferred' | 'discouraged';
type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';
type AttestationConveyancePreference = 'none' | 'indirect' | 'direct' | 'enterprise';

interface AuthenticationExtensionsClientInputs {
  appid?: string;
  appidExclude?: string;
  uvm?: boolean;
  credProps?: boolean;
  hmacCreateSecret?: boolean;
}

interface AuthenticationExtensionsClientOutputs {
  appid?: boolean;
  uvm?: UvmEntry[];
  credProps?: CredentialPropertiesOutput;
  hmacCreateSecret?: boolean;
}

interface UvmEntry {
  userVerificationMethod: number;
  keyProtectionType: number;
  matcherProtectionType: number;
}

interface CredentialPropertiesOutput {
  rk?: boolean;
}

export {}; 