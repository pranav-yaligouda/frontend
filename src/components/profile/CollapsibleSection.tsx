import * as React from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, className }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <section className={className}>
      <button
        className="w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 rounded-lg shadow font-semibold text-lg focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-200 ${open ? "rotate-90" : "rotate-0"}`} aria-hidden="true">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && <div className="p-4 border-t border-gray-200 dark:border-gray-700">{children}</div>}
    </section>
  );
};

export default CollapsibleSection;
