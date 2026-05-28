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
        className="glass-card flex min-h-[260px] w-full cursor-pointer flex-col overflow-hidden p-6 text-ink transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(139,92,246,0.15)]"
      >
        <div className="flex flex-1 flex-col">
          {(subtitle || date) && (
            <div className="mb-3 flex items-center justify-between text-[13px] text-body">
              <span>{subtitle}</span>
              <span>{date}</span>
            </div>
          )}

          {title && (
            <p className="mb-[18px] text-2xl font-bold leading-[1.3] text-ink">
              {title}
            </p>
          )}

          {children}

          {tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full border border-purple-200 bg-purple-100 px-3 py-1.5 text-[11px] font-semibold uppercase text-purple-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {footer && (
          <div className="mt-[18px] text-sm font-semibold text-body">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseCard;
