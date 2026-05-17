"use client";

import Sidebar from "@/components/Sidebar";

import TopHeader from "@/components/TopHeader";

export default function AppLayout({
  children,
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}