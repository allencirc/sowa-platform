import type { Metadata } from "next";
import { AdminProviders } from "./providers";
import { getSiteSettings } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      template: `%s — ${settings.siteName} Admin`,
      default: `${settings.siteName} Admin`,
    },
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
