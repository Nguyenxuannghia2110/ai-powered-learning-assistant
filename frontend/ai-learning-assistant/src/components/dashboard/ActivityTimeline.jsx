import { format } from "date-fns";
import { Upload, Brain, Trophy } from "lucide-react";

export default function ActivityTimeline({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "upload":
        return Upload;
      case "quiz":
        return Trophy;
      default:
        return Brain;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "upload":
        return "text-green-400";
      case "quiz":
        return "text-yellow-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div
      className="bg-gradient-to-b
  from-[#07120e]
  to-[#050807]
  border border-white/10
  rounded-2xl
  p-6
  h-[420px]
  overflow-y-auto
  custom-scrollbar
"
    >
      <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent activity</p>
      ) : (
        <div className="space-y-6">
          {activities.map((item, index) => {
            const Icon = getIcon(item.type);

            return (
              <div
                key={item.id || item._id || index}
                className="
  flex
  items-start
  gap-4
  p-2
  rounded-lg
  hover:bg-white/5
  transition
  duration-200
  "
              >
                {/* Timeline icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full bg-black border border-white/10 ${getColor(
                      item.type,
                    )}`}
                  >
                    <Icon size={16} />
                  </div>

                  {index !== activities.length - 1 && (
                    <div className="w-px h-8 bg-white/10 mt-1"></div>
                  )}
                </div>

                {/* Activity content */}
                <div className="flex-1">
                  <p className="text-sm text-gray-200">{item.title}</p>

                  {item.score !== undefined && (
                    <p className="text-xs text-green-400 mt-1">
                      Score: {item.score}%
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(item.createdAt), "MMM dd, HH:mm")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
