import * as React from "react";
import Loader from "@/components/ui/Loader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AppearanceSelector from "@/components/profile/AppearanceSelector";
import AddressBook from "@/components/profile/AddressBook";
import CollapsibleSection from "@/components/profile/CollapsibleSection";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Profile: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }
  if (!user) {
    return <div className="text-center py-10">You are not logged in.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 w-full">
      <ProfileHeader user={user} onLogout={() => {
        if (window.confirm('Are you sure you want to logout?')) {
          logout();
          window.location.href = '/';
        }
      }} />

      <div className="space-y-6 mt-8 clear-both">
        <section>
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <p className="text-gray-700 dark:text-gray-200">Welcome, {user.name}! Manage your account details and preferences below.</p>
          </div>
        </section>
        <CollapsibleSection title="Appearance">
          <AppearanceSelector />
        </CollapsibleSection>
        {user.role === "customer" && (
          <CollapsibleSection title="Address Book">
            <AddressBook user={user} />
          </CollapsibleSection>
        )}
        <Link to="/orders" className="block">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Orders</span>
          </div>
        </Link>
        <Link to="/faq" className="block">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">FAQ</span>
          </div>
        </Link>
        <Link to="/about" className="block">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">About</span>
          </div>
        </Link>
      </div>

    </div>
  );
};

export default Profile;
