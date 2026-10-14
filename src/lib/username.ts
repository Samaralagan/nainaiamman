// Accounts sign in with a username; the auth system needs an email, so each username maps to a fixed internal address.
export const normalizeUsername = (u: string) => u.trim().toLowerCase();
export const isValidUsername = (u: string) => /^[a-z0-9._-]{3,30}$/.test(normalizeUsername(u));
export const usernameToEmail = (u: string) => `${normalizeUsername(u)}@members.jaffnamatrimony.lk`;
