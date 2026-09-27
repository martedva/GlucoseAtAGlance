/// <reference types="chrome" />

import { getLibreToken } from '../api/libre/libre-api';
import LoginResponse from '../types/loginResponse';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  patientId: string;
  expiresAt?: number;
}

const STORAGE_KEY_TOKEN = 'auth_token';
const STORAGE_KEY_PATIENT_ID = 'patient_id';

/**
 * AuthService - Handles authentication for LibreLinkUp API
 * 
 * Responsibilities:
 * - Login with email/password
 * - Store/retrieve tokens securely
 * - Token refresh on expiration
 * - Logout
 */
export const authService = {
  /**
   * Login with LibreLinkUp credentials
   */
  async login(email: string, password: string): Promise<AuthToken> {
    try {
      const response: LoginResponse = await getLibreToken(email, password);
      
      if (!response?.data?.authTicket?.token || !response?.data?.user?.id) {
        throw new Error('Invalid response from authentication server');
      }

      const token: AuthToken = {
        token: response.data.authTicket.token,
        patientId: response.data.user.id,
        expiresAt: response.data.authTicket.expires,
      };

      await this.saveToken(token);
      return token;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  /**
   * Save token to chrome storage
   */
  async saveToken(token: AuthToken): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(
        {
          [STORAGE_KEY_TOKEN]: token.token,
          [STORAGE_KEY_PATIENT_ID]: token.patientId,
        },
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        }
      );
    });
  },

  /**
   * Get stored token from chrome storage
   */
  async getToken(): Promise<AuthToken | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        [STORAGE_KEY_TOKEN, STORAGE_KEY_PATIENT_ID],
        (result) => {
          if (result[STORAGE_KEY_TOKEN] && result[STORAGE_KEY_PATIENT_ID]) {
            resolve({
              token: result[STORAGE_KEY_TOKEN],
              patientId: result[STORAGE_KEY_PATIENT_ID],
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  /**
   * Logout - clear stored credentials
   */
  async logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(
        [STORAGE_KEY_TOKEN, STORAGE_KEY_PATIENT_ID],
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        }
      );
    });
  },

  /**
   * Get patient ID from storage
   */
  async getPatientId(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY_PATIENT_ID, (result) => {
        resolve(result[STORAGE_KEY_PATIENT_ID] || null);
      });
    });
  },
};

export default authService;