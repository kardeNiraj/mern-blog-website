export const createSession = (key, value) => {
  return sessionStorage.setItem(key, value);
};

export const checkSession = (key) => {
  return sessionStorage.getItem(key);
};

export const clearSession = (key) => {
  return sessionStorage.removeItem(key);
};
