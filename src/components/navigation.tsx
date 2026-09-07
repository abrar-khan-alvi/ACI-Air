"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

type SearchValues = Record<string, string | number | boolean | null | undefined>;

export function hrefWithSearch(to: string, search?: SearchValues): string {
  if (!search) return to;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  const encoded = query.toString();
  return encoded ? `${to}?${encoded}` : to;
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  to: string;
  search?: SearchValues;
  children: ReactNode;
};

export function Link({ to, search, children, ...props }: LinkProps) {
  return (
    <NextLink href={hrefWithSearch(to, search)} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return ({ to, search }: { to: string; search?: SearchValues }) => {
    router.push(hrefWithSearch(to, search));
    return Promise.resolve();
  };
}
