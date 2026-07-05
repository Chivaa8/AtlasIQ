const userKey = "atlasiq-users";
const sessionKey = "atlasiq-session";

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

export function startSession(email) {
  localStorage.setItem(sessionKey, email);
}

export function endSession() {
  localStorage.removeItem(sessionKey);
}
