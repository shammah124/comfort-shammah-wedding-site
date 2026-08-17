import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";

const InvitationApp = lazy(() => import("./components/App"));
const WeddingAdmin = lazy(() => import("./components/WeddingAdmin"));
const MainPortal = lazy(() => import("./components/MainPortal"));

function LoadingScreen() {
  return <main className="app-loading" aria-live="polite">Loading your wedding experience...</main>;
}

const container = document.getElementById("root");
if (container) {
  const isAdmin = window.location.pathname === "/admin";
  const siteSettings = window.__WEDDING_SITE__ || {};
  const query = new URLSearchParams(window.location.search);
  const portalOverride = query.get("portal");
  const savedPortalState = siteSettings.portal_state || "invitation";
  const shouldShowMainPortal = !isAdmin && (
    portalOverride === "main" ||
    (portalOverride !== "invite" && savedPortalState === "main")
  );

  const experience = isAdmin ? (
    <WeddingAdmin siteSettings={siteSettings} />
  ) : shouldShowMainPortal ? (
    <MainPortal siteSettings={siteSettings} guestName={query.get("guest") || ""} />
  ) : (
    <InvitationApp />
  );

  createRoot(container).render(<Suspense fallback={<LoadingScreen />}>{experience}</Suspense>);
}
