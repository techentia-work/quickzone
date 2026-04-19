"use client";

import React, { Suspense, useState } from "react";
import { StoreProvider, AdminLayout, Loader, NewOrderPopup } from "@/components";
import { useAuth } from "@/hooks";
import { useAdminSocket } from "@/hooks/notification/useSocket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loader />}>
        <StoreProvider>
          <AdminInnerLayout>{children}</AdminInnerLayout>
        </StoreProvider>
      </Suspense>
    </QueryClientProvider>
  );
}

function AdminInnerLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();

  // ✅ Always call the hook
  useAdminSocket(isAdmin());

  return (
    <>
      <NewOrderPopup />
      <AdminLayout>{children}</AdminLayout>
    </>
  );
}