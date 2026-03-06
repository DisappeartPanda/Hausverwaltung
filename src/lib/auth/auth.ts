export type UserRole = 'guest' | 'tenant' | 'landlord';

interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string;
}

// Simple global state ohne externe Dependencies
let currentUser: User | null = null;
let listeners: (() => void)[] = [];

export function getUser(): User | null {
    return currentUser;
}

export function getUserRole(): UserRole {
    return currentUser?.role || 'guest';
}

export function isAuthenticated(): boolean {
    return currentUser !== null;
}

export function login(userData: User): void {
    currentUser = userData;
    notifyListeners();
    // Optional: In localStorage speichern
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
    }
}

export function logout(): void {
    currentUser = null;
    notifyListeners();
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
    }
}

export function subscribe(callback: () => void): () => void {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
}

function notifyListeners(): void {
    listeners.forEach(l => l());
}

// Beim Start aus localStorage laden
if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('user');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse user data');
        }
    }
}