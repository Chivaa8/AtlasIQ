const userKey = "atlasiq-users";
const sessionKey = "atlasiq-session";
const tokenKey = "atlasiq-token";

export function users() {
  return JSON.parse(localStorage.getItem(userKey) || "[]");
}

export function saveUsers(nextUsers) {
  localStorage.setItem(userKey, JSON.stringify(nextUsers));
}

export function currentUser() {
  const email = localStorage.getItem(sessionKey);
  return users().find((user) => user.email === email);
}

export function sessionToken() {
  return localStorage.getItem(tokenKey);
}

export function saveSession(session) {
  saveUsers(upsertUser(users(), session.user));
  localStorage.setItem(tokenKey, session.token);
  startSession(session.user.email);
}

export function startSession(email) {
  localStorage.setItem(sessionKey, email);
}

export function endSession() {
  localStorage.removeItem(sessionKey);
  localStorage.removeItem(tokenKey);
}

function upsertUser(list, nextUser) {
  const exists = list.some((user) => sameUser(user, nextUser));
  return exists
    ? list.map((user) => (sameUser(user, nextUser) ? { ...user, ...nextUser } : user))
    : [...list, nextUser];
}

function sameUser(user, nextUser) {
  return (nextUser.id && user.id === nextUser.id) || user.email === nextUser.email;
}
