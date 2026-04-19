"use client";

import { useAuth } from "@/hooks";
import { useAdminSocket } from "@/hooks/notification/useSocket";
import { AdminLayout } from "@/components";

export default function AdminInnerLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  useAdminSocket(isAdmin()); // safe now

  return <AdminLayout>{children}</AdminLayout>;
}
