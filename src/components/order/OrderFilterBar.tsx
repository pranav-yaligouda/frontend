import * as React from "react";
import type { OrderStatus } from "@/types/order";

interface OrderFilterBarProps {
  status: string;
  setStatus: (status: string) => void;
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
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

const OrderFilterBar: React.FC<OrderFilterBarProps> = ({ status, setStatus, search, setSearch, page, setPage }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
    <div className="flex gap-2 items-center">
      <select
        className="border px-3 py-2 rounded-md"
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <input
        type="search"
        className="border px-3 py-2 rounded-md"
        placeholder="Search by order ID or customer"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
    <div className="flex gap-2 items-center">
      <button
        className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => setPage(p => Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="px-3 py-1">Page {page}</span>
      <button
        className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  </div>
);

export default OrderFilterBar; 