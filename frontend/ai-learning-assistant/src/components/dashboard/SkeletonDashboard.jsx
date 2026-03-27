const SkeletonCard = () => (
  <div className="animate-pulse bg-white/5 border border-white/10 rounded-xl h-28"></div>
);

const SkeletonChart = () => (
  <div className="animate-pulse bg-white/5 border border-white/10 rounded-xl h-72"></div>
);

const SkeletonTimeline = () => (
  <div className="animate-pulse bg-white/5 border border-white/10 rounded-xl h-72"></div>
);

const SkeletonDashboard = () => {
  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="animate-pulse bg-white/5 border border-white/10 rounded-xl h-32"></div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>

        <SkeletonTimeline />
      </div>

    </div>
  );
};

export default SkeletonDashboard;