import {
  FileText,
  MessageSquare,
  Zap,
  Layers,
  ClipboardList,
} from "lucide-react";

const iconMap = {
  content: FileText,
  chat: MessageSquare,
  ai: Zap,
  flashcards: Layers,
  quizzes: ClipboardList,
};

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-hairline">
      <nav className="flex items-center gap-8">

        {tabs.map((tab) => {
          const Icon = iconMap[tab.key];
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              disabled={tab.disabled}
              className={`
                relative
                flex items-center gap-2
                pb-4
                text-sm
                font-medium
                transition-all duration-200

                ${
                  isActive
                    ? "text-primary"
                    : "text-body hover:text-ink"
                }

                ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {Icon && (
                <Icon
                  size={16}
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
              )}

              {tab.label}

              {/* ACTIVE INDICATOR */}
              <span
                className={`
                  absolute bottom-0 left-0
                  h-[2px]
                  bg-primary
                  rounded-full
                  transition-all duration-300
                  ${
                    isActive
                      ? "w-full opacity-100"
                      : "w-0 opacity-0"
                  }
                `}
              />
            </button>
          );
        })}

      </nav>
    </div>
  );
};

export default Tabs;