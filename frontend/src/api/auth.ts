// frontend/src/api/auth.ts
import { api } from './axios';
import type { RegisterRequest, LoginRequest, User, TokenResponse } from '../types/auth';
import axios from 'axios';

let activeRequest: Promise<User> | null = null;

interface AuthService {
  register(data: RegisterRequest): Promise<TokenResponse>;
  login(data: LoginRequest): Promise<TokenResponse>;
  getMe(force?: boolean): Promise<User>;
  updateEmail(email: string, password: string): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
}

export const authService: AuthService = {
  async register(data: RegisterRequest): Promise<TokenResponse> {
    try {
      const response = await api.post<TokenResponse>('/auth/register', data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || error.message || 'Registration failed'
        );
      }
      throw new Error('Registration failed');
    }
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    try {
      const response = await api.post<TokenResponse>('/auth/login', data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || error.message || 'Login failed'
        );
      }
      throw new Error('Login failed');
    }
  },

  async getMe(force = false): Promise<User> {
    if (activeRequest && !force) {
      return activeRequest;
    }

    try {
      activeRequest = api.get<User>('/auth/me');
      const user = await activeRequest;
      return user;
    } catch (error) {
      activeRequest = null;
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('ai_agent_token');
      }
      throw error;
    } finally {
      if (force) {
        activeRequest = null;
      }
    }
  },

  async updateEmail(email: string, password: string): Promise<void> {
    try {
      await api.put('/auth/email', { email, password });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || error.message || 'Email update failed'
        );
      }
      throw new Error('Email update failed');
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || error.message || 'Password update failed'
        );
      }
      throw new Error('Password update failed');
    }
  }
};