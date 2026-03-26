"use client";

import { useState } from "react";
import Image from "next/image";

const amounts = [50, 100, 200, 500, 1000, 2000, 5000];

type PaymentMethod = "alipay" | "wechat_pay";

export function RechargeForm() {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("wechat_pay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecharge = async () => {
    const amount =
      selectedAmount === -1 ? parseFloat(customAmount) : selectedAmount;

    if (!amount || amount <= 0) {
      setError("请输入有效的充值金额");
      return;
    }

    if (amount < 10) {
      setError("最低充值金额为 ¥10");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "充值失败");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("未收到支付链接");
      }
    } catch (error) {
      console.error("Recharge error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "充值初始化失败，请稍后重试";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Amount Selection */}
      <div>
        <p className="text-sm font-medium mb-3">支付金额:</p>
        <div className="grid grid-cols-4 gap-3">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedAmount === amount
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {amount}元
            </button>
          ))}
          <button
            onClick={() => setSelectedAmount(-1)}
            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              selectedAmount === -1
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            自定义
          </button>
        </div>
        {selectedAmount === -1 && (
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="请输入金额 (最低 ¥10)"
            className="mt-3 w-full px-4 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none"
            min="10"
          />
        )}
      </div>

      {/* Payment Method Selection */}
      <div>
        <p className="text-sm font-medium mb-3">支付方式:</p>
        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMethod("wechat_pay")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
              paymentMethod === "wechat_pay"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Image
              src="/icons/wechat-pay.svg"
              alt="微信"
              width={24}
              height={24}
            />
            <span className="text-sm font-medium">微信</span>
          </button>
          <button
            onClick={() => setPaymentMethod("alipay")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
              paymentMethod === "alipay"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Image
              src="/icons/alipay.svg"
              alt="支付宝"
              width={24}
              height={24}
            />
            <span className="text-sm font-medium">支付宝</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleRecharge}
        disabled={loading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "跳转支付中..." : "确认支付"}
      </button>
    </div>
  );
}
