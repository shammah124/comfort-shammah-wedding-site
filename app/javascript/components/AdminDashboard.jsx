import React, { useState, useEffect, useCallback, useRef } from "react";

const ADMIN_PASSWORD = "Cosh@2026";
// Old Password: A&C2025Admin

function StatCard({ label, value, color, icon }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: "24px 28px",
        flex: "1 1 180px",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "#a89880",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Badge({ attendance }) {
  const isYes = attendance === "yes";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        background: isYes ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
        color: isYes ? "#4ade80" : "#f87171",
        border: `1px solid ${isYes ? "#4ade8040" : "#f8717140"}`,
      }}
    >
      {isYes ? "Attending" : "Not Attending"}
    </span>
  );
}

function exportCSV(rsvps) {
  const headers = [
    "#",
    "Name",
    "Email",
    "Attendance",
    "Guests",
    "Message",
    "Submitted",
  ];
  const rows = rsvps.map((r, i) => [
    i + 1,
    `"${(r.name || "").replace(/"/g, '""')}"`,
    `"${(r.email || "").replace(/"/g, '""')}"`,
    r.attendance === "yes" ? "Attending" : "Not Attending",
    r.guest_count || 0,
    `"${(r.message || "").replace(/"/g, '""')}"`,
    new Date(r.created_at).toLocaleString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wedding-rsvps.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({
  siteSettings: initialSiteSettings = {},
}) {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    attending: 0,
    not_attending: 0,
    total_guests: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [siteSettings, setSiteSettings] = useState({
    portal_mode: initialSiteSettings.portal_mode || "auto",
    switch_at: initialSiteSettings.switch_at || "",
    portal_state: initialSiteSettings.portal_state || "invitation",
  });
  const [settingsForm, setSettingsForm] = useState({
    portal_mode: initialSiteSettings.portal_mode || "auto",
    switch_at: initialSiteSettings.switch_at
      ? initialSiteSettings.switch_at.slice(0, 16)
      : "",
    church_programme_url: initialSiteSettings.church_programme_url || "",
    reception_programme_url: initialSiteSettings.reception_programme_url || "",
    church_direction_url: initialSiteSettings.church_direction_url || "",
    reception_direction_url: initialSiteSettings.reception_direction_url || "",
    wedding_gallery_items_json: JSON.stringify(
      initialSiteSettings.wedding_gallery_items || [],
      null,
      2,
    ),
    prewedding_gallery_items_json: JSON.stringify(
      initialSiteSettings.prewedding_gallery_items || [],
      null,
      2,
    ),
    video_gallery_items_json: JSON.stringify(
      initialSiteSettings.video_gallery_items || [],
      null,
      2,
    ),
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsUploading, setSettingsUploading] = useState("");
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [liveForm, setLiveForm] = useState({
    context: "General",
    message: "",
    author_name: "",
  });
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveSaving, setLiveSaving] = useState(false);
  const [liveError, setLiveError] = useState("");
  const [liveSaved, setLiveSaved] = useState(false);
  const [liveDeletingId, setLiveDeletingId] = useState(null);
  const [supportDetail, setSupportDetail] = useState({
    heading: "Support and Gifts",
    bank_name: "",
    account_name: "",
    account_number: "",
    sort_code: "",
    note: "",
  });
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSaving, setSupportSaving] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [supportSaved, setSupportSaved] = useState(false);
  const [planningContacts, setPlanningContacts] = useState([]);
  const [contactForm, setContactForm] = useState({
    name: "",
    position: "",
    phone: "",
    display_order: 0,
  });
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsSaving, setContactsSaving] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [contactsSaved, setContactsSaved] = useState(false);
  const [galleryDeletingKey, setGalleryDeletingKey] = useState("");
  const [programmeDeleting, setProgrammeDeleting] = useState("");
  const weddingGalleryInputRef = useRef(null);
  const preweddingGalleryInputRef = useRef(null);
  const videoGalleryInputRef = useRef(null);
  const churchProgrammeInputRef = useRef(null);
  const receptionProgrammeInputRef = useRef(null);

  const fetchRsvps = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/rsvps")
      .then((r) => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setRsvps(data.rsvps || []);
        setStats(data.stats || {});
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fetchSiteSettings = useCallback(() => {
    setSettingsLoading(true);
    setSettingsError("");
    fetch("/api/site_settings")
      .then((response) => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const nextSettings = data.site_settings || {};
        setSiteSettings(nextSettings);
        setSettingsForm({
          portal_mode: nextSettings.portal_mode || "auto",
          switch_at: nextSettings.switch_at
            ? nextSettings.switch_at.slice(0, 16)
            : "",
          church_programme_url: nextSettings.church_programme_url || "",
          reception_programme_url: nextSettings.reception_programme_url || "",
          church_direction_url: nextSettings.church_direction_url || "",
          reception_direction_url: nextSettings.reception_direction_url || "",
          wedding_gallery_items_json: JSON.stringify(
            nextSettings.wedding_gallery_items || [],
            null,
            2,
          ),
          prewedding_gallery_items_json: JSON.stringify(
            nextSettings.prewedding_gallery_items || [],
            null,
            2,
          ),
          video_gallery_items_json: JSON.stringify(
            nextSettings.video_gallery_items || [],
            null,
            2,
          ),
        });
        setSettingsLoading(false);
      })
      .catch((err) => {
        setSettingsError(err.message);
        setSettingsLoading(false);
      });
  }, []);

  const fetchLiveUpdates = useCallback(() => {
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
      .catch((err) => {
        setLiveError(err.message);
        setLiveLoading(false);
      });
  }, []);

  const fetchSupportDetail = useCallback(() => {
    setSupportLoading(true);
    setSupportError("");
    fetch("/api/support_detail")
      .then((response) => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const nextSupport = data.support_detail || {};
        setSupportDetail({
          heading: nextSupport.heading || "Support and Gifts",
          bank_name: nextSupport.bank_name || "",
          account_name: nextSupport.account_name || "",
          account_number: nextSupport.account_number || "",
          sort_code: nextSupport.sort_code || "",
          note: nextSupport.note || "",
        });
        setSupportLoading(false);
      })
      .catch((err) => {
        setSupportError(err.message);
        setSupportLoading(false);
      });
  }, []);

  const fetchPlanningContacts = useCallback(() => {
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
      .catch((err) => {
        setContactsError(err.message);
        setContactsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (authed) {
      fetchRsvps();
      fetchSiteSettings();
      fetchLiveUpdates();
      fetchSupportDetail();
      fetchPlanningContacts();
    }
  }, [
    authed,
    fetchRsvps,
    fetchSiteSettings,
    fetchLiveUpdates,
    fetchSupportDetail,
    fetchPlanningContacts,
  ]);

  function handleLogin(e) {
    e.preventDefault();
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput }),
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.errors?.join(", ") || "Login failed.");
        setAuthed(true);
        setPasswordError(false);
      })
      .catch(() => {
        setPasswordError(true);
        setPasswordInput("");
      });
  }

  function handleSettingChange(event) {
    const { name, value } = event.target;
    setSettingsForm((current) => ({ ...current, [name]: value }));
  }

  function handleMediaUpload(kind, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSettingsUploading(kind);
    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);

    fetch("/api/site_settings/media_upload", {
      method: "POST",
      body: formData,
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (!ok || !data.success) {
          throw new Error(data.errors?.join(", ") || "Upload failed.");
        }
        const nextSettings = data.site_settings || {};
        setSiteSettings(nextSettings);
        setSettingsForm((current) => ({
          ...current,
          wedding_gallery_items_json: JSON.stringify(
            nextSettings.wedding_gallery_items || [],
            null,
            2,
          ),
          prewedding_gallery_items_json: JSON.stringify(
            nextSettings.prewedding_gallery_items || [],
            null,
            2,
          ),
          video_gallery_items_json: JSON.stringify(
            nextSettings.video_gallery_items || [],
            null,
            2,
          ),
        }));
        setSettingsError("");
      })
      .catch((err) => {
        setSettingsError(err.message);
      })
      .finally(() => {
        setSettingsUploading("");
      });
    event.target.value = "";
  }

  function handleMediaDelete(kind, src) {
    setGalleryDeletingKey(`${kind}:${src}`);
    fetch("/api/site_settings/media_upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, src }),
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (!ok || !data.success) {
          throw new Error(data.errors?.join(", ") || "Delete failed.");
        }
        const nextSettings = data.site_settings || {};
        setSiteSettings(nextSettings);
        setSettingsForm((current) => ({
          ...current,
          wedding_gallery_items_json: JSON.stringify(
            nextSettings.wedding_gallery_items || [],
            null,
            2,
          ),
          prewedding_gallery_items_json: JSON.stringify(
            nextSettings.prewedding_gallery_items || [],
            null,
            2,
          ),
          video_gallery_items_json: JSON.stringify(
            nextSettings.video_gallery_items || [],
            null,
            2,
          ),
        }));
        setSettingsError("");
      })
      .catch((err) => {
        setSettingsError(err.message);
      })
      .finally(() => {
        setGalleryDeletingKey("");
      });
  }

  function handleProgrammeUpload(programme, event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSettingsUploading(`${programme}-programme`);
    const formData = new FormData();
    formData.append("programme", programme);
    formData.append("file", file);

    fetch("/api/site_settings/programme_upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data.success) {
          throw new Error(data.errors?.join(", ") || "Programme upload failed.");
        }
        const nextSettings = data.site_settings || {};
        setSiteSettings(nextSettings);
        setSettingsForm((current) => ({
          ...current,
          church_programme_url: nextSettings.church_programme_url || "",
          reception_programme_url: nextSettings.reception_programme_url || "",
        }));
        setSettingsError("");
      })
      .catch((err) => setSettingsError(err.message))
      .finally(() => setSettingsUploading(""));
    event.target.value = "";
  }

  function handleProgrammeDelete(programme) {
    setProgrammeDeleting(programme);
    fetch("/api/site_settings/programme_upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programme }),
    })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data.success) {
          throw new Error(data.errors?.join(", ") || "Programme removal failed.");
        }
        const nextSettings = data.site_settings || {};
        setSiteSettings(nextSettings);
        setSettingsForm((current) => ({
          ...current,
          church_programme_url: nextSettings.church_programme_url || "",
          reception_programme_url: nextSettings.reception_programme_url || "",
        }));
        setSettingsError("");
      })
      .catch((err) => setSettingsError(err.message))
      .finally(() => setProgrammeDeleting(""));
  }

  function handleSettingsSave(event) {
    event.preventDefault();
    setSettingsSaving(true);
    setSettingsError("");
    setSettingsSaved(false);

    fetch("/api/site_settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_setting: settingsForm }),
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (!ok)
          throw new Error(
            data.errors?.join(", ") || "Could not save settings.",
          );
        const nextSettings = data.site_settings || {};
        setSiteSettings(nextSettings);
        setSettingsForm((current) => ({
          ...current,
          portal_mode: nextSettings.portal_mode || "auto",
          switch_at: nextSettings.switch_at
            ? nextSettings.switch_at.slice(0, 16)
            : "",
          church_programme_url: nextSettings.church_programme_url || "",
          reception_programme_url: nextSettings.reception_programme_url || "",
          church_direction_url: nextSettings.church_direction_url || "",
          reception_direction_url: nextSettings.reception_direction_url || "",
          wedding_gallery_items_json: JSON.stringify(nextSettings.wedding_gallery_items || [], null, 2),
          prewedding_gallery_items_json: JSON.stringify(nextSettings.prewedding_gallery_items || [], null, 2),
          video_gallery_items_json: JSON.stringify(nextSettings.video_gallery_items || [], null, 2),
        }));
        setSettingsSaved(true);
        setSettingsSaving(false);
      })
      .catch((err) => {
        setSettingsError(err.message);
        setSettingsSaving(false);
      });
  }

  function handleLiveChange(event) {
    const { name, value } = event.target;
    setLiveForm((current) => ({ ...current, [name]: value }));
  }

  function handleLiveSubmit(event) {
    event.preventDefault();
    setLiveSaving(true);
    setLiveError("");
    setLiveSaved(false);

    fetch("/api/live_updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ live_update: liveForm }),
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (!ok)
          throw new Error(
            data.errors?.join(", ") || "Could not save live update.",
          );
        setLiveForm({ context: "General", message: "", author_name: "" });
        setLiveSaved(true);
        setLiveSaving(false);
        fetchLiveUpdates();
      })
      .catch((err) => {
        setLiveError(err.message);
        setLiveSaving(false);
      });
  }

  function handleDeleteLiveUpdate(id) {
    setLiveDeletingId(id);
    fetch(`/api/live_updates/${id}`, { method: "DELETE" })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (!ok || !data.success) {
          throw new Error("Could not delete live update.");
        }
        fetchLiveUpdates();
      })
      .catch((err) => {
        setLiveError(err.message);
      })
      .finally(() => {
        setLiveDeletingId(null);
      });
  }

  function handleSupportChange(event) {
    const { name, value } = event.target;
    setSupportDetail((current) => ({ ...current, [name]: value }));
  }

  function handleSupportSubmit(event) {
    event.preventDefault();
    setSupportSaving(true);
    setSupportError("");
    setSupportSaved(false);

    fetch("/api/support_detail", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ support_detail: supportDetail }),
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (!ok)
          throw new Error(
            data.errors?.join(", ") || "Could not save support details.",
          );
        setSupportDetail(data.support_detail || supportDetail);
        setSupportSaved(true);
        setSupportSaving(false);
      })
      .catch((err) => {
        setSupportError(err.message);
        setSupportSaving(false);
      });
  }

  function handleContactChange(event) {
    const { name, value } = event.target;
    setContactForm((current) => ({
      ...current,
      [name]: name === "display_order" ? Number(value) : value,
    }));
  }

  function handleContactSubmit(event) {
    event.preventDefault();
    setContactsSaving(true);
    setContactsError("");
    setContactsSaved(false);

    fetch("/api/planning_contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planning_contact: contactForm }),
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data })),
      )
      .then(({ ok, data }) => {
        if (!ok)
          throw new Error(data.errors?.join(", ") || "Could not save contact.");
        setContactForm({
          name: "",
          position: "",
          phone: "",
          display_order: 0,
        });
        setContactsSaved(true);
        setContactsSaving(false);
        fetchPlanningContacts();
      })
      .catch((err) => {
        setContactsError(err.message);
        setContactsSaving(false);
      });
  }

  function handleDeleteContact(id) {
    fetch(`/api/planning_contacts/${id}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) throw new Error("Could not delete contact.");
        fetchPlanningContacts();
      })
      .catch((err) => setContactsError(err.message));
  }

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(160deg, #1a1410 0%, #0f0b08 40%, #1a0e0e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: 16,
            padding: "48px 40px",
            width: "100%",
            maxWidth: 380,
            textAlign: "center",
          }}
        >
          {" "}
          <img
            src={initialSiteSettings?.logo_url || "/icon.png"}
            alt="Wedding logo"
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
              margin: "0 auto 12px",
              boxShadow: "0 18px 32px rgba(201,168,76,0.14)",
              border: "3px solid rgba(255,255,255,0.14)",
              background: "#fff",
            }}
          />
          <h1
            style={{
              color: "#c9a84c",
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.6rem",
              fontWeight: 400,
              marginBottom: 6,
            }}
          >
            Wedding Admin
          </h1>
          <p
            style={{ color: "#a89880", fontSize: "0.85rem", marginBottom: 28 }}
          >
            Comfort &amp; Shammah
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                border: `1px solid ${passwordError ? "#f87171" : "rgba(201,168,76,0.3)"}`,
                background: "rgba(255,255,255,0.06)",
                color: "#f5f0e8",
                fontSize: "0.95rem",
                outline: "none",
                marginBottom: 8,
                boxSizing: "border-box",
              }}
            />
            {passwordError && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.8rem",
                  marginBottom: 12,
                }}
              >
                Incorrect password. Try again.
              </p>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #c9a84c, #a8872a)",
                color: "#1a1410",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filtered = rsvps
    .filter((r) => {
      if (filter === "attending") return r.attendance === "yes";
      if (filter === "not_attending") return r.attendance === "no";
      return true;
    })
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (r.name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
      );
    });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #1a1410 0%, #0f0b08 40%, #1a0e0e 100%)",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#f5f0e8",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid rgba(201,168,76,0.15)",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.5rem",
              fontWeight: 400,
              color: "#c9a84c",
              margin: 0,
            }}
          >
            RSVP Dashboard
          </h1>
          <p
            style={{
              color: "#7a6552",
              fontSize: "0.8rem",
              margin: "2px 0 0",
              letterSpacing: "0.1em",
            }}
          >
            ADAEZE &amp; CHUKWUEMEKA · June 28, 2025
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={fetchRsvps}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid rgba(201,168,76,0.4)",
              background: "transparent",
              color: "#c9a84c",
              fontSize: "0.82rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => exportCSV(rsvps)}
            disabled={rsvps.length === 0}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background:
                rsvps.length === 0
                  ? "rgba(201,168,76,0.2)"
                  : "linear-gradient(135deg, #c9a84c, #a8872a)",
              color: rsvps.length === 0 ? "#7a6552" : "#1a1410",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: rsvps.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            Export CSV
          </button>
          <a
            href="/"
            style={{
              color: "#7a6552",
              fontSize: "0.8rem",
              textDecoration: "none",
            }}
          >
            ← Invitation
          </a>
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 28,
            padding: 24,
            borderRadius: 16,
            border: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#e8d5b0",
                  fontSize: "1rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Portal Switch
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#a89880",
                  fontSize: "0.84rem",
                }}
              >
                Control when visitors see the invitation or the main wedding
                launcher.
              </p>
            </div>
            <div
              style={{
                color:
                  siteSettings.portal_state === "main" ? "#4ade80" : "#c9a84c",
                fontSize: "0.88rem",
              }}
            >
              Current state: {siteSettings.portal_state || "invitation"}
            </div>
          </div>

          <form
            onSubmit={handleSettingsSave}
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            <label style={{ display: "grid", gap: 8 }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7a6552",
                }}
              >
                Mode
              </span>
              <select
                name="portal_mode"
                value={settingsForm.portal_mode}
                onChange={handleSettingChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  color: "#f5f0e8",
                  border: "1px solid rgba(201,168,76,0.18)",
                }}
              >
                <option value="auto">Auto switch by time</option>
                <option value="invitation">Force invitation portal</option>
                <option value="main">Force main portal</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7a6552",
                }}
              >
                Switch Time
              </span>
              <input
                type="datetime-local"
                name="switch_at"
                value={settingsForm.switch_at}
                onChange={handleSettingChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  color: "#f5f0e8",
                  border: "1px solid rgba(201,168,76,0.18)",
                }}
              />
            </label>

            {[ 
              [
                "church_direction_url",
                "Church Direction URL",
                "https://maps.google.com/?q=ECWA%20Headquarters%20Church%2C%20Jos",
              ],
              [
                "reception_direction_url",
                "Reception Direction URL",
                "https://maps.google.com/?q=ECWA%20Headquarters%20International%20Conference%20Hall%2C%20Jos",
              ],
            ].map(([name, label, placeholder]) => (
              <label key={name} style={{ display: "grid", gap: 8 }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#7a6552",
                  }}
                >
                  {label}
                </span>
                <input
                  name={name}
                  value={settingsForm[name]}
                  onChange={handleSettingChange}
                  placeholder={placeholder}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    color: "#f5f0e8",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }}
                />
              </label>
            ))}

            <div
              style={{
                gridColumn: "1 / -1",
                display: "grid",
                gap: 12,
                padding: 16,
                borderRadius: 14,
                border: "1px solid rgba(201,168,76,0.18)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#e8d5b0", fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Programme PDFs
                </h3>
                <p style={{ margin: "6px 0 0", color: "#a89880", fontSize: "0.84rem" }}>
                  Upload the church and reception programmes. Guests will see the latest PDF directly in their browser.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
                {[
                  {
                    key: "church",
                    label: "Church Programme",
                    url: siteSettings.church_programme_url,
                    inputRef: churchProgrammeInputRef,
                  },
                  {
                    key: "reception",
                    label: "Reception Programme",
                    url: siteSettings.reception_programme_url,
                    inputRef: receptionProgrammeInputRef,
                  },
                ].map((programme) => (
                  <div key={programme.key} style={{ display: "grid", gap: 10, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <div>
                      <strong style={{ color: "#f5f0e8" }}>{programme.label}</strong>
                      <p style={{ margin: "4px 0 0", color: "#a89880", fontSize: "0.8rem" }}>
                        {programme.url?.startsWith("/uploads/programmes/") ? "A PDF is ready for guests." : "No custom PDF uploaded yet."}
                      </p>
                    </div>
                    <input
                      ref={programme.inputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) => handleProgrammeUpload(programme.key, event)}
                      style={{ display: "none" }}
                    />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => programme.inputRef.current?.click()}
                        disabled={settingsUploading === `${programme.key}-programme`}
                        style={{ padding: "9px 12px", border: "none", borderRadius: 10, background: "linear-gradient(135deg, #c9a84c, #a8872a)", color: "#1a1410", fontWeight: 700, cursor: "pointer" }}
                      >
                        {settingsUploading === `${programme.key}-programme` ? "Uploading..." : "Upload PDF"}
                      </button>
                      {programme.url?.startsWith("/uploads/programmes/") ? (
                        <>
                          <a href={programme.url} target="_blank" rel="noreferrer" style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(232,213,176,0.22)", color: "#e8d5b0", textDecoration: "none", fontWeight: 700 }}>
                            Preview PDF
                          </a>
                          <button
                            type="button"
                            onClick={() => handleProgrammeDelete(programme.key)}
                            disabled={programmeDeleting === programme.key}
                            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(248,113,113,0.42)", background: "transparent", color: "#fca5a5", fontWeight: 700, cursor: "pointer" }}
                          >
                            {programmeDeleting === programme.key ? "Removing..." : "Remove"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                key: "wedding",
                label: "Wedding Images",
                kind: "wedding",
                items: siteSettings.wedding_gallery_items || [],
                accept: "image/*",
                ref: weddingGalleryInputRef,
                buttonLabel: "Upload wedding image",
              },
              {
                key: "prewedding",
                label: "Pre-Wedding Images",
                kind: "prewedding",
                items: siteSettings.prewedding_gallery_items || [],
                accept: "image/*",
                ref: preweddingGalleryInputRef,
                buttonLabel: "Upload pre-wedding image",
              },
              {
                key: "videos",
                label: "Video Gallery",
                kind: "video",
                items: siteSettings.video_gallery_items || [],
                accept: "video/*",
                ref: videoGalleryInputRef,
                buttonLabel: "Upload video clip",
              },
            ].map((section) => (
              <div
                key={section.key}
                style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#7a6552",
                      }}
                    >
                      {section.label}
                    </span>
                    <div
                      style={{
                        marginTop: 6,
                        color: "#a89880",
                        fontSize: "0.84rem",
                      }}
                    >
                      {section.items.length} file
                      {section.items.length === 1 ? "" : "s"} saved
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => section.ref.current?.click()}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(201,168,76,0.25)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#e8d5b0",
                      cursor: "pointer",
                    }}
                  >
                    {settingsUploading === section.kind
                      ? "Uploading..."
                      : section.buttonLabel}
                  </button>
                  <input
                    ref={section.ref}
                    type="file"
                    accept={section.accept}
                    onChange={(event) => handleMediaUpload(section.kind, event)}
                    style={{ display: "none" }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 12,
                  }}
                >
                  {section.items.length === 0 ? (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        padding: 16,
                        borderRadius: 14,
                        border: "1px dashed rgba(232,213,176,0.2)",
                        color: "#a89880",
                      }}
                    >
                      No files uploaded yet.
                    </div>
                  ) : (
                    section.items.map((item) => (
                      <div
                        key={item.src}
                        style={{
                          borderRadius: 16,
                          overflow: "hidden",
                          border: "1px solid rgba(232,213,176,0.12)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        {section.kind === "video" ? (
                          <video
                            controls
                            style={{
                              width: "100%",
                              display: "block",
                              aspectRatio: "4 / 3",
                              objectFit: "cover",
                            }}
                          >
                            <source src={item.src} />
                          </video>
                        ) : (
                          <img
                            src={item.src}
                            alt={item.alt || section.label}
                            style={{
                              width: "100%",
                              display: "block",
                              aspectRatio: "4 / 3",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div style={{ padding: 12, display: "grid", gap: 8 }}>
                          <strong
                            style={{ color: "#f5f0e8", fontSize: "0.9rem" }}
                          >
                            {item.caption ||
                              item.title ||
                              item.alt ||
                              "Untitled"}
                          </strong>
                          <button
                            type="button"
                            onClick={() =>
                              handleMediaDelete(section.kind, item.src)
                            }
                            disabled={
                              galleryDeletingKey ===
                              `${section.kind}:${item.src}`
                            }
                            style={{
                              padding: "8px 12px",
                              borderRadius: 10,
                              border: "1px solid rgba(248,113,113,0.3)",
                              background: "transparent",
                              color: "#f87171",
                              cursor:
                                galleryDeletingKey ===
                                `${section.kind}:${item.src}`
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {galleryDeletingKey ===
                            `${section.kind}:${item.src}`
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
                gap: 8,
              }}
            >
              <button
                type="submit"
                disabled={settingsSaving || settingsLoading}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #c9a84c, #a8872a)",
                  color: "#1a1410",
                  fontWeight: 700,
                  cursor:
                    settingsSaving || settingsLoading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {settingsSaving ? "Saving..." : "Save Switch Settings"}
              </button>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#7a6552" }}>
                Invitation access remains available with `?portal=invite`.
              </p>
            </div>
          </form>

          {settingsError && (
            <p style={{ marginTop: 12, color: "#f87171", fontSize: "0.82rem" }}>
              Settings error: {settingsError}
            </p>
          )}
          {settingsSaved && (
            <p style={{ marginTop: 12, color: "#4ade80", fontSize: "0.82rem" }}>
              Switch settings saved.
            </p>
          )}
        </div>

        <div
          style={{
            marginBottom: 28,
            padding: 24,
            borderRadius: 16,
            border: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#e8d5b0",
                  fontSize: "1rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Live Updates
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#a89880",
                  fontSize: "0.84rem",
                }}
              >
                Post ceremony and reception notes that appear in the public live
                feed.
              </p>
            </div>
            <button
              onClick={fetchLiveUpdates}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(201,168,76,0.25)",
                background: "transparent",
                color: "#c9a84c",
                cursor: "pointer",
              }}
            >
              Refresh Feed
            </button>
          </div>

          <form
            onSubmit={handleLiveSubmit}
            style={{ marginTop: 18, display: "grid", gap: 14 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <label style={{ display: "grid", gap: 8 }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#7a6552",
                  }}
                >
                  Context
                </span>
                <select
                  name="context"
                  value={liveForm.context}
                  onChange={handleLiveChange}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    color: "#f5f0e8",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }}
                >
                  <option value="General">General</option>
                  <option value="Church">Church</option>
                  <option value="Reception">Reception</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#7a6552",
                  }}
                >
                  Author
                </span>
                <input
                  name="author_name"
                  value={liveForm.author_name}
                  onChange={handleLiveChange}
                  placeholder="Optional name"
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    color: "#f5f0e8",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }}
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: 8 }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7a6552",
                }}
              >
                Message
              </span>
              <textarea
                name="message"
                value={liveForm.message}
                onChange={handleLiveChange}
                rows={4}
                placeholder="Type the latest ceremony or reception update..."
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  color: "#f5f0e8",
                  border: "1px solid rgba(201,168,76,0.18)",
                  resize: "vertical",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={liveSaving || liveLoading}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #c9a84c, #a8872a)",
                color: "#1a1410",
                fontWeight: 700,
                cursor: liveSaving || liveLoading ? "not-allowed" : "pointer",
                justifySelf: "start",
              }}
            >
              {liveSaving ? "Posting..." : "Post Live Update"}
            </button>
          </form>

          {liveError && (
            <p style={{ marginTop: 12, color: "#f87171", fontSize: "0.82rem" }}>
              Live update error: {liveError}
            </p>
          )}
          {liveSaved && (
            <p style={{ marginTop: 12, color: "#4ade80", fontSize: "0.82rem" }}>
              Live update posted.
            </p>
          )}

          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {liveUpdates.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: "1px dashed rgba(232,213,176,0.2)",
                  color: "#a89880",
                }}
              >
                No updates yet.
              </div>
            ) : (
              liveUpdates.slice(0, 5).map((update) => (
                <div
                  key={update.id}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: "1px solid rgba(232,213,176,0.12)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <strong
                      style={{
                        color: "#c9a84c",
                        fontSize: "0.8rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      {update.context}
                    </strong>
                    <span style={{ color: "#7a6552", fontSize: "0.78rem" }}>
                      {new Date(update.published_at).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleDeleteLiveUpdate(update.id)}
                      disabled={liveDeletingId === update.id}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(248,113,113,0.3)",
                        background: "transparent",
                        color: "#f87171",
                        cursor:
                          liveDeletingId === update.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {liveDeletingId === update.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#f5f0e8",
                      lineHeight: 1.7,
                    }}
                  >
                    {update.message}
                  </p>
                  {update.author_name ? (
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#a89880",
                        fontSize: "0.8rem",
                      }}
                    >
                      Posted by {update.author_name}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div
          style={{
            marginBottom: 28,
            padding: 24,
            borderRadius: 16,
            border: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#e8d5b0",
                  fontSize: "1rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Support and Gifts
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#a89880",
                  fontSize: "0.84rem",
                }}
              >
                Edit the support note and bank details shown to guests.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSupportSubmit}
            style={{ marginTop: 18, display: "grid", gap: 14 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              {[
                ["heading", "Heading"],
                ["bank_name", "Bank Name"],
                ["account_name", "Account Name"],
                ["account_number", "Account Number"],
                ["sort_code", "Sort Code"],
              ].map(([name, label]) => (
                <label key={name} style={{ display: "grid", gap: 8 }}>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#7a6552",
                    }}
                  >
                    {label}
                  </span>
                  <input
                    name={name}
                    value={supportDetail[name]}
                    onChange={handleSupportChange}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.04)",
                      color: "#f5f0e8",
                      border: "1px solid rgba(201,168,76,0.18)",
                    }}
                  />
                </label>
              ))}
            </div>

            <label style={{ display: "grid", gap: 8 }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7a6552",
                }}
              >
                Note
              </span>
              <textarea
                name="note"
                value={supportDetail.note}
                onChange={handleSupportChange}
                rows={4}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  color: "#f5f0e8",
                  border: "1px solid rgba(201,168,76,0.18)",
                  resize: "vertical",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={supportSaving || supportLoading}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #c9a84c, #a8872a)",
                color: "#1a1410",
                fontWeight: 700,
                cursor:
                  supportSaving || supportLoading ? "not-allowed" : "pointer",
                justifySelf: "start",
              }}
            >
              {supportSaving ? "Saving..." : "Save Support Details"}
            </button>
          </form>

          {supportError && (
            <p style={{ marginTop: 12, color: "#f87171", fontSize: "0.82rem" }}>
              Support error: {supportError}
            </p>
          )}
          {supportSaved && (
            <p style={{ marginTop: 12, color: "#4ade80", fontSize: "0.82rem" }}>
              Support details saved.
            </p>
          )}
        </div>

        <div
          style={{
            marginBottom: 28,
            padding: 24,
            borderRadius: 16,
            border: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#e8d5b0",
                  fontSize: "1rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Planning Contacts
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#a89880",
                  fontSize: "0.84rem",
                }}
              >
                Add unlimited contacts for planners, developers, or
                coordinators.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleContactSubmit}
            style={{ marginTop: 18, display: "grid", gap: 14 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              {[
                ["name", "Name"],
                ["position", "Position"],
                ["phone", "Phone"],
              ].map(([name, label]) => (
                <label key={name} style={{ display: "grid", gap: 8 }}>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#7a6552",
                    }}
                  >
                    {label}
                  </span>
                  <input
                    name={name}
                    value={contactForm[name]}
                    onChange={handleContactChange}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.04)",
                      color: "#f5f0e8",
                      border: "1px solid rgba(201,168,76,0.18)",
                    }}
                  />
                </label>
              ))}
              <label style={{ display: "grid", gap: 8 }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#7a6552",
                  }}
                >
                  Order
                </span>
                <input
                  name="display_order"
                  type="number"
                  value={contactForm.display_order}
                  onChange={handleContactChange}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    color: "#f5f0e8",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={contactsSaving || contactsLoading}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #c9a84c, #a8872a)",
                color: "#1a1410",
                fontWeight: 700,
                cursor:
                  contactsSaving || contactsLoading ? "not-allowed" : "pointer",
                justifySelf: "start",
              }}
            >
              {contactsSaving ? "Saving..." : "Add Contact"}
            </button>
          </form>

          {contactsError && (
            <p style={{ marginTop: 12, color: "#f87171", fontSize: "0.82rem" }}>
              Contacts error: {contactsError}
            </p>
          )}
          {contactsSaved && (
            <p style={{ marginTop: 12, color: "#4ade80", fontSize: "0.82rem" }}>
              Planning contact saved.
            </p>
          )}

          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {planningContacts.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: "1px dashed rgba(232,213,176,0.2)",
                  color: "#a89880",
                }}
              >
                No planning contacts yet.
              </div>
            ) : (
              planningContacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: "1px solid rgba(232,213,176,0.12)",
                    background: "rgba(255,255,255,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 14,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong style={{ color: "#f5f0e8" }}>{contact.name}</strong>
                    <div style={{ color: "#a89880", fontSize: "0.82rem" }}>
                      {contact.position}
                    </div>
                    <div style={{ color: "#7a6552", fontSize: "0.8rem" }}>
                      {contact.phone || "No phone"}{" "}
                      {contact.display_order
                        ? `· Order ${contact.display_order}`
                        : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteContact(contact.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(248,113,113,0.3)",
                      background: "transparent",
                      color: "#f87171",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 36,
          }}
        >
          <StatCard
            label="Total RSVPs"
            value={stats.total || 0}
            color="#c9a84c"
            icon="📬"
          />
          <StatCard
            label="Attending"
            value={stats.attending || 0}
            color="#4ade80"
            icon="✓"
          />
          <StatCard
            label="Not Attending"
            value={stats.not_attending || 0}
            color="#f87171"
            icon="✗"
          />
          <StatCard
            label="Total Guests"
            value={stats.total_guests || 0}
            color="#818cf8"
            icon="👥"
          />
        </div>

        {/* Filters & Search */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {[
            { key: "all", label: `All (${rsvps.length})` },
            { key: "attending", label: `Attending (${stats.attending || 0})` },
            {
              key: "not_attending",
              label: `Not Attending (${stats.not_attending || 0})`,
            },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: `1px solid ${filter === key ? "#c9a84c" : "rgba(201,168,76,0.2)"}`,
                background:
                  filter === key ? "rgba(201,168,76,0.15)" : "transparent",
                color: filter === key ? "#c9a84c" : "#7a6552",
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              marginLeft: "auto",
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(201,168,76,0.2)",
              background: "rgba(255,255,255,0.04)",
              color: "#f5f0e8",
              fontSize: "0.85rem",
              outline: "none",
              minWidth: 220,
            }}
          />
        </div>

        {/* Table */}
        {loading && (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#7a6552" }}
          >
            Loading RSVPs...
          </div>
        )}
        {error && (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#f87171" }}
          >
            Error: {error}
            <button
              onClick={fetchRsvps}
              style={{
                marginLeft: 12,
                color: "#c9a84c",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <div
            style={{
              overflowX: "auto",
              borderRadius: 12,
              border: "1px solid rgba(201,168,76,0.12)",
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#7a6552",
                }}
              >
                {rsvps.length === 0
                  ? "No RSVPs received yet."
                  : "No results match your filter."}
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.88rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(201,168,76,0.15)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    {[
                      "#",
                      "Name",
                      "Email",
                      "Status",
                      "Guests",
                      "Message",
                      "Submitted",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "14px 16px",
                          textAlign: "left",
                          color: "#7a6552",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "14px 16px", color: "#7a6552" }}>
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontWeight: 600,
                          color: "#e8d5b0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.name || "—"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#a89880" }}>
                        {r.email || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Badge attendance={r.attendance} />
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "#a89880",
                          textAlign: "center",
                        }}
                      >
                        {r.attendance === "yes" ? r.guest_count || 1 : "—"}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "#7a6552",
                          maxWidth: 220,
                        }}
                      >
                        <span
                          title={r.message || ""}
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 200,
                          }}
                        >
                          {r.message || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "#7a6552",
                          whiteSpace: "nowrap",
                          fontSize: "0.8rem",
                        }}
                      >
                        {new Date(r.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            color: "#3d2b1f",
            fontSize: "0.75rem",
            marginTop: 40,
          }}
        >
          Wedding RSVP Admin · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
