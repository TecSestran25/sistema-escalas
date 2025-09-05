// src/app/(dashboard)/layout.tsx
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-muted/40">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}