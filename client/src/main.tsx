import { trpc } from "@/lib/trpc";
import { COOKIE_NAME } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

let forceLogoutInProgress = false;

function getPreviewAuthHeaders(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem("manus-cookie");
    if (raw) {
      const prefix = `${COOKIE_NAME}=`;
      const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
      const token = pair?.trim().slice(prefix.length);
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // sessionStorage unavailable
  }
  return {};
}

function isAuthzError(error: unknown) {
  const data = (error as any)?.data;
  return (
    data?.code === "FORBIDDEN" ||
    data?.code === "UNAUTHORIZED" ||
    data?.httpStatus === 401 ||
    data?.httpStatus === 403
  );
}

function forceLogout() {
  if (forceLogoutInProgress) return;
  forceLogoutInProgress = true;

  void fetch("/api/trpc/auth.logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...getPreviewAuthHeaders(),
    },
    body: JSON.stringify({ json: null }),
  }).finally(() => {
    try {
      sessionStorage.removeItem("manus-cookie");
    } catch {
      // sessionStorage unavailable
    }
    localStorage.removeItem("manus-runtime-user-info");
    window.location.replace("/login");
  });
}

function handleQueryError(error: unknown) {
  if (isAuthzError(error)) forceLogout();
}

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    console.error("[API Query Error]", error);
    handleQueryError(error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    console.error("[API Mutation Error]", error);
    handleQueryError(error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        return getPreviewAuthHeaders();
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
