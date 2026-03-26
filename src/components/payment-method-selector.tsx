"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type PaymentMethod = "card" | "alipay" | "wechat_pay";

interface Props {
  priceId: string;
}

export function PaymentMethodSelector({ priceId }: Props) {
  const [selected, setSelected] = useState<PaymentMethod>("alipay");
  const [loading, setLoading] = useState(false);

  const methods = [
    { id: "alipay" as const, label: "支付宝", icon: "/icons/alipay.svg" },
    {
      id: "wechat_pay" as const,
      label: "微信支付",
      icon: "/icons/wechat-pay.svg",
    },
    { id: "card" as const, label: "银行卡", icon: "/icons/card.svg" },
  ];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, paymentMethod: selected }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">选择支付方式</p>
      <div className="flex gap-2">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelected(method.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors text-sm ${
              selected === method.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Image
              src={method.icon}
              alt={method.label}
              width={20}
              height={20}
            />
            <span>{method.label}</span>
          </button>
        ))}
      </div>
      <Button onClick={handleCheckout} disabled={loading} className="w-full">
        {loading ? "跳转支付中..." : "立即订阅"}
      </Button>
    </div>
  );
}
