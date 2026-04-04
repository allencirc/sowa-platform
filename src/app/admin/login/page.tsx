import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Login — SOWA",
};

export default function AdminLoginPage() {
  // Redirect to NextAuth's built-in sign-in page which handles CSRF properly
  redirect("/api/auth/signin?callbackUrl=/admin");
}
