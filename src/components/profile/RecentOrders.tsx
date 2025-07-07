import * as React from "react";

interface RecentOrdersProps {
  user: {
    username: string;
    phone: string;
    profileImage?: string;
    // Add more fields as needed
  };
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ user }) => {
  // Placeholder: Replace with actual recent orders fetching logic
  const orders = [
    { id: "ORD123", date: "2025-07-01", status: "Delivered", amount: 599 },
    { id: "ORD124", date: "2025-06-28", status: "Cancelled", amount: 1200 },
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Recent Orders</h2>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.length === 0 ? (
            <li className="py-2 text-gray-500 dark:text-gray-400">No recent orders found.</li>
          ) : (
            orders.map((order) => (
              <li key={order.id} className="py-2 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{order.id}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">{order.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === "Delivered" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>{order.status}</span>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">₹{order.amount}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
};

export default RecentOrders;
