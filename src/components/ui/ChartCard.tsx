export default function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-black text-text mb-2">{title}</h1>
      {children}
    </div>
  );
}
