import { supabase } from '../lib/supabase';

export class SessionManager {
  private static isRefreshing = false;
  private static refreshPromise: Promise<any> | null = null;

  /**
   * Safely refresh the session with retry logic
   */
  static async refreshSession(): Promise<{ session: any; error: any }> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private static async performRefresh(): Promise<{ session: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        
        // If refresh fails with invalid token, clear everything
        if (this.isRefreshTokenError(error)) {
          await this.clearInvalidSession();
          return { session: null, error };
        }
      }
      
      return { session: data.session, error };
    } catch (error) {
      console.error('Session refresh exception:', error);
      return { session: null, error };
    }
  }

  /**
   * Check if error is related to invalid refresh token
   */
  static isRefreshTokenError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toLowerCase() || '';
    
    return (
      errorMessage.includes('invalid refresh token') ||
      errorMessage.includes('refresh token not found') ||
      errorMessage.includes('refresh_token_not_found') ||
      errorCode === 'refresh_token_not_found' ||
      errorCode === 'invalid_refresh_token'
    );
  }

  /**
   * Clear invalid session data
   */
  static async clearInvalidSession(): Promise<void> {
    try {
      console.log('Clearing invalid session data...');
      
      // Clear localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('supabase.auth')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear sessionStorage as well
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('supabase.auth')) {
          sessionKeysToRemove.push(key);
        }
      }
      
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Force sign out
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Check if current session is valid
   */
  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        if (this.isRefreshTokenError(error)) {
          await this.clearInvalidSession();
        }
        return false;
      }
      
      return !!session;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Get session with automatic refresh if needed
   */
  static async getValidSession(): Promise<{ session: any; error: any }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        if (this.isRefreshTokenError(error)) {
          await this.clearInvalidSession();
          return { session: null, error };
        }
      }
      
      // If session exists but access token is expired, try to refresh
      if (session && this.isTokenExpired(session.access_token)) {
        console.log('Access token expired, attempting refresh...');
        return await this.refreshSession();
      }
      
      return { session, error };
    } catch (error) {
      console.error('Get valid session failed:', error);
      return { session: null, error };
    }
  }

  /**
   * Check if JWT token is expired
   */
  private static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Add 30 second buffer to account for clock skew
      return payload.exp < (currentTime + 30);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume expired if we can't parse
    }
  }
}