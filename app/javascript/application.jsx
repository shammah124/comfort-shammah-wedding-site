import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import MainPortal from "./components/MainPortal";

const InvitationApp = lazy(() => import("./components/App"));
const WeddingAdmin = lazy(() => import("./components/WeddingAdmin"));

function LoadingScreen() {
  const weddingLogo = window.__WEDDING_SITE__?.logo_url || "/assets/My%20Wedding%20Logo.png";

  return (
    <main className="app-loading" aria-live="polite" aria-label="Loading">
      <div className="app-loading__bg" aria-hidden="true" />
      <div className="app-loading__glow app-loading__glow--gold" aria-hidden="true" />
      <div className="app-loading__glow app-loading__glow--pink" aria-hidden="true" />
      <div className="app-loading__frame" aria-hidden="true" />
      <div className="app-loading__content">
        <p className="app-loading__eyebrow">Welcome to CoSh2026</p>
        <div className="app-loading__crest">
          <img src={weddingLogo} alt="Comfort and Shammah wedding logo" />
        </div>
        <h1 className="app-loading__title">Comfort <span>&amp;</span> Shammah</h1>
        <p className="app-loading__subtitle">Our wedding experience</p>
        <div className="app-loading__event" aria-hidden="true"><span>October 17, 2026</span><i /><span>Jos, Plateau</span></div>
        <div className="app-loading__divider" aria-hidden="true"><span /></div>
        <div className="app-loading__progress" aria-hidden="true"><span /></div>
        <p className="app-loading__message">Preparing something beautiful for you…</p>
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
