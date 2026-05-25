export default function BadgeStatus({ status }) {
  const variants = {
    Funding: "bg-secondary/10 text-secondary border-secondary/20",
    Active: "bg-primary/10 text-primary border-primary/20",
    Voting: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Completed: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    Defaulted: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        variants[status] || variants.Funding
      }`}
    >
      {status}
    </span>
  );
}
