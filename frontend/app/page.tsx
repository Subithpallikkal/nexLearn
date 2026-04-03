"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirectHome } from "@/lib/examGuards";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    redirectHome(router);
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050508] text-sm text-slate-400">
      Loading…
    </div>
  );
}
