'use client';

import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/lib/store";
import { GlobalModalProvider } from "@/components";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


export default function Providers({ children }: { children: React.ReactNode }) {

    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 min
                gcTime: 30 * 60 * 1000,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                retry: 1
            }
        }
    }));

    return (
        <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>
                {/* <ReactQueryDevtools initialIsOpen={true} /> */}
                <GlobalModalProvider>
                    {children}
                </GlobalModalProvider>
            </QueryClientProvider>
        </ReduxProvider>
    );
}
