const BaseCard = ({
  title,
  subtitle,
  date,
  tags = [],
  footer,
  children,
  className = "",
  onClick,
}) => {
  return (
    <div className={`group w-full ${className}`}>
      <div
        onClick={onClick}
        className="flex min-h-[260px] w-full cursor-pointer flex-col overflow-hidden rounded-[20px] border-2 border-transparent p-5 text-white backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-2 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(168,85,247,0.2),0_10px_20px_rgba(6,182,212,0.15)]"
        style={{
          background:
            "linear-gradient(#18181b, #18181b) padding-box, linear-gradient(145deg, transparent 20%, #a855f7, #06b6d4) border-box",
        }}
      >
        <div className="flex flex-1 flex-col">
          {(subtitle || date) && (
            <div className="mb-3 flex items-center justify-between text-[13px] text-gray-400">
              <span>{subtitle}</span>
              <span>{date}</span>
            </div>
          )}

          {title && (
            <p className="mb-[18px] text-2xl font-bold leading-[1.3] text-white">
              {title}
            </p>
          )}

          {children}

          {tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1.5 text-[11px] font-semibold uppercase text-purple-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {footer && (
          <div className="mt-[18px] text-sm font-semibold text-gray-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseCard;
