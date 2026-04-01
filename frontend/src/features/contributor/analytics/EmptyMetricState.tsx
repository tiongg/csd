type EmptyMetricStateProps = {
  message: string;
};

export function EmptyMetricState({ message }: EmptyMetricStateProps) {
  return (
    <div className="mt-4 flex h-[240px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-slate-800">No course data yet</p>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}
