"use client";

import { useState } from "react";
import Image from "next/image";

type PaymentMethod = "card" | "alipay" | "wechat_pay";

interface Props {
  priceId: string;
}

export function PaymentMethodSelector({ priceId }: Props) {
  const [selected, setSelected] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Note: Stripe subscriptions only support card payments
  // Alipay and WeChat Pay only work for one-time payments
  const methods = [
    { id: "card" as const, label: "银行卡", icon: "/icons/card.svg" },
  ];

  const handleCheckout = async (method: PaymentMethod) => {
    console.log("Checkout clicked:", method, "PriceId:", priceId);
    setLoading(true);
    setSelected(method);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, paymentMethod: method }),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok) {
        throw new Error(data.error || "结账失败");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("未收到支付链接");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "支付初始化失败，请稍后重试";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        选择支付方式 <span className="text-xs">(订阅支付仅支持银行卡)</span>
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={(e) => {
              e.preventDefault();
              handleCheckout(method.id);
            }}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              selected === method.id && loading
                ? "border-primary bg-primary/10 animate-pulse"
                : "border-border hover:border-primary hover:bg-primary/5"
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
      {loading && (
        <p className="text-sm text-center text-muted-foreground">
          跳转支付中...
        </p>
      )}
      {error && (
        <p className="text-sm text-center text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
