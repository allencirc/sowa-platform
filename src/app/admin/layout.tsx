import { AdminProviders } from "./providers";

export const metadata = {
  title: {
    template: "%s — SOWA Admin",
    default: "SOWA Admin",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
