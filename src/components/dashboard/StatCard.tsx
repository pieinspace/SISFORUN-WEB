import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent";
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl p-5 transition-all duration-200 animate-slide-up",
        variant === "default" && "stat-card",
        variant === "primary" && "stat-card-primary",
        variant === "accent" && "bg-accent text-accent-foreground rounded-xl p-5 shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p
              className={cn(
                "text-sm",
                variant === "default" ? "text-muted-foreground" : "opacity-70"
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span
                className={cn(
                  "text-xs",
                  variant === "default" ? "text-muted-foreground" : "opacity-60"
                )}
              >
                dari minggu lalu
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg",
            variant === "default"
              ? "bg-primary/10 text-primary"
              : "bg-white/20"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
