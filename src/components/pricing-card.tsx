import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PaymentMethodSelector } from "@/components/payment-method-selector";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId?: string;
  popular?: boolean;
  isFree?: boolean;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  priceId,
  popular,
  isFree,
}: PricingCardProps) {
  return (
    <Card
      className={`relative flex flex-col overflow-visible ${
        popular ? "border-primary shadow-lg scale-105" : ""
      }`}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 overflow-visible h-auto">
          最受欢迎
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {!isFree && <span className="text-muted-foreground">/月</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isFree ? (
          <p className="text-sm text-muted-foreground w-full text-center">
            免费使用
          </p>
        ) : priceId ? (
          <PaymentMethodSelector priceId={priceId} />
        ) : null}
      </CardFooter>
    </Card>
  );
}
