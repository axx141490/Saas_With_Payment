import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap, Shield, CreditCard, BarChart3 } from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "多种支付方式",
    description: "支持微信支付、支付宝和银行卡，覆盖主流支付渠道",
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "基于 Stripe 国际支付平台，PCI DSS 合规，资金安全有保障",
  },
  {
    icon: Zap,
    title: "快速集成",
    description: "开箱即用的订阅管理系统，分钟级完成支付集成",
  },
  {
    icon: BarChart3,
    title: "数据分析",
    description: "实时订阅数据看板，掌握业务增长趋势",
  },
];

const plans = [
  { name: "Free", price: "¥0", desc: "适合个人用户" },
  { name: "Pro", price: "¥99", desc: "适合专业团队" },
  { name: "Enterprise", price: "¥299", desc: "适合大型企业" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          构建你的 <span className="text-primary">SaaS</span> 产品
          <br />
          支持微信支付 & 支付宝
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
          一站式 SaaS 订阅管理平台，集成微信支付、支付宝等主流支付方式，
          助力你快速上线付费功能。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/sign-up">开始使用</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">查看定价</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Pricing Preview */}
      <section className="px-4 py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">灵活的定价方案</h2>
          <p className="text-muted-foreground mb-12">
            选择最适合你的方案，随时升级或降级
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className="text-center">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-3xl font-bold mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /月
                    </span>
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="mt-8" size="lg" asChild>
            <Link href="/pricing">了解更多</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SaaS Pay. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              定价
            </Link>
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              登录
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
