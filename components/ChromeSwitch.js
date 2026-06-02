"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";

export default function ChromeSwitch({ children }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");

  if (isPortal) return children;

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  );
}
