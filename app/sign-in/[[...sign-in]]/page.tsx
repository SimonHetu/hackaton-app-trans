import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <SignIn fallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard" />
    </div>
  );
}
