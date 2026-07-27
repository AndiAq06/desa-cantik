import { apiClient } from "./apiClient";

const USER_KEY = "desaCantikUser";

const persistUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* abaikan kesalahan penyimpanan */
  }
};

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const authApi = {
  async login(username, password) {
    const response = await apiClient.post("/auth/login", {
      login: username,
      password,
    });

    const { token, user } = response?.data || {};
    if (token) {
      apiClient.setToken(token);
    }
    if (user) {
      persistUser(user);
    }

    return { token, user };
  },

  async me() {
    const response = await apiClient.get("/user");
    const user = response?.data;
    if (user) {
      persistUser(user);
    }
    return user;
  },

  async forgotPassword(email) {
    const response = await apiClient.post("/auth/password/forgot", { email });
    return response;
  },

  async resetPassword(email, token, password, passwordConfirmation) {
    const response = await apiClient.post("/auth/password/reset", {
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response;
  },

  logout() {
    apiClient.clearToken();
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      /* abaikan kesalahan penyimpanan */
    }
  },

  getStoredUser: readStoredUser,
};
