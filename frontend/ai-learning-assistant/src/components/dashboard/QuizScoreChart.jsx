import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const QuizScoreChart = ({ data = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-b from-[#07120e] to-[#050807] 
      border border-white/10 rounded-xl p-6
      hover:border-emerald-400/30 transition"
    >
      <h2 className="text-lg font-semibold text-white mb-6">
        Quiz Score Trend
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No quiz data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "#0b0f0c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
              }}
            />

            <Line
              type="natural"
              dataKey="score"
              stroke="#34d399"
              strokeWidth={3}
              dot={{
                r: 4,
                stroke: "#34d399",
                strokeWidth: 2,
                fill: "#050807",
              }}
              activeDot={{
                r: 7,
                stroke: "#34d399",
                strokeWidth: 3,
                fill: "#050807",
              }}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default QuizScoreChart;
