const USER_KEY = 'currentUser';
const TOKEN_KEY = 'authToken';
const WORKER_KEY = 'currentWorker';

function readJson(key) {
  const value = localStorage.getItem(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function getStoredUser() {
  return readJson(USER_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredWorker() {
  return readJson(WORKER_KEY);
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(WORKER_KEY);
}

export function getStoredSession() {
  const user = getStoredUser();
  const token = getStoredToken();

  if (!user || !token) {
    if (user || token) {
      clearSession();
    }

    return {
      user: null,
      token: null,
      worker: null,
      isAuthenticated: false,
    };
  }

  return {
    user,
    token,
    worker: getStoredWorker(),
    isAuthenticated: true,
  };
}

export function storeSession({ user, token, worker }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);

  if (worker) {
    localStorage.setItem(WORKER_KEY, JSON.stringify(worker));
    return;
  }

  localStorage.removeItem(WORKER_KEY);
}
