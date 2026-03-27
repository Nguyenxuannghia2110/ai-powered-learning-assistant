import React from "react";
import { Zap } from "lucide-react";

const EmptyState = ({
  title = "Nothing here yet",
  description = "Generate to get started",
  actionLabel,
  onAction,
  loading = false,
}) => {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
      
      {/* icon */}
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
        <Zap size={28} />
      </div>

      {/* text */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">
          {title}
        </h3>
        <p className="text-emerald-200/70">
          {description}
        </p>
      </div>

      {/* action */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          disabled={loading}
          className="
          px-6 py-3
          rounded-xl
          bg-emerald-500
          text-white
          font-semibold
          hover:bg-emerald-600
          transition
          disabled:opacity-60
          "
        >
          {loading ? "Generating..." : actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;