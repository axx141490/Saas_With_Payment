import { getUserSubscription } from "@/lib/subscription";

interface Props {
  requiredPlan: "pro" | "enterprise";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function SubscriptionGate({
  requiredPlan,
  children,
  fallback,
}: Props) {
  const subscription = await getUserSubscription();

  const hasAccess =
    requiredPlan === "pro"
      ? subscription?.isPro || subscription?.isEnterprise
      : subscription?.isEnterprise;

  if (!hasAccess) {
    return (
      fallback || (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold">
            需要升级到 {requiredPlan === "pro" ? "Pro" : "Enterprise"} 方案
          </h3>
          <p className="text-muted-foreground mt-2">升级后即可使用此功能</p>
          <a
            href="/pricing"
            className="text-primary underline mt-4 inline-block"
          >
            查看定价
          </a>
        </div>
      )
    );
  }

  return <>{children}</>;
}
