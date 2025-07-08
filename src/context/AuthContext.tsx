import * as React from "react";

// User roles
// Unified user roles (matches backend exactly)
export enum UserRole {
  CUSTOMER = 'customer',
  HOTEL_MANAGER = 'hotel_manager',
  STORE_OWNER = 'store_owner',
  DELIVERY_AGENT = 'delivery_agent',
  ADMIN = 'admin'
}

// User interface
export interface User {
  id: string;
  name: string;
  email?: string; // Made optional
  phone: string; // Added phone field
  role: UserRole;
  storeName?: string; // For store_owner
  hotelName?: string; // For hotel_manager
  // Delivery agent fields
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  driverLicenseNumber?: string;
  vehicleRegistrationNumber?: string;
  isOnline?: boolean;
  lastOnlineAt?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, password: string, role: UserRole, email?: string, storeId?: string, hotelId?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Create auth context
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);


// No more mock users: use real API
import * as authApi from '@/api/authApi';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check for saved user on initial load
  React.useEffect(() => {
    const savedUser = localStorage.getItem('athani_user');
    try {
      // Only parse if not undefined/null and is valid JSON
      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      // If corrupted, clear it out
      localStorage.removeItem('athani_user');
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ phone, password });
      // Only set user/token if both are valid
      if (data?.user && data?.token) {
        setUser(data.user);
        localStorage.setItem('athani_user', JSON.stringify(data.user));
        localStorage.setItem('athani_token', data.token);
      } else {
        // Defensive: clear localStorage and throw error if login response is invalid
        localStorage.removeItem('athani_user');
        localStorage.removeItem('athani_token');
        throw new Error('Invalid login response: user or token missing');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Defensive: clear localStorage on error
      localStorage.removeItem('athani_user');
      localStorage.removeItem('athani_token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, phone: string, password: string, role: UserRole, email?: string, storeName?: string, hotelName?: string) => {
    setIsLoading(true);
    try {
      const payload: authApi.RegisterPayload = {
        name,
        phone,
        password,
        role,
        email,
        storeName,
        hotelName
      };
      const data = await authApi.register(payload);
      setUser(data.user);
      localStorage.setItem('athani_user', JSON.stringify(data.user));
      localStorage.setItem('athani_token', data.token);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('athani_user');
    localStorage.removeItem('athani_token');
  };

  // Check if user has specific role
  const hasRole = (roles: UserRole[]) => {
    return !!user && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      hasRole,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
