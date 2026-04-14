import type { ReactNode } from "react";
import { Header } from "@/components/header/header.component";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </>
  );
}
