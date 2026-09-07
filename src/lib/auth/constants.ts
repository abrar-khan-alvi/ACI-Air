import "server-only";

export const DEMO_EMAIL = "test@mail.com";
export const DEMO_PASSWORD = "123456";
export const AUTH_COOKIE = "aci_demo_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function demoCredentials() {
  return {
    email: process.env["DEMO_AUTH_EMAIL"]?.trim().toLowerCase() || DEMO_EMAIL,
    password: process.env["DEMO_AUTH_PASSWORD"] || DEMO_PASSWORD,
  };
}

export function authSecret() {
  return process.env["AUTH_SECRET"] || "aci-avionics-local-demo-secret";
}
