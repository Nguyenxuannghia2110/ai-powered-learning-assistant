import { motion } from "framer-motion";

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
}) {
  return (
    <motion.div
    whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="
    w-full
    h-full
    relative
    bg-canvas-card
    border border-hairline
    rounded-md
    p-8
    flex items-center gap-4
    hover:border-primary/40
    transition
    overflow-hidden
    "
    >
      {/* glow effect */}
      <div
        className="
      absolute
      inset-0
      opacity-0
      hover:opacity-100
      bg-gradient-to-r
      from-emerald-500/10
      to-transparent
      transition
      "
      />

      <div className="bg-black/40 p-3 rounded-xl">
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      <div>
        <p className="text-sm text-body">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}
