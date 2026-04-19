// app/(user)/layout.tsx

import React, { Suspense } from "react";
import { UserLayout, Loader } from "@/components";
import { ActiveOrdersBookmark } from "./(home)/_components/activeOrders/ActiveOrders";
import { WebsiteSettingsInitializer } from "@/components/providers/websiteSettings/websiteSettings.provider";

export default function UserRootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loader />}>
      <UserLayout>
        <WebsiteSettingsInitializer />
        <ActiveOrdersBookmark />
        {children}
      </UserLayout>
    </Suspense>
  );
}
