import * as React from "react";

const faqs = [
  { q: "How do I change my password?", a: "Go to your profile settings and select 'Change Password'." },
  { q: "How do I track my order?", a: "Navigate to 'Recent Orders' to see tracking details." },
  { q: "How do I add a new address?", a: "Use the Address Book section to add or edit your addresses." },
];

const FAQ: React.FC = () => (
  <section>
    <h2 className="text-xl font-semibold mb-2">FAQ</h2>
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {faqs.map((faq, idx) => (
          <li key={idx} className="py-3">
            <div className="font-medium text-gray-900 dark:text-gray-100">Q: {faq.q}</div>
            <div className="text-gray-700 dark:text-gray-300 mt-1">A: {faq.a}</div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default FAQ;
