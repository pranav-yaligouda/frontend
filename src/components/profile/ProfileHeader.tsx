import * as React from "react";

import { User } from "@/context/AuthContext";

interface ProfileHeaderProps {
  user: User;
  onLogout: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onLogout }) => {
  return (
    <div className="relative flex items-center space-x-4 bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      {/* Logout button top right */}
      <button
        onClick={onLogout}
        title="Logout"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 transition flex items-center justify-center"
        aria-label="Logout"
        style={{ zIndex: 2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="text-red-600 dark:text-red-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h12m0 0l-3-3m3 3l-3 3" />
        </svg>
      </button>
      {user.profileImage ? (
        <img
          src={user.profileImage}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover border-2 border-primary"
        />
      ) : (
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white text-2xl font-bold border-2 border-primary">
          {getInitials(user.name)}
        </div>
      )}
      <div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
        <div className="text-gray-500 dark:text-gray-400 text-sm">{user.phone}</div>
      </div>
    </div>
  );
};

export default ProfileHeader;
