"use client";

import { useEffect } from "react";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { redirectHome } from "@/lib/examGuards";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    redirectHome(router);
  }, [router]);

  return (
    <Spin spinning fullscreen size="large"  />
  );
}
