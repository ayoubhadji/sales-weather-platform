import axios from "axios";

const API_URL = "http://localhost:3000/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "FRANCHISE";
  };
}

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/login`,
    data
  );

  localStorage.setItem("token", response.data.access_token);
  localStorage.setItem("user", JSON.stringify(response.data.user));

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getToken = () => localStorage.getItem("token");

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => !!getToken();

export default {
  login,
  logout,
  getToken,
  getUser,
  isAuthenticated,
};