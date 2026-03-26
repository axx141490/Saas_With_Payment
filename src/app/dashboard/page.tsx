import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/lib/subscription";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ManageSubscriptionButton } from "@/components/manage-subscription-button";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const subscription = await getUserSubscription();

  // Get user balance
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  const balance = user?.balance ?? 0;

  const plan = subscription?.isEnterprise
    ? "enterprise"
    : subscription?.isPro
    ? "pro"
    : "free";

  const paymentMethodLabels: Record<string, string> = {
    alipay: "支付宝",
    wechat_pay: "微信支付",
    card: "银行卡",
    unknown: "未知",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          欢迎回来！管理你的订阅和账户。
        </p>
      </div>

      {plan === "free" && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">你当前使用的是免费方案</p>
              <p className="text-sm text-muted-foreground">
                升级到 Pro 或 Enterprise 方案以解锁更多功能
              </p>
            </div>
            <Link href="/pricing" className={buttonVariants()}>
              升级方案
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>账户余额</CardTitle>
            <CardDescription>当前可用余额</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-primary">
                ¥{balance.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                可用于购买服务
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              当前方案
              <SubscriptionBadge plan={plan} />
            </CardTitle>
            <CardDescription>你的订阅信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription?.isActive ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">方案</span>
                  <span className="text-sm font-medium">
                    {plan === "enterprise"
                      ? "Enterprise"
                      : plan === "pro"
                      ? "Pro"
                      : "Free"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">状态</span>
                  <span className="text-sm font-medium text-green-600">
                    活跃
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    到期时间
                  </span>
                  <span className="text-sm font-medium">
                    {subscription.currentPeriodEnd.toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    支付方式
                  </span>
                  <span className="text-sm font-medium">
                    {paymentMethodLabels[subscription.paymentMethod] ||
                      subscription.paymentMethod}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                你目前没有活跃的付费订阅
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
            <CardDescription>管理你的账户</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/dashboard/recharge"
              className={buttonVariants({
                className: "w-full",
              })}
            >
              账户充值
            </Link>
            {subscription?.isActive && <ManageSubscriptionButton />}
            <Link
              href="/pricing"
              className={buttonVariants({
                variant: "outline",
                className: "w-full",
              })}
            >
              {subscription?.isActive ? "更换方案" : "升级方案"}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
