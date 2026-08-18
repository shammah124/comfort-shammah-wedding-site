import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MusicToggle from "./MusicToggle";

const launcherItems = [
  {
    key: "invitation",
    label: "Invitation",
    icon: "envelope",
    accent: "#5f6b32",
    href: "/?portal=invite",
    kind: "window",
    title: "Return to the invitation",
    description: "Return to the invitation in a new window.",
  },
  {
    key: "church",
    label: "Church Programme",
    icon: "book",
    accent: "#6b0020",
    href: "/programmes/church",
    kind: "pdf",
    title: "Church programme",
    description: "Open the church programme in a new window first, then download from inside.",
  },
  {
    key: "reception",
    label: "Reception Programme",
    icon: "calendar",
    accent: "#d8b66f",
    href: "/programmes/reception",
    kind: "pdf",
    title: "Reception programme",
    description: "Open the reception programme in a new window first, then download from inside.",
  },
  {
    key: "church-map",
    label: "Church Direction",
    icon: "church",
    accent: "#c59aa4",
    href: "https://maps.google.com/?q=ECWA%20Headquarters%20Church%2C%20Jos",
    kind: "window",
    title: "Directions to the church",
    description: "Open directions to the church venue in your maps app.",
  },
  {
    key: "reception-map",
    label: "Reception Direction",
    icon: "location",
    accent: "#5f6b32",
    href: "https://maps.google.com/?q=ECWA%20Headquarters%20International%20Conference%20Hall%2C%20Jos",
    kind: "window",
    title: "Directions to the reception hall",
    description: "Open directions to the reception venue in your maps app.",
  },
  {
    key: "gallery",
    label: "Wedding Gallery",
    kind: "window",
    icon: "images",
    accent: "#d8b66f",
    href: "/?portal=main&feature=gallery",
    title: "Wedding gallery",
    description: "A polished gallery for the wedding photos and video moments.",
    points: ["Photo viewing", "Video viewing", "Fullscreen support", "Download from inside"],
  },
  {
    key: "prewedding",
    label: "Pre-Wedding Gallery",
    kind: "window",
    icon: "heart",
    accent: "#6b0020",
    href: "/?portal=main&feature=prewedding",
    title: "Pre-wedding gallery",
    description: "A separate gallery space for pre-wedding memories and short clips.",
    points: ["Photo viewing", "Video viewing", "Fullscreen support", "Download from inside"],
  },
  {
    key: "live",
    label: "Live Updates",
    kind: "window",
    icon: "sparkles",
    accent: "#5f6b32",
    href: "/?portal=main&feature=live",
    title: "Live wedding updates",
    description: "A public feed for ceremony and reception updates when the admin side starts publishing notes.",
    points: ["Timeline-style updates", "Ceremony and reception notes", "Admin-managed posts", "No livestream required"],
  },
  {
    key: "gifts",
    label: "Support / Gifts",
    kind: "window",
    icon: "gift",
    accent: "#d8b66f",
    href: "/?portal=main&feature=gifts",
    title: "Support and gifts",
    description: "A place for support details, bank information, and gifting guidance once those details are finalized.",
    points: ["Support account details", "Bank transfer info", "Gift instructions", "Admin-editable content"],
  },
  {
    key: "contacts",
    label: "Planning Team",
    kind: "window",
    icon: "users",
    accent: "#c59aa4",
    href: "/?portal=main&feature=contacts",
    title: "Planning Team",
    description: "Admin-editable contacts for the people helping the day run smoothly.",
    points: ["Name and role", "Phone number", "Unlimited contacts"],
  },
  {
    key: "videos",
    label: "Video Gallery",
    kind: "window",
    icon: "film",
    accent: "#6b0020",
    href: "/?portal=main&feature=videos",
    title: "Video gallery",
    description: "Watch wedding clips and teaser videos in one clean view.",
    points: ["Clip previews", "Play in place", "Fullscreen support", "Download from inside"],
  },
];

const galleryAlbums = {
  wedding: [
    { src: "/gallery/wedding-1.svg", alt: "Wedding glow one", caption: "Golden evening light", downloadName: "wedding-1.svg" },
    { src: "/gallery/wedding-2.svg", alt: "Wedding glow two", caption: "Graceful portrait moment", downloadName: "wedding-2.svg" },
    { src: "/gallery/wedding-3.svg", alt: "Wedding glow three", caption: "Together in bloom", downloadName: "wedding-3.svg" },
    { src: "/gallery/wedding-4.svg", alt: "Wedding glow four", caption: "Soft ceremonial frame", downloadName: "wedding-4.svg" },
  ],
  prewedding: [
    { src: "/gallery/prewedding-1.svg", alt: "Pre-wedding one", caption: "Warm planning session", downloadName: "prewedding-1.svg" },
    { src: "/gallery/prewedding-2.svg", alt: "Pre-wedding two", caption: "Elegant monogram pose", downloadName: "prewedding-2.svg" },
    { src: "/gallery/prewedding-3.svg", alt: "Pre-wedding three", caption: "Promise and anticipation", downloadName: "prewedding-3.svg" },
    { src: "/gallery/prewedding-4.svg", alt: "Pre-wedding four", caption: "Editorial-style portrait", downloadName: "prewedding-4.svg" },
  ],
};

const MEDIA_PAGE_SIZE = 20;

function MediaLightbox({ media, type, onClose }) {
  if (!media) return null;

  const title = type === "video" ? media.title || "Wedding video" : media.alt || "Wedding memory";
  const downloadName = media.downloadName || media.title || title;

  return (
    <motion.div className="gallery-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="gallery-lightbox__panel" initial={{ opacity: 0, y: 22, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 22, scale: 0.98 }} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="gallery-lightbox__close" onClick={onClose} aria-label="Close viewer">×</button>
        {type === "video" ? (
          <video className="gallery-lightbox__media" controls autoPlay playsInline><source src={media.src} /></video>
        ) : (
          <img className="gallery-lightbox__media" src={media.src} alt={title} />
        )}
        <div className="gallery-lightbox__footer">
          <div><p>{type === "video" ? "Video moment" : "Photo moment"}</p><h2>{title}</h2></div>
          <button type="button" className="gallery-action gallery-action--solid" onClick={() => { if (!media.src) return; const query = new URLSearchParams({ src: media.src, filename: downloadName || "download" }); window.location.assign(`/downloads/media?${query.toString()}`); }}>Download</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GalleryPanel({ photos = [] }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [visibleCount, setVisibleCount] = useState(MEDIA_PAGE_SIZE);
  const visiblePhotos = photos.slice(0, visibleCount);

  return (
    <section className="media-gallery media-gallery--photos">
      {photos.length ? (
        <>
          <div className="photo-grid">
          {visiblePhotos.map((photo, index) => (
            <motion.article className="media-card photo-card" key={photo.src} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: index * 0.05 }}>
              <button type="button" className="media-card__visual" onClick={() => setSelectedPhoto(photo)} aria-label={`View ${photo.alt || "photo"}`}>
                <img src={photo.src} alt={photo.alt || "Wedding memory"} loading="lazy" />
                <span className="media-card__view-mark"><PortalIcon name="images" /></span>
              </button>
            </motion.article>
          ))}
          </div>
          {visibleCount < photos.length ? <div className="media-gallery__more"><button type="button" className="gallery-action" onClick={() => setVisibleCount((current) => current + MEDIA_PAGE_SIZE)}>View more</button></div> : null}
        </>
      ) : <div className="media-gallery__empty">Photos will appear here once they are added by the wedding team.</div>}
      <AnimatePresence>{selectedPhoto ? <MediaLightbox media={selectedPhoto} type="image" onClose={() => setSelectedPhoto(null)} /> : null}</AnimatePresence>
    </section>
  );
}

function VideoPanel({ clips = [] }) {
  const [selectedClip, setSelectedClip] = useState(null);
  const [visibleCount, setVisibleCount] = useState(MEDIA_PAGE_SIZE);
  const visibleClips = clips.filter((clip) => clip.src);
  const displayedClips = visibleClips.slice(0, visibleCount);

  return (
    <section className="media-gallery media-gallery--videos">
      {visibleClips.length ? (
        <>
          <div className="video-grid">
          {displayedClips.map((clip, index) => (
            <motion.article className="media-card video-card" key={clip.src} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.06 }}>
              <button type="button" className="media-card__visual" onClick={() => setSelectedClip(clip)} aria-label={`View ${clip.title || "video"}`}>
                <video preload="metadata" playsInline><source src={clip.src} /></video>
                <span className="video-card__play"><PortalIcon name="film" /></span>
              </button>
            </motion.article>
          ))}
          </div>
          {visibleCount < visibleClips.length ? <div className="media-gallery__more"><button type="button" className="gallery-action" onClick={() => setVisibleCount((current) => current + MEDIA_PAGE_SIZE)}>View more</button></div> : null}
        </>
      ) : <div className="media-gallery__empty">Wedding films will appear here once they are added by the wedding team.</div>}
      <AnimatePresence>{selectedClip ? <MediaLightbox media={selectedClip} type="video" onClose={() => setSelectedClip(null)} /> : null}</AnimatePresence>
    </section>
  );
}

function PortalIcon({ name }) {
  const iconProps = {
    viewBox: "0 0 24 24",
    width: 25,
    height: 25,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "envelope") {
    return <svg {...iconProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
  }

  if (name === "book") {
    return <svg {...iconProps}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16" /><path d="M8 7h8M8 11h6" /></svg>;
  }

  if (name === "calendar") {
    return <svg {...iconProps}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>;
  }

  if (name === "church") {
    return <svg {...iconProps}><path d="M3 21h18M5 21v-9l7-6 7 6v9M12 6V2M9 15h6M12 12v6" /></svg>;
  }

  if (name === "location") {
    return <svg {...iconProps}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  }

  if (name === "images") {
    return <svg {...iconProps}><rect x="3" y="5" width="15" height="14" rx="2" /><path d="m3 15 4-4 3 3 3-3 5 5M8 9h.01" /><path d="M18 8h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8" /></svg>;
  }

  if (name === "heart") {
    return <svg {...iconProps}><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.4a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
  }

  if (name === "sparkles") {
    return <svg {...iconProps}><path d="m12 3-1.3 5.7L5 10l5.7 1.3L12 17l1.3-5.7L19 10l-5.7-1.3zM19 15l-.6 2.4L16 18l2.4.6L19 21l.6-2.4L22 18l-2.4-.6zM5 3l-.6 2.4L2 6l2.4.6L5 9l.6-2.4L8 6l-2.4-.6z" /></svg>;
  }

  if (name === "gift") {
    return <svg {...iconProps}><path d="M4 10h16v11H4zM12 10v11M3 10h18V6H3zM12 6H8.5a2 2 0 1 1 2-2c0 2-1.5 2-2 2H12ZM12 6h3.5a2 2 0 1 0-2-2c0 2 1.5 2 2 2H12Z" /></svg>;
  }

  if (name === "users") {
    return <svg {...iconProps}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0-1.2-5.8M17 14a5 5 0 0 1 3.5 4.8" /></svg>;
  }

  return <svg {...iconProps}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 4v16M16 4v16M3 9h5M16 9h5M3 15h5M16 15h5" /><path d="m10 10 5 2-5 2z" /></svg>;
}

function ProgrammePrompt({ item, onClose }) {
  if (!item) return null;

  const [downloading, setDownloading] = useState(false);
  const programmeName = item.label.replace(" Programme", "");

  const handleDownload = async () => {
    if (!item.downloadHref || downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(item.downloadHref);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      window.open(item.downloadHref, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 80, display: "grid", placeItems: "center", padding: 18, background: "rgba(39,7,18,0.52)", backdropFilter: "blur(5px)" }}
    >
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="programme-prompt-title"
        style={{ width: "min(420px, 100%)", padding: 26, borderRadius: 22, background: "#fffdf9", border: "1px solid rgba(107,0,32,0.14)", boxShadow: "0 28px 72px rgba(45,7,18,0.30)", color: "#3d2b1f" }}
      >
        <div style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: "50%", background: "#f5ead9", color: "#6b0020" }}>
          <PortalIcon name="book" />
        </div>
        <p style={{ margin: "18px 0 0", color: "#7d5a26", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>Programme PDF</p>
        <h2 id="programme-prompt-title" style={{ margin: "7px 0 0", fontFamily: "var(--font-serif)", fontSize: "1.9rem", lineHeight: 1.05, color: "#5c1128" }}>{item.label}</h2>
        <p style={{ margin: "14px 0 0", lineHeight: 1.65, color: "#6f5a51" }}>
          Open the {programmeName.toLowerCase()} programme in a new tab, or download it directly to your device.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
          <button
            type="button"
            onClick={() => {
              window.open(item.href, "_blank", "noopener,noreferrer");
              onClose();
            }}
            style={{ padding: "11px 15px", border: "none", borderRadius: 11, background: "#6b0020", color: "#fffaf3", fontWeight: 700, cursor: "pointer" }}
          >
            Open PDF
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            style={{ padding: "11px 15px", border: "1px solid rgba(107,0,32,0.20)", borderRadius: 11, color: "#6b0020", fontWeight: 700, cursor: downloading ? "wait" : "pointer", background: "transparent", opacity: downloading ? 0.7 : 1 }}
          >
            {downloading ? "Downloading…" : "Download PDF"}
          </button>
          <button type="button" onClick={onClose} style={{ padding: "11px 8px", border: "none", background: "transparent", color: "#77635a", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
        </div>
      </motion.section>
    </motion.div>
  );
}

function LauncherTile({ item, index, onProgrammeOpen }) {
  return (
    <motion.div
      className="portal-tile-motion"
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2 + index * 0.055, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.018 }}
      whileTap={{ scale: 0.98 }}
    >
      {item.kind === "pdf" ? (
        <button className="portal-tile" type="button" onClick={() => onProgrammeOpen(item)} style={{ "--portal-tile-accent": item.accent || "#d8b66f" }}>
          <span className="portal-tile__ornament" aria-hidden="true" />
          <span className="portal-tile__icon" aria-hidden="true"><PortalIcon name={item.icon} /></span>
          <span className="portal-tile__label">{item.label}</span>
        </button>
      ) : (
        <a className="portal-tile" href={item.href} target="_blank" rel="noreferrer" style={{ "--portal-tile-accent": item.accent || "#d8b66f" }}>
          <span className="portal-tile__ornament" aria-hidden="true" />
          <span className="portal-tile__icon" aria-hidden="true"><PortalIcon name={item.icon} /></span>
          <span className="portal-tile__label">{item.label}</span>
        </a>
      )}
    </motion.div>
  );
}

function FeatureModal({ item, onClose, siteSettings = {}, liveUpdates, liveLoading, liveError, supportDetail, supportLoading, supportError, planningContacts, contactsLoading, contactsError }) {
  if (!item) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 backdrop-blur-sm md:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        background:
          "radial-gradient(circle at top, rgba(107,0,32,0.28), transparent 28%), radial-gradient(circle at bottom right, rgba(201,168,76,0.16), transparent 32%), rgba(11,7,5,0.72)",
      }}
    >
      <motion.div
        initial={{ y: 28, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 28, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
      style={{
          width: "min(720px, 100%)",
          borderRadius: 30,
          padding: 24,
          background:
            "linear-gradient(180deg, rgba(247,241,232,0.98), rgba(245,236,227,0.98))",
          border: "1px solid rgba(107,0,32,0.10)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.52)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
          <div>
            <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11, color: "#6b0020" }}>
              Feature preview
            </p>
            <h2 style={{ margin: "8px 0 0", fontFamily: "var(--font-serif)", fontSize: "clamp(1.7rem, 3vw, 2.8rem)", color: "#2a1e1b" }}>
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid rgba(107,0,32,0.12)",
              background: "rgba(255,255,255,0.6)",
              color: "#2a1e1b",
              width: 40,
              height: 40,
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Ã—
          </button>
        </div>

        <p style={{ margin: "16px 0 0", color: "#5b4a42", lineHeight: 1.8 }}>
          {item.description}
        </p>

          {item.key === "live" ? (
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            <div style={{
              padding: 16,
              borderRadius: 18,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(232,213,176,0.12)",
            }}>
              <strong style={{ color: "#fdf8f0" }}>Latest live feed</strong>
              <p style={{ margin: "8px 0 0", color: "rgba(245,240,232,0.7)", lineHeight: 1.6 }}>
                Ceremony and reception updates will appear here as the admin publishes them.
              </p>
            </div>

            {liveLoading ? (
              <div style={{ color: "#e8d5b0" }}>Loading live feed...</div>
            ) : liveError ? (
              <div style={{ color: "#f87171" }}>{liveError}</div>
            ) : liveUpdates.length === 0 ? (
              <div style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(232,213,176,0.18)",
                color: "rgba(245,240,232,0.72)",
              }}>
                No live updates yet. The feed will wake up once the admin posts the first note.
              </div>
            ) : (
              liveUpdates.map((update) => (
                <div key={update.id} style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(232,213,176,0.12)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <span style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#c9a84c",
                    }}>
                      {update.context}
                    </span>
                    <span style={{ fontSize: 12, color: "rgba(245,240,232,0.55)" }}>
                      {new Date(update.published_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: "10px 0 0", color: "#f5f0e8", lineHeight: 1.6, fontSize: 13 }}>
                    {update.message}
                  </p>
                  {update.author_name ? (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "rgba(245,240,232,0.6)" }}>
                      Posted by {update.author_name}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        ) : item.key === "gallery" || item.key === "prewedding" ? (
          <GalleryPanel photos={item.key === "prewedding" ? (siteSettings.prewedding_gallery_items || galleryAlbums.prewedding) : (siteSettings.wedding_gallery_items || galleryAlbums.wedding)} />
        ) : item.key === "videos" ? (
          <VideoPanel clips={siteSettings.video_gallery_items || []} />
        ) : item.key === "gifts" ? (
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {supportLoading ? (
              <div style={{ color: "#e8d5b0" }}>Loading support details...</div>
            ) : supportError ? (
              <div style={{ color: "#f87171" }}>{supportError}</div>
            ) : (
              <div style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(232,213,176,0.12)",
                display: "grid",
                gap: 10,
              }}>
                <p style={{ margin: 0, color: "#e8d5b0", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                  {supportDetail?.heading || "Support and Gifts"}
                </p>
                <p style={{ margin: 0, color: "#f5f0e8", lineHeight: 1.6, fontSize: 13 }}>
                  {supportDetail?.note || "Support and gift details will be shared here once finalized."}
                </p>
                <div style={{ display: "grid", gap: 8 }}>
                  {supportDetail?.bank_name ? <div><strong>Bank:</strong> {supportDetail.bank_name}</div> : null}
                  {supportDetail?.account_name ? <div><strong>Account name:</strong> {supportDetail.account_name}</div> : null}
                  {supportDetail?.account_number ? <div><strong>Account number:</strong> {supportDetail.account_number}</div> : null}
                  {supportDetail?.sort_code ? <div><strong>Sort code:</strong> {supportDetail.sort_code}</div> : null}
                </div>
              </div>
            )}
          </div>
        ) : item.key === "contacts" ? (
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {contactsLoading ? (
              <div style={{ color: "#e8d5b0" }}>Loading contacts...</div>
            ) : contactsError ? (
              <div style={{ color: "#f87171" }}>{contactsError}</div>
            ) : planningContacts.length === 0 ? (
              <div style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(232,213,176,0.18)",
                color: "rgba(245,240,232,0.72)",
              }}>
                No planning contacts yet.
              </div>
            ) : (
              planningContacts.map((contact) => (
                <div key={contact.id} style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(232,213,176,0.12)",
                  display: "grid",
                  gap: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <strong style={{ color: "#fdf8f0" }}>{contact.name}</strong>
                    <span style={{ fontSize: 12, color: "rgba(245,240,232,0.55)" }}>{contact.position}</span>
                  </div>
                  {contact.phone ? <div><strong>Phone:</strong> {contact.phone}</div> : null}
                </div>
              ))
            )}
          </div>
        ) : item.points ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 18 }}>
            {item.points.map((point) => (
              <div key={point} style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(232,213,176,0.12)",
                color: "#f5f0e8",
              }}>
                {point}
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
          {item.href ? (
            <a
              href={item.href}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #c9a84c, #a8872a)",
                color: "#1a1410",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Open feature
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              background: "transparent",
              color: "#e8d5b0",
              border: "1px solid rgba(232,213,176,0.18)",
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatUpdateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function LiveUpdatesFeed({ updates = [] }) {
  const sections = ["Church", "Reception", "General"]
    .map((context) => ({ context, updates: updates.filter((update) => update.context === context) }))
    .filter((section) => section.updates.length);

  if (!sections.length) {
    return <div className="live-feed__empty">The day’s updates will appear here as they are shared.</div>;
  }

  return (
    <div className="live-feed">
      {sections.map((section) => (
        <section className="live-feed__section" key={section.context} aria-label={`${section.context} updates`}>
          <div className="live-feed__section-heading">
            <span className="live-feed__section-dot" aria-hidden="true" />
            <h2>{section.context}</h2>
          </div>
          <div className="live-feed__timeline">
            {section.updates.map((update, index) => (
              <motion.article
                className="live-post"
                key={update.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
              >
                <div className="live-post__rail" aria-hidden="true"><span /></div>
                <div className="live-post__card">
                  <div className="live-post__meta">
                    <span className="live-post__source">{update.author_name || "Wedding team"}</span>
                    <time dateTime={update.published_at}>{formatUpdateTime(update.published_at)}</time>
                  </div>
                  <p>{update.message}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SupportDetails({ detail }) {
  const hasPrimaryAccount = detail?.bank_name || detail?.account_name || detail?.account_number || detail?.sort_code;
  const hasSecondaryAccount = detail?.secondary_bank_name || detail?.secondary_account_name || detail?.secondary_account_number || detail?.secondary_sort_code;
  const accounts = [
    {
      label: "Account 1",
      bankName: detail?.bank_name,
      accountName: detail?.account_name,
      accountNumber: detail?.account_number,
      sortCode: detail?.sort_code,
    },
    {
      label: "Account 2",
      bankName: detail?.secondary_bank_name,
      accountName: detail?.secondary_account_name,
      accountNumber: detail?.secondary_account_number,
      sortCode: detail?.secondary_sort_code,
    },
  ].filter((account, index) => (index === 0 ? hasPrimaryAccount : hasSecondaryAccount || hasPrimaryAccount));

  return (
    <section className="support-details">
      <p className="support-details__note">{detail?.note || "Support and gift details will be shared here once finalized."}</p>
      {accounts.map((account) => (
        <div className="support-details__card" key={account.label}>
          <p className="support-details__account-label">{account.label}</p>
          {account.bankName || account.accountName || account.accountNumber || account.sortCode ? (
            <dl>
              {account.bankName ? <><dt>Bank</dt><dd>{account.bankName}</dd></> : null}
              {account.accountName ? <><dt>Account name</dt><dd>{account.accountName}</dd></> : null}
              {account.accountNumber ? <><dt>Account number</dt><dd>{account.accountNumber}</dd></> : null}
              {account.sortCode ? <><dt>Sort code</dt><dd>{account.sortCode}</dd></> : null}
            </dl>
          ) : <p className="support-details__pending">Second account details will be shared here shortly.</p>}
        </div>
      ))}
    </section>
  );
}

function PlanningContacts({ contacts = [] }) {
  if (!contacts.length) {
    return <div className="planning-team__empty">The planning team will appear here once contacts are added.</div>;
  }

  return (
    <section className="planning-team" aria-label="Planning team contacts">
      {contacts.map((contact, index) => (
        <motion.article
          className="planning-team__card"
          key={contact.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: index * 0.05 }}
        >
          <div className="planning-team__monogram" aria-hidden="true">{contact.photo_url ? <img src={contact.photo_url} alt="" loading="lazy" /> : contact.name?.trim().charAt(0) || "C"}</div>
          <h2>{contact.name}</h2>
          <p>{contact.position}</p>
          {contact.phone ? <a className="planning-team__phone" href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a> : null}
        </motion.article>
      ))}
    </section>
  );
}

function StandaloneFeature({ feature, siteSettings = {}, liveUpdates, liveLoading, liveError, supportDetail, supportLoading, supportError, planningContacts, contactsLoading, contactsError }) {
  const usesGalleryPage = ["gallery", "prewedding", "videos", "live", "gifts", "contacts"].includes(feature.key);
  const panelStyle = {
    padding: 18,
    borderRadius: 20,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(232,213,176,0.16)",
  };
  const weddingImages = siteSettings.wedding_gallery_items?.length ? siteSettings.wedding_gallery_items : galleryAlbums.wedding;
  const preWeddingImages = siteSettings.prewedding_gallery_items?.length ? siteSettings.prewedding_gallery_items : galleryAlbums.prewedding;
  let content;

  if (feature.key === "gallery" || feature.key === "prewedding") {
    content = <GalleryPanel photos={feature.key === "prewedding" ? preWeddingImages : weddingImages} />;
  } else if (feature.key === "videos") {
    content = <VideoPanel clips={siteSettings.video_gallery_items || []} />;
  } else if (feature.key === "live") {
    content = liveLoading ? <p className="feature-status">Loading live updates...</p> : liveError ? <p className="feature-status">{liveError}</p> : <LiveUpdatesFeed updates={liveUpdates} />;
  } else if (feature.key === "gifts") {
    content = supportLoading ? <p className="feature-status">Loading support details...</p> : supportError ? <p className="feature-status">{supportError}</p> : <SupportDetails detail={supportDetail} />;
  } else if (feature.key === "contacts") {
    content = contactsLoading ? <p className="feature-status">Loading planning contacts...</p> : contactsError ? <p className="feature-status">{contactsError}</p> : <PlanningContacts contacts={planningContacts} />;
  } else {
    content = <div style={{ ...panelStyle, marginTop: 18 }}>{feature.description}</div>;
  }

  if (usesGalleryPage) {
    return (
      <main className={`gallery-page gallery-page--${feature.key}`}>
        <div className="gallery-page__texture" aria-hidden="true" />
        <div className="gallery-page__glow gallery-page__glow--left" aria-hidden="true" />
        <div className="gallery-page__glow gallery-page__glow--right" aria-hidden="true" />
        <div className="gallery-page__container">
          <motion.header className="gallery-page__hero" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="gallery-page__eyebrow">Comfort &amp; Shammah · 2026</p>
            <h1>{feature.title}</h1>
          </motion.header>
          {content}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(216,182,111,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(107,0,32,0.28), transparent 32%), linear-gradient(155deg, #4c5730 0%, #303b22 54%, #291918 100%)", color: "#f7f2e9", padding: "28px 16px 48px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", flexWrap: "wrap", paddingBottom: 20, borderBottom: "1px solid rgba(232,213,176,0.18)" }}>
          <div><div style={{ color: "#e8d5b0", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>Comfort &amp; Shammah</div><h1 style={{ margin: "8px 0 0", fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "#fffaf2" }}>{feature.title}</h1></div>
          <a href="/?portal=main" style={{ padding: "11px 15px", borderRadius: 999, border: "1px solid rgba(232,213,176,0.3)", color: "#fffaf2", textDecoration: "none", fontWeight: 700 }}>Back to launcher</a>
        </header>
        <p style={{ margin: "20px 0 0", maxWidth: 700, color: "rgba(247,242,233,0.8)", lineHeight: 1.75 }}>{feature.description}</p>{content}
      </div>
    </main>
  );
}

export default function MainPortal({ siteSettings = {}, guestName }) {
  const [resolvedSiteSettings, setResolvedSiteSettings] = useState(siteSettings);
  const portalState = resolvedSiteSettings?.portal_state || siteSettings?.portal_state || "invitation";
  const switchAt = resolvedSiteSettings?.switch_at
    ? new Date(resolvedSiteSettings.switch_at).toLocaleString()
    : siteSettings?.switch_at
      ? new Date(siteSettings.switch_at).toLocaleString()
      : "Not set";
  const featureParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("feature") : null;
  const feature = launcherItems.find((item) => item.key === featureParam) || null;
  const [selectedItem, setSelectedItem] = useState(() => launcherItems.find((item) => item.key === featureParam) || null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [supportDetail, setSupportDetail] = useState(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [planningContacts, setPlanningContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState("");

  useEffect(() => {
    setResolvedSiteSettings(siteSettings);
    fetch("/api/site_settings")
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (data?.site_settings) {
          setResolvedSiteSettings(data.site_settings);
        }
      })
      .catch(() => {});
  }, [siteSettings]);

  useEffect(() => {
    fetch("/api/live_updates")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.live_updates) {
          setLiveUpdates(data.live_updates || []);
        }
      })
      .catch(() => {});

    fetch("/api/support_detail")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.support_detail) {
          setSupportDetail(data.support_detail);
        }
      })
      .catch(() => {});

    fetch("/api/planning_contacts")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.planning_contacts) {
          setPlanningContacts(data.planning_contacts || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedItem?.key !== "live") return;

    setLiveLoading(true);
    setLiveError("");
    fetch("/api/live_updates")
      .then((response) => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setLiveUpdates(data.live_updates || []);
        setLiveLoading(false);
      })
      .catch((error) => {
        setLiveError(error.message);
        setLiveLoading(false);
      });
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem?.key !== "gifts") return;

    setSupportLoading(true);
    setSupportError("");
    fetch("/api/support_detail")
      .then((response) => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setSupportDetail(data.support_detail || null);
        setSupportLoading(false);
      })
      .catch((error) => {
        setSupportError(error.message);
        setSupportLoading(false);
      });
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem?.key !== "contacts") return;

    setContactsLoading(true);
    setContactsError("");
    fetch("/api/planning_contacts")
      .then((response) => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setPlanningContacts(data.planning_contacts || []);
        setContactsLoading(false);
      })
      .catch((error) => {
        setContactsError(error.message);
        setContactsLoading(false);
      });
  }, [selectedItem]);

  if (feature) {
    return (
      <StandaloneFeature
        feature={feature}
        onClose={() => window.close()}
        siteSettings={resolvedSiteSettings}
        liveUpdates={liveUpdates}
        liveLoading={liveLoading}
        liveError={liveError}
        supportDetail={supportDetail}
        supportLoading={supportLoading}
        supportError={supportError}
        planningContacts={planningContacts}
        contactsLoading={contactsLoading}
        contactsError={contactsError}
      />
    );
  }

  return (
    <main className="portal-shell">
      <div className="portal-shell__texture" aria-hidden="true" />
      <div className="portal-shell__glow portal-shell__glow--gold" aria-hidden="true" />
      <div className="portal-shell__glow portal-shell__glow--pink" aria-hidden="true" />
      <MusicToggle />
      <AnimatePresence>
        {selectedProgramme ? <ProgrammePrompt item={selectedProgramme} onClose={() => setSelectedProgramme(null)} /> : null}
      </AnimatePresence>
      <div className="portal-container">
        <motion.section
          className="portal-hero"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="portal-hero__frame" aria-hidden="true" />
          <motion.div
            className="portal-hero__crest"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={resolvedSiteSettings?.logo_url || "/icon.png"} alt="Comfort and Shammah wedding logo" />
          </motion.div>
          <p className="portal-hero__eyebrow">Welcome To CoSh2026</p>
          <h1>Comfort <span>&amp;</span> Shammah</h1>
          <div className="portal-hero__line" aria-hidden="true"><span /></div>
          <p className="portal-hero__message">
            {guestName ? `Welcome, ${guestName}. ` : ""}
            Explore the wedding details, downloads, gallery, and updates from one elegant place.
          </p>
        </motion.section>

        <motion.section
          className="portal-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.22 }}
        >
          <div className="portal-features__heading">
            <span aria-hidden="true" />
            <p>Explore the celebration</p>
            <span aria-hidden="true" />
          </div>
          <div className="portal-grid">
            {launcherItems.map((item, index) => {
              const launcherHref = item.key === "church"
                ? item.href
                : item.key === "reception"
                  ? item.href
                  : item.key === "church-map"
                    ? resolvedSiteSettings.church_direction_url || item.href
                    : item.key === "reception-map"
                      ? resolvedSiteSettings.reception_direction_url || item.href
                      : item.href;
              const programmeDownloadHref = item.key === "church"
                ? "/downloads/church-programme"
                : item.key === "reception"
                  ? "/downloads/reception-programme"
                  : undefined;

              return (
              <LauncherTile
                key={item.key}
                item={{ ...item, href: launcherHref, downloadHref: programmeDownloadHref }}
                index={index}
                onProgrammeOpen={setSelectedProgramme}
              />
              );
            })}
          </div>
        </motion.section>
      </div>
    </main>
  );
}


