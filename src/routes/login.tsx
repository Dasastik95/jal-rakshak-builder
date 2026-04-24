import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — Purulia Properties Admin" }],
  }),
  component: LoginLayout,
});

function LoginLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
