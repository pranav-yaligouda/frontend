import * as React from "react";
import type { OrderStatus } from "@/types/order";

interface OrderFilterBarProps {
  status: string;
  setStatus: (status: string) => void;
  search: string;
  setSearch: (search: string) => void;
}

const statuses: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PLACED", label: "Placed" },
  { value: "ACCEPTED_BY_VENDOR", label: "Accepted by Vendor" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "ACCEPTED_BY_AGENT", label: "Accepted by Agent" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

const OrderFilterBar: React.FC<OrderFilterBarProps> = ({ status, setStatus, search, setSearch }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <select
        className="border border-gray-300 bg-white px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-athani-400 focus:border-athani-400 transition w-full sm:w-auto"
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <input
        type="search"
        className="border border-gray-300 bg-white px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-athani-400 focus:border-athani-400 transition flex-1 min-w-0"
        placeholder="Search by order ID or customer"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
  </div>
);

export default OrderFilterBar; 