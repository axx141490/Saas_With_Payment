import { Badge } from "@/components/ui/badge";

interface SubscriptionBadgeProps {
  plan: "free" | "pro" | "enterprise";
}

export function SubscriptionBadge({ plan }: SubscriptionBadgeProps) {
  const config = {
    free: { label: "Free", variant: "secondary" as const },
    pro: { label: "Pro", variant: "default" as const },
    enterprise: { label: "Enterprise", variant: "default" as const },
  };

  const { label, variant } = config[plan];

  return (
    <Badge
      variant={variant}
      className={
        plan === "enterprise"
          ? "bg-purple-600 hover:bg-purple-700"
          : plan === "pro"
          ? "bg-blue-600 hover:bg-blue-700"
          : ""
      }
    >
      {label}
    </Badge>
  );
}
