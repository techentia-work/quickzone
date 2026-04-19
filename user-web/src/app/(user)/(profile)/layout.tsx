import React from "react";
import ProfileSidebar from "./_components/ProfileSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <ProfileSidebar />

      {/* Main content */}
      <main className="flex-1 lg:ml-72 p-8">{children}</main>
    </div>
  );
}
