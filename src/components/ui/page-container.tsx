export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in-0 duration-300">
      {children}
    </div>
  );
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
      {children}
    </div>
  );
};

export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="space-y-1 w-full">{children}</div>;
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
      {children}
    </h1>
  );
};

export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <p className="text-sm text-muted-foreground mt-1.5">{children}</p>;
};

export const PageActions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-2 w-full sm:w-auto">{children}</div>;
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-150">
      {children}
    </div>
  );
};
