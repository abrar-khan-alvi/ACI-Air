export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="auth-layout min-h-screen w-full bg-white">{children}</main>
  );
}
