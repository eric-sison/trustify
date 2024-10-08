export type AuthCodePayload = {
  sid: string;
  userId: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  codeChallenge?: string;
  codeMethod?: string;
  nonce?: string;
};
