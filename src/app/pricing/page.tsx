import { PricingCard } from "@/components/pricing-card";

const plans = [
  {
    name: "Free",
    price: "¥0",
    description: "适合个人用户体验基础功能",
    features: [
      "基础功能访问",
      "最多 3 个项目",
      "社区支持",
      "基础数据分析",
    ],
    isFree: true,
  },
  {
    name: "Pro",
    price: "¥99",
    description: "适合专业团队和中小企业",
    features: [
      "全部基础功能",
      "无限项目",
      "优先支持",
      "高级数据分析",
      "API 访问",
      "自定义品牌",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "¥299",
    description: "适合大型企业和定制需求",
    features: [
      "全部 Pro 功能",
      "专属客户经理",
      "SLA 保障",
      "自定义集成",
      "团队管理",
      "审计日志",
      "SSO 登录",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || "",
  },
];

export default function PricingPage() {
  return (
    <div className="px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">选择适合你的方案</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            支持微信支付、支付宝和银行卡，随时升级或取消
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
