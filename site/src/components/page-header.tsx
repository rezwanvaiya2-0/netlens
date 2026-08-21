export function PageHeader({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10 border-b border-border/70 pb-8">
      {kicker && (
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {kicker}
        </p>
      )}
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
