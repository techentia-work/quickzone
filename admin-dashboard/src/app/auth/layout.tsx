import { StoreProvider, Loader, Toaster } from '@/components';
import React, { Suspense } from 'react'

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<Loader />}>
      <StoreProvider>
        <Toaster />
        {children}
      </StoreProvider>
    </Suspense>
  );
}
