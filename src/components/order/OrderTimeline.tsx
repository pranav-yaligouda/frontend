import * as React from "react";
import type { OrderStatus } from "@/types/order";

const STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PLACED", label: "Placed" },
  { status: "ACCEPTED_BY_VENDOR", label: "Accepted" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY_FOR_PICKUP", label: "Ready" },
  { status: "ACCEPTED_BY_AGENT", label: "Agent Accepted" },
  { status: "PICKED_UP", label: "Picked Up" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
  { status: "CANCELLED", label: "Cancelled" },
  { status: "REJECTED", label: "Rejected" },
];

interface OrderTimelineProps {
  status: OrderStatus;
  timestamps?: Record<string, string>;
}

const getStepState = (idx: number, currentStep: number) => {
  if (idx < currentStep) return "completed";
  if (idx === currentStep) return "current";
  return "upcoming";
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, timestamps }) => {
  const currentStep = STATUS_STEPS.findIndex((s) => s.status === status);
  return (
    <div
      className="flex items-center gap-0 md:gap-2 overflow-x-auto py-2 px-1 md:px-0"
      aria-label="Order status timeline"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {STATUS_STEPS.map((step, idx) => {
        const stepState = getStepState(idx, currentStep);
        const isLast = idx === STATUS_STEPS.length - 1;
        const timestamp = timestamps?.[step.status];
        return (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center min-w-[70px]">
              <div
                className={`flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full border-2 transition-all
                  ${stepState === "completed" ? "bg-green-500 border-green-600 text-white" : ""}
                  ${stepState === "current" ? "bg-primary border-primary text-white shadow-lg scale-110" : ""}
                  ${stepState === "upcoming" ? "bg-white border-gray-300 text-gray-400" : ""}
                `}
                aria-current={stepState === "current" ? "step" : undefined}
                aria-label={step.label}
                title={step.label}
              >
                {stepState === "completed" ? (
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <span className="font-bold text-base md:text-lg">{idx + 1}</span>
                )}
              </div>
              <span
                className={`mt-1 text-xs md:text-sm text-center whitespace-nowrap
                  ${stepState === "current" ? "font-bold text-primary" : stepState === "completed" ? "text-green-700" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>
              {timestamp && (
                <span className="text-[10px] md:text-xs text-gray-400 mt-0.5">{timestamp}</span>
              )}
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-1 md:h-1 mx-1 md:mx-2 rounded-full transition-all
                  ${idx < currentStep ? "bg-green-500" : "bg-gray-200"}
                `}
                style={{ minWidth: 24 }}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderTimeline; 