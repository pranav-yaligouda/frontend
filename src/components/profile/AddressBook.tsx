import React from "react";

import { User } from "@/context/AuthContext";

interface AddressBookProps {
  user: User;
  addresses?: Array<{ type: string; address: string }>;
}

const AddressBook: React.FC<AddressBookProps> = ({ user, addresses = [] }) => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Address Book</h2>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        {addresses.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No addresses found.</div>
        ) : (
          <ul className="space-y-2">
            {addresses.map((addr, idx) => (
              <li key={idx} className="flex items-center justify-between p-2 rounded border border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-800 dark:text-gray-100">{addr.type}:</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">{addr.address}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AddressBook;
