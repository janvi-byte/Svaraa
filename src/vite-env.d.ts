/// <reference types="vite/client" />

interface GoogleIdentityCredentialResponse {
  credential: string;
}

interface GoogleIdentityConfiguration {
  client_id: string;
  callback: (response: GoogleIdentityCredentialResponse) => void;
}

interface GoogleIdentityClient {
  initialize(configuration: GoogleIdentityConfiguration): void;
  prompt(): void;
}

interface GoogleIdentityAccounts {
  id: GoogleIdentityClient;
}

interface GoogleIdentityGlobal {
  accounts: GoogleIdentityAccounts;
}

interface Window {
  google?: GoogleIdentityGlobal;
}
