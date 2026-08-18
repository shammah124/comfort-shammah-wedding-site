import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";

const InvitationApp = lazy(() => import("./components/App"));
const WeddingAdmin = lazy(() => import("./components/WeddingAdmin"));
const MainPortal = lazy(() => import("./components/MainPortal"));

function LoadingScreen() {
  return (
    <main className="app-loading" aria-live="polite" aria-label="Loading">
      <div className="app-loading__bg" aria-hidden="true" />
      <div className="app-loading__glow app-loading__glow--gold" aria-hidden="true" />
      <div className="app-loading__glow app-loading__glow--pink" aria-hidden="true" />
      <div className="app-loading__particles" aria-hidden="true">
        <span className="app-loading__particle app-loading__particle--1" />
        <span className="app-loading__particle app-loading__particle--2" />
        <span className="app-loading__particle app-loading__particle--3" />
        <span className="app-loading__particle app-loading__particle--4" />
        <span className="app-loading__particle app-loading__particle--5" />
        <span className="app-loading__particle app-loading__particle--6" />
      </div>
      <div className="app-loading__frame" aria-hidden="true" />
      <div className="app-loading__content">
        <div className="app-loading__crest">
          <img src="/icon.png" alt="Comfort and Shammah wedding logo" />
        </div>
        <p className="app-loading__eyebrow">Comfort &amp; Shammah</p>
        <div className="app-loading__divider" aria-hidden="true"><span /></div>
        <div className="app-loading__spinner" aria-hidden="true">
          <span /><span /><span />
        </div>
        <p className="app-loading__message">Preparing your celebration…</p>
      </div>
    </main>
  );
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
