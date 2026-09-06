import * as React from "react"

interface AuthShellProps {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Optional decorative background pattern could go here */}
      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <img
            src="/logo.jpg"
            alt="ACI Air Logo"
            className="h-12 w-auto object-contain mix-blend-multiply"
          />
        </div>
        {children}
      </div>
    </div>
  )
}
