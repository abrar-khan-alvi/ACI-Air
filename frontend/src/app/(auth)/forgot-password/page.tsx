import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[560px]">
      <div className="bg-card shadow-[0_16px_40px_rgb(0_59_36_/_12%)] rounded-2xl p-8 md:p-12">
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">Reset Password</h1>
        <p className="text-muted-foreground text-center mb-8">Enter your email address and we'll send you a link to reset your password.</p>
        
        <form className="flex flex-col gap-4">
          <Input 
            type="email" 
            placeholder="Enter your email" 
            required 
            className="h-12 bg-muted/50"
          />
          <Button type="submit" className="h-12 bg-aci-green-500 hover:bg-aci-green-700 text-white rounded-md font-medium transition-colors">
            Send Reset Link
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/sign-in" className="text-aci-green-700 hover:text-aci-green-900 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
