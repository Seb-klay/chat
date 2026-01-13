'use client';

import { usePathname } from "next/navigation";
import AppSidebar from "./components/side-bar/appSidebar"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Determine if the current path requires no sidebar
    const isSignup = pathname === "/signup";
    const isLogin = pathname === "/login";

    if (isSignup || isLogin) {
        return (
            <main className="w-full">
                <div className="p-5">{children}</div>
            </main>
        );
    }

    // Render with the sidebar for all other pages
    return (
        <div className="flex h-screen bg-gray-950">
        <AppSidebar />
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
            {children}
        </main>
        </div>
    );
}