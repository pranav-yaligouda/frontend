import * as React from "react";

const themes = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Device", value: "system" },
];

const AppearanceSelector: React.FC = () => {
  const [theme, setTheme] = React.useState("system");

  React.useEffect(() => {
    // On mount, set theme from local storage or system
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);
    document.documentElement.classList.remove("light", "dark");
    if (saved === "dark" || (saved === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  }, []);

  const handleThemeChange = (value: string) => {
    setTheme(value);
    localStorage.setItem("theme", value);
    document.documentElement.classList.remove("light", "dark");
    if (value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Appearance</h2>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col sm:flex-row items-center gap-4">
        <span className="text-gray-700 dark:text-gray-200">Select Theme:</span>
        <div className="flex gap-2">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => handleThemeChange(t.value)}
              className={`px-4 py-2 rounded transition border border-gray-300 dark:border-gray-700 focus:outline-none ${theme === t.value ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppearanceSelector;
