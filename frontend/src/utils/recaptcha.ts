/**
 * Utility for reCAPTCHA/Turnstile integration.
 * Currently returns a mock token. Replace with actual implementation later.
 */
export const getToken = async (): Promise<string> => {
  return Promise.resolve("mock-recaptcha-token");
};
