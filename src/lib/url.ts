export const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://adelelawady.github.io/stacktogether';
  }
  return 'http://localhost:3000';
};

export const getRedirectUrl = () => {
  return `${getBaseUrl()}/auth/callback`;
}; 