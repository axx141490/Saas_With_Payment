"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MobileNavProps {
  isSignedIn: boolean;
}

export function MobileNav({ isSignedIn }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden">
        <Button variant="ghost" size="icon" render={<span />}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <nav className="flex flex-col space-y-4 mt-8">
          <Link href="/" className="text-sm font-medium">
            首页
          </Link>
          <Link href="/pricing" className="text-sm font-medium">
            定价
          </Link>
          {isSignedIn && (
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
          )}
          {isSignedIn ? (
            <div className="pt-4">
              <UserButton />
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-4">
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "ghost" })}
              >
                登录
              </Link>
              <Link href="/sign-up" className={buttonVariants()}>
                注册
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
