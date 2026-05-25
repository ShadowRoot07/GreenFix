import { CheckCircle2, Circle, Clock } from "lucide-react";
import BadgeStatus from "./ui/BadgeStatus";

export default function MilestoneRow({ milestone }) {
  const Icon =
    milestone.status === "Completed"
      ? CheckCircle2
      : milestone.status === "Voting"
      ? Clock
      : Circle;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={22} />
        </div>

        <div>
          <h4 className="font-bold text-white">{milestone.title}</h4>
          <p className="mt-1 text-sm text-text-secondary">{milestone.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <BadgeStatus status={milestone.status} />
        <span className="font-mono font-bold text-primary">{milestone.percentage}%</span>
      </div>
    </div>
  );
}
