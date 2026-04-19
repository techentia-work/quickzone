"use client";
import { ROUTES } from "@/lib/consts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  const router = useRouter();

  useEffect(() => {
    if (!window) return;

    if (localStorage.getItem("current_user"))
      router.push(ROUTES.ADMIN.ROOT);
    else
      router.push(ROUTES.AUTH.LOGIN);
  }, []);

  return (
    <>
    </>
  );
}
