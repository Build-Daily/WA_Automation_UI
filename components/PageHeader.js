export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-semibold text-text-primary truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
