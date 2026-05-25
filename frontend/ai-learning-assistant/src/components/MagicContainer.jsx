import React from "react";

const clsx = (...args) => args.filter(Boolean).join(" ");

const MagicContainer = ({
  children,
  className = "",
  glowSize = 320,
  glowOpacity = 1,
  rounded = "rounded-[28px]",
  borderColor = "rgba(255,255,255,0.08)",
  hoverScale = true,
}) => {
  const containerRef = React.useRef(null);

  const [isHovered, setIsHovered] = React.useState(false);

  const [mousePos, setMousePos] = React.useState({
    x: 0,
    y: 0,
  });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "group relative overflow-hidden p-[1px] transition-all duration-500",
        rounded,
        hoverScale && "hover:scale-[1.015]",
        className
      )}
      style={{
        background: isHovered
          ? `
            radial-gradient(
              ${glowSize}px circle at ${mousePos.x}px ${mousePos.y}px,
              rgba(168,85,247,${glowOpacity}),
              rgba(59,130,246,${glowOpacity}),
              rgba(236,72,153,${glowOpacity}),
              transparent 75%
            )
          `
          : borderColor,

        transition:
          "background 0.2s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* ambient blur */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
          rounded
        )}
        style={{
          background: `
            radial-gradient(
              400px circle at ${mousePos.x}px ${mousePos.y}px,
              rgba(168,85,247,0.18),
              rgba(59,130,246,0.12),
              rgba(236,72,153,0.10),
              transparent 75%
            )
          `,
        }}
      />

      {/* shimmer */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-y-0 left-[-120%] w-[60%] rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[140%] group-hover:opacity-100",
          rounded
        )}
      />

      {/* inner content */}
      <div
        className={clsx(
          "relative z-10 h-full w-full bg-[#050505]/98 backdrop-blur-xl",
          rounded
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default MagicContainer;