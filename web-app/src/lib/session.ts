/**
 * Session Management Utility
 * Handles localStorage-based session persistence for better UX
 */

const STORAGE_KEYS = {
    USER_ROLE: 'ride_user_role',
    LAST_VIEW: 'ride_last_view',
    WALLET_CONNECTED: 'ride_wallet_connected',
    AUTH_COMPLETED: 'ride_auth_completed',
} as const;

export type ViewState = 'hero' | 'role-selection' | 'dashboard';

/**
 * Save user's last view state
 */
export function saveLastView(view: ViewState): void {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_VIEW, view);
    } catch (error) {
        console.warn('Failed to save last view:', error);
    }
}

/**
 * Get user's last view state
 */
export function getLastView(): ViewState | null {
    try {
        return localStorage.getItem(STORAGE_KEYS.LAST_VIEW) as ViewState | null;
    } catch (error) {
        console.warn('Failed to get last view:', error);
        return null;
    }
}

/**
 * Save user role preference
 */
export function saveUserRole(role: 'driver' | 'rider'): void {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } catch (error) {
        console.warn('Failed to save user role:', error);
    }
}

/**
 * Get saved user role
 */
export function getUserRole(): 'driver' | 'rider' | null {
    try {
        return localStorage.getItem(STORAGE_KEYS.USER_ROLE) as 'driver' | 'rider' | null;
    } catch (error) {
        console.warn('Failed to get user role:', error);
        return null;
    }
}

/**
 * Mark that authentication was completed (for first-time flow)
 */
export function setAuthCompleted(completed: boolean): void {
    try {
        localStorage.setItem(STORAGE_KEYS.AUTH_COMPLETED, completed.toString());
    } catch (error) {
        console.warn('Failed to set auth completed:', error);
    }
}

/**
 * Check if user completed authentication before
 */
export function isAuthCompleted(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEYS.AUTH_COMPLETED) === 'true';
    } catch (error) {
        console.warn('Failed to check auth completed:', error);
        return false;
    }
}

/**
 * Clear all session data (on logout)
 */
export function clearSession(): void {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.warn('Failed to clear session:', error);
    }
}

/**
 * Check if user has an active session
 */
export function hasActiveSession(): boolean {
    try {
        const hasRole = !!localStorage.getItem(STORAGE_KEYS.USER_ROLE);
        const hasView = !!localStorage.getItem(STORAGE_KEYS.LAST_VIEW);
        return hasRole || hasView;
    } catch (error) {
        console.warn('Failed to check active session:', error);
        return false;
    }
}
