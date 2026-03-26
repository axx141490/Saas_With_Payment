import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { RechargeForm } from "@/components/recharge-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function RechargePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  const balance = user?.balance ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">账户充值</h1>
        <p className="text-muted-foreground mt-1">
          为您的账户充值，享受更多服务
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>充值汇款</CardTitle>
            <CardDescription>
              选择充值金额和支付方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RechargeForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>账户余额</CardTitle>
            <CardDescription>当前可用余额</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                ¥{balance.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                充值后可用于购买服务
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>充值说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. 请确保您的账户有足够金额进行交易。</p>
          <p>2. 若充值过程遇到交易问题，请前往相应的第三方支付平台进行确认。</p>
          <p>
            3. 为了保障您的账户安全与充值体验的顺畅，您每月最多可以享受30次充值服务。
            天内未支付的订单，会自动关闭。
          </p>
          <p>4. 充值完成后可前往账户总览查看账户余额。</p>
        </CardContent>
      </Card>
    </div>
  );
}