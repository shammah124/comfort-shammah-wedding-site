import React, { useCallback, useEffect, useRef, useState } from "react";

const MEDIA_PAGE_SIZE = 24;
const GOODWILL_PAGE_SIZE = 15;
const SUCCESS_MESSAGE_DURATION = 2_000;
const ERROR_MESSAGE_DURATION = 5_000;
const EMPTY_ADMIN_FORM = { name: "", password: "", password_confirmation: "", permissions: [] };

function useTimedMessage() {
  const [notice, setNotice] = useState({ text: "", type: "success" });

  useEffect(() => {
    if (!notice.text) return undefined;

    const duration = notice.type === "error" ? ERROR_MESSAGE_DURATION : SUCCESS_MESSAGE_DURATION;
    const timer = window.setTimeout(() => setNotice({ text: "", type: "success" }), duration);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const showMessage = useCallback((text, type = "success") => {
    setNotice({ text, type });
  }, []);

  return [notice.text, showMessage];
}

function Field({ label, children }) {
  return <label className="admin-field"><span>{label}</span>{children}</label>;
}

function Panel({ id, eyebrow, title, children, action }) {
  return (
    <section className="admin-panel" id={id}>
      <div className="admin-panel__heading">
        <div><p>{eyebrow}</p><h2>{title}</h2></div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Button({ children, tone = "primary", ...props }) {
  return <button type="button" className={`admin-button admin-button--${tone}`} {...props}>{children}</button>;
}

function ConfirmationDialog({ dialog, busy, onCancel, onConfirm }) {
  const cancelButton = useRef(null);

  useEffect(() => {
    if (!dialog) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButton.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, dialog, onCancel]);

  if (!dialog) return null;

  return (
    <div className="admin-dialog" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <section className="admin-dialog__card" role="alertdialog" aria-modal="true" aria-labelledby="admin-dialog-title" aria-describedby="admin-dialog-message">
        <div className="admin-dialog__icon" aria-hidden="true">!</div>
        <p>Confirm this action</p>
        <h2 id="admin-dialog-title">{dialog.title}</h2>
        <div className="admin-dialog__rule" aria-hidden="true" />
        <span id="admin-dialog-message">{dialog.message}</span>
        <div className="admin-dialog__actions">
          <Button tone="quiet" ref={cancelButton} disabled={busy} onClick={onCancel}>Keep it</Button>
          <Button tone="danger" disabled={busy} onClick={onConfirm}>{busy ? "Please wait..." : dialog.confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}

async function readJson(response) {
  const text = await response.text();
  try {
    return { ok: response.ok, data: JSON.parse(text) };
  } catch {
    return {
      ok: false,
      data: {
        success: false,
        errors: [response.status === 413 ? "The selected file is too large. Please choose a smaller image." : "The server could not process this request. Please refresh the page and try again."],
      },
    };
  }
}

function supportDefaults(detail = {}) {
  return {
    heading: detail.heading || "Support and Gifts",
    note: detail.note || "",
    bank_name: detail.bank_name || "",
    account_name: detail.account_name || "",
    account_number: detail.account_number || "",
    sort_code: detail.sort_code || "",
    secondary_bank_name: detail.secondary_bank_name || "",
    secondary_account_name: detail.secondary_account_name || "",
    secondary_account_number: detail.secondary_account_number || "",
    secondary_sort_code: detail.secondary_sort_code || "",
  };
}

export default function WeddingAdmin({ siteSettings: initialSiteSettings = {} }) {
  const weddingLogo = initialSiteSettings.logo_url || "/assets/My%20Wedding%20Logo.png";
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);
  const [settingsForm, setSettingsForm] = useState({
    portal_mode: initialSiteSettings.portal_mode || "auto",
    switch_at: initialSiteSettings.switch_at?.slice(0, 16) || "",
    church_direction_url: initialSiteSettings.church_direction_url || "",
    reception_direction_url: initialSiteSettings.reception_direction_url || "",
  });
  const [settingsMessage, setSettingsMessage] = useTimedMessage();
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploading, setUploading] = useState("");
  const [deletingMedia, setDeletingMedia] = useState("");
  const [deletingProgramme, setDeletingProgramme] = useState("");
  const [mediaTab, setMediaTab] = useState("wedding");
  const [mediaGrid, setMediaGrid] = useState("comfortable");
  const [mediaVisible, setMediaVisible] = useState(MEDIA_PAGE_SIZE);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [liveForm, setLiveForm] = useState({ context: "Church", author_name: "", message: "" });
  const [liveMessage, setLiveMessage] = useTimedMessage();
  const [savingLive, setSavingLive] = useState(false);
  const [deletingLive, setDeletingLive] = useState(null);
  const [goodwillMessages, setGoodwillMessages] = useState([]);
  const [goodwillVisible, setGoodwillVisible] = useState(GOODWILL_PAGE_SIZE);
  const [expandedGoodwillId, setExpandedGoodwillId] = useState(null);
  const [deletingGoodwill, setDeletingGoodwill] = useState(null);
  const [goodwillMessage, setGoodwillMessage] = useTimedMessage();
  const [confirmation, setConfirmation] = useState(null);
  const [confirmingAction, setConfirmingAction] = useState(false);
  const [supportDetail, setSupportDetail] = useState(supportDefaults());
  const [supportMessage, setSupportMessage] = useTimedMessage();
  const [savingSupport, setSavingSupport] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: "", position: "", phone: "", display_order: 0 });
  const [contactPhoto, setContactPhoto] = useState(null);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingContactForm, setEditingContactForm] = useState({ name: "", position: "", phone: "", display_order: 0 });
  const [editingContactPhoto, setEditingContactPhoto] = useState(null);
  const [savingContactEdit, setSavingContactEdit] = useState(false);
  const [contactMessage, setContactMessage] = useTimedMessage();
  const [savingContact, setSavingContact] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState({ total: 0, attending: 0, not_attending: 0, total_guests: 0 });
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [rsvpSearch, setRsvpSearch] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [newAdminForm, setNewAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [adminAccessMessage, setAdminAccessMessage] = useTimedMessage();
  const [savingAdmin, setSavingAdmin] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [passwordMessage, setPasswordMessage] = useTimedMessage();
  const [savingPassword, setSavingPassword] = useState(false);
  const weddingInput = useRef(null);
  const preweddingInput = useRef(null);
  const videoInput = useRef(null);
  const churchProgrammeInput = useRef(null);
  const receptionProgrammeInput = useRef(null);
  const contactPhotoInput = useRef(null);
  const editingContactPhotoInput = useRef(null);

  function canAccess(permission) {
    return Boolean(currentAdmin?.super_admin || currentAdmin?.permissions?.includes(permission));
  }

  const refreshSettings = useCallback(async () => {
    const { ok, data } = await fetch("/api/site_settings").then(readJson);
    if (!ok) throw new Error(data.errors?.join(", ") || "Could not load portal settings.");
    const next = data.site_settings || {};
    setSiteSettings(next);
    setSettingsForm({
      portal_mode: next.portal_mode || "auto",
      switch_at: next.switch_at?.slice(0, 16) || "",
      church_direction_url: next.church_direction_url || "",
      reception_direction_url: next.reception_direction_url || "",
    });
  }, []);

  const refreshLiveUpdates = useCallback(async () => {
    const { ok, data } = await fetch("/api/live_updates").then(readJson);
    if (!ok) throw new Error("Could not load live updates.");
    setLiveUpdates(data.live_updates || []);
  }, []);

  const refreshGoodwillMessages = useCallback(async () => {
    const { ok, data } = await fetch("/api/goodwill_messages").then(readJson);
    if (!ok) throw new Error("Could not load goodwill messages.");
    setGoodwillMessages(data.goodwill_messages || []);
  }, []);

  const refreshSupport = useCallback(async () => {
    const { ok, data } = await fetch("/api/support_detail").then(readJson);
    if (!ok) throw new Error("Could not load support details.");
    setSupportDetail(supportDefaults(data.support_detail));
  }, []);

  const refreshContacts = useCallback(async () => {
    const { ok, data } = await fetch("/api/planning_contacts").then(readJson);
    if (!ok) throw new Error("Could not load planning contacts.");
    setContacts(data.planning_contacts || []);
  }, []);

  const refreshRsvps = useCallback(async () => {
    const { ok, data } = await fetch("/api/rsvps").then(readJson);
    if (!ok) throw new Error("Could not load RSVPs.");
    setRsvps(data.rsvps || []);
    setStats(data.stats || {});
  }, []);

  const refreshAdminUsers = useCallback(async () => {
    const { ok, data } = await fetch("/api/admin_users").then(readJson);
    if (!ok) throw new Error(data.errors?.join(", ") || "Could not load admin accounts.");
    setAdminUsers((data.admin_users || []).map((admin) => ({ ...admin, password: "", password_confirmation: "" })));
    setAvailablePermissions(data.available_permissions || {});
  }, []);

  useEffect(() => {
    fetch("/api/session")
      .then(readJson)
      .then(({ ok, data }) => {
        setAuthed(Boolean(ok && data.signed_in));
        setCurrentAdmin(ok && data.signed_in ? data.admin : null);
      })
      .catch(() => { setAuthed(false); setCurrentAdmin(null); })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!authed || !currentAdmin) return;
    const requests = [];
    if (canAccess("site_settings") || canAccess("programmes") || canAccess("galleries")) requests.push(refreshSettings());
    if (canAccess("live_updates")) requests.push(refreshLiveUpdates());
    if (canAccess("goodwill_messages")) requests.push(refreshGoodwillMessages());
    if (canAccess("support")) requests.push(refreshSupport());
    if (canAccess("planning_team")) requests.push(refreshContacts());
    if (canAccess("rsvps")) requests.push(refreshRsvps());
    if (currentAdmin.super_admin) requests.push(refreshAdminUsers());
    Promise.all(requests).catch(() => {});
  }, [authed, currentAdmin, refreshAdminUsers, refreshContacts, refreshGoodwillMessages, refreshLiveUpdates, refreshRsvps, refreshSettings, refreshSupport]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    const { ok, data } = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: loginName, password }) }).then(readJson);
    if (!ok || !data.success) {
      setLoginError(data.errors?.join(", ") || "Incorrect password. Try again.");
      setPassword("");
      return;
    }
    setCurrentAdmin(data.admin);
    setAuthed(true);
    setPassword("");
  }

  async function handleLogout() {
    await fetch("/api/session", { method: "DELETE" });
    setAuthed(false);
    setCurrentAdmin(null);
    setLoginName("");
    setPassword("");
  }

  function requestConfirmation({ title, message, confirmLabel, action }) {
    setConfirmation({ title, message, confirmLabel, action });
  }

  async function runConfirmedAction() {
    if (!confirmation?.action || confirmingAction) return;

    setConfirmingAction(true);
    try {
      await confirmation.action();
      setConfirmation(null);
    } finally {
      setConfirmingAction(false);
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSavingSettings(true);
    setSettingsMessage("");
    try {
      const { ok, data } = await fetch("/api/site_settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ site_setting: settingsForm }) }).then(readJson);
      if (!ok) throw new Error(data.errors?.join(", ") || "Could not save portal settings.");
      await refreshSettings();
      setSettingsMessage("Portal settings saved.");
    } catch (error) {
      setSettingsMessage(error.message, "error");
    } finally {
      setSavingSettings(false);
    }
  }

  async function uploadProgramme(programme, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(`${programme}-programme`);
    setSettingsMessage("");
    const formData = new FormData();
    formData.append("programme", programme);
    formData.append("file", file);
    try {
      const { ok, data } = await fetch("/api/site_settings/programme_upload", { method: "POST", body: formData }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "PDF upload failed.");
      await refreshSettings();
      setSettingsMessage(`${programme === "church" ? "Church" : "Reception"} programme updated.`);
    } catch (error) {
      setSettingsMessage(error.message, "error");
    } finally {
      setUploading("");
      event.target.value = "";
    }
  }

  async function removeProgramme(programme) {
    setDeletingProgramme(programme);
    try {
      const { ok, data } = await fetch("/api/site_settings/programme_upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ programme }) }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not remove this PDF.");
      await refreshSettings();
    } catch (error) {
      setSettingsMessage(error.message, "error");
    } finally {
      setDeletingProgramme("");
    }
  }

  async function uploadMedia(kind, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);
    try {
      const { ok, data } = await fetch("/api/site_settings/media_upload", { method: "POST", body: formData }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "File upload failed.");
      await refreshSettings();
    } catch (error) {
      setSettingsMessage(error.message, "error");
    } finally {
      setUploading("");
      event.target.value = "";
    }
  }

  async function removeMedia(kind, src) {
    setDeletingMedia(`${kind}:${src}`);
    try {
      const { ok, data } = await fetch("/api/site_settings/media_upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, src }) }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not delete this file.");
      await refreshSettings();
    } catch (error) {
      setSettingsMessage(error.message, "error");
    } finally {
      setDeletingMedia("");
    }
  }

  async function submitLiveUpdate(event) {
    event.preventDefault();
    setSavingLive(true);
    setLiveMessage("");
    try {
      const { ok, data } = await fetch("/api/live_updates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ live_update: liveForm }) }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not post the update.");
      setLiveForm({ context: "Church", author_name: "", message: "" });
      await refreshLiveUpdates();
      setLiveMessage("Update posted to the public feed.");
    } catch (error) {
      setLiveMessage(error.message, "error");
    } finally {
      setSavingLive(false);
    }
  }

  async function deleteLiveUpdate(id) {
    setDeletingLive(id);
    try {
      const { ok, data } = await fetch(`/api/live_updates/${id}`, { method: "DELETE" }).then(readJson);
      if (!ok || !data.success) throw new Error("Could not delete this update.");
      await refreshLiveUpdates();
    } catch (error) {
      setLiveMessage(error.message, "error");
    } finally {
      setDeletingLive(null);
    }
  }

  async function deleteGoodwillMessage(id) {
    setDeletingGoodwill(id);
    setGoodwillMessage("");
    try {
      const { ok, data } = await fetch(`/api/goodwill_messages/${id}`, { method: "DELETE" }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not delete this goodwill message.");
      setGoodwillMessages((current) => current.filter((entry) => entry.id !== id));
      if (expandedGoodwillId === id) setExpandedGoodwillId(null);
      setGoodwillMessage("Goodwill message deleted.");
    } catch (error) {
      setGoodwillMessage(error.message, "error");
    } finally {
      setDeletingGoodwill(null);
    }
  }

  async function saveSupport(event) {
    event.preventDefault();
    setSavingSupport(true);
    setSupportMessage("");
    try {
      const { ok, data } = await fetch("/api/support_detail", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ support_detail: supportDetail }) }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not save account details.");
      const savedDetail = supportDefaults(data.support_detail);
      setSupportDetail(savedDetail);
      await refreshSupport();
      const hasSecondAccount = ["secondary_bank_name", "secondary_account_name", "secondary_account_number", "secondary_sort_code"].some((field) => savedDetail[field]);
      setSupportMessage(hasSecondAccount ? "Both account details are saved and ready for the public page." : "Support details saved. Complete the second account and save when ready.");
    } catch (error) {
      setSupportMessage(error.message, "error");
    } finally {
      setSavingSupport(false);
    }
  }

  async function addContact(event) {
    event.preventDefault();
    setSavingContact(true);
    setContactMessage("");
    try {
      const formData = new FormData();
      Object.entries(contactForm).forEach(([field, value]) => formData.append(`planning_contact[${field}]`, value));
      if (contactPhoto) formData.append("planning_contact[photo]", contactPhoto);
      const { ok, data } = await fetch("/api/planning_contacts", { method: "POST", body: formData }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not add this contact.");
      setContactForm({ name: "", position: "", phone: "", display_order: 0 });
      setContactPhoto(null);
      if (contactPhotoInput.current) contactPhotoInput.current.value = "";
      await refreshContacts();
      setContactMessage("Planning contact added.");
    } catch (error) {
      setContactMessage(error.message, "error");
    } finally {
      setSavingContact(false);
    }
  }

  async function deleteContact(id) {
    const { ok, data } = await fetch(`/api/planning_contacts/${id}`, { method: "DELETE" }).then(readJson);
    if (!ok || !data.success) {
      setContactMessage("Could not delete this contact.", "error");
      return;
    }
    if (editingContactId === id) cancelContactEdit();
    refreshContacts();
  }

  function startContactEdit(contact) {
    setEditingContactId(contact.id);
    setEditingContactForm({
      name: contact.name || "",
      position: contact.position || "",
      phone: contact.phone || "",
      display_order: contact.display_order || 0,
    });
    setEditingContactPhoto(null);
    setContactMessage("");
  }

  function cancelContactEdit() {
    setEditingContactId(null);
    setEditingContactPhoto(null);
    if (editingContactPhotoInput.current) editingContactPhotoInput.current.value = "";
  }

  async function updateContact(event) {
    event.preventDefault();
    if (!editingContactId) return;

    setSavingContactEdit(true);
    setContactMessage("");
    try {
      const formData = new FormData();
      Object.entries(editingContactForm).forEach(([field, value]) => formData.append(`planning_contact[${field}]`, value));
      if (editingContactPhoto) formData.append("planning_contact[photo]", editingContactPhoto);
      const { ok, data } = await fetch(`/api/planning_contacts/${editingContactId}`, { method: "PATCH", body: formData }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not save this contact.");
      await refreshContacts();
      cancelContactEdit();
      setContactMessage("Planning team member updated.");
    } catch (error) {
      setContactMessage(error.message, "error");
    } finally {
      setSavingContactEdit(false);
    }
  }

  async function changeOwnPassword(event) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage("");
    try {
      const { ok, data } = await fetch("/api/admin_account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not update your password.");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      setPasswordMessage("Your password has been updated.");
    } catch (error) {
      setPasswordMessage(error.message, "error");
    } finally {
      setSavingPassword(false);
    }
  }

  function toggleNewAdminPermission(permission) {
    setNewAdminForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission],
    }));
  }

  function updateAdminDraft(id, field, value) {
    setAdminUsers((current) => current.map((admin) => admin.id === id ? { ...admin, [field]: value } : admin));
  }

  function toggleAdminPermission(id, permission) {
    setAdminUsers((current) => current.map((admin) => {
      if (admin.id !== id) return admin;
      const permissions = admin.permissions.includes(permission) ? admin.permissions.filter((item) => item !== permission) : [...admin.permissions, permission];
      return { ...admin, permissions };
    }));
  }

  async function createAdminAccount(event) {
    event.preventDefault();
    setSavingAdmin("new");
    setAdminAccessMessage("");
    try {
      const { ok, data } = await fetch("/api/admin_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_user: newAdminForm }),
      }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not create this admin account.");
      setNewAdminForm(EMPTY_ADMIN_FORM);
      await refreshAdminUsers();
      setAdminAccessMessage("Additional admin account created.");
    } catch (error) {
      setAdminAccessMessage(error.message, "error");
    } finally {
      setSavingAdmin(null);
    }
  }

  async function saveAdminAccount(admin) {
    setSavingAdmin(admin.id);
    setAdminAccessMessage("");
    try {
      const { ok, data } = await fetch(`/api/admin_users/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_user: { name: admin.name, active: admin.active, permissions: admin.permissions, password: admin.password, password_confirmation: admin.password_confirmation } }),
      }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not update this admin account.");
      await refreshAdminUsers();
      setAdminAccessMessage(`${admin.name}'s access has been updated.`);
    } catch (error) {
      setAdminAccessMessage(error.message, "error");
    } finally {
      setSavingAdmin(null);
    }
  }

  async function deleteAdminAccount(admin) {
    setSavingAdmin(admin.id);
    try {
      const { ok, data } = await fetch(`/api/admin_users/${admin.id}`, { method: "DELETE" }).then(readJson);
      if (!ok || !data.success) throw new Error(data.errors?.join(", ") || "Could not delete this admin account.");
      await refreshAdminUsers();
      setAdminAccessMessage(`${admin.name}'s admin account has been deleted.`);
    } catch (error) {
      setAdminAccessMessage(error.message, "error");
    } finally {
      setSavingAdmin(null);
    }
  }

  if (!authReady) return <main className="admin-auth"><p>Opening wedding admin...</p></main>;

  if (!authed) {
    return <main className="admin-auth"><form className="admin-login" onSubmit={handleLogin}>
      <img src={weddingLogo} alt="Comfort and Shammah wedding logo" />
      <p>Comfort &amp; Shammah · 2026</p><h1>Wedding Admin</h1><span>Private wedding workspace</span>
      <Field label="Admin name"><input value={loginName} onChange={(event) => setLoginName(event.target.value)} placeholder="Primary Admin" autoComplete="username" autoFocus /></Field>
      <Field label="Admin password"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></Field>
      {loginError ? <small className="admin-feedback admin-feedback--error">{loginError}</small> : null}
      <button className="admin-button admin-button--primary" type="submit">Enter dashboard</button>
    </form></main>;
  }

  const mediaSections = {
    wedding: { label: "Wedding images", items: siteSettings.wedding_gallery_items || [], accept: "image/*", ref: weddingInput },
    prewedding: { label: "Pre-wedding images", items: siteSettings.prewedding_gallery_items || [], accept: "image/*", ref: preweddingInput },
    video: { label: "Video clips", items: siteSettings.video_gallery_items || [], accept: "video/*", ref: videoInput },
  };
  const activeMedia = mediaSections[mediaTab];
  const visibleMedia = activeMedia.items.slice(0, mediaVisible);
  const visibleGoodwillMessages = goodwillMessages.slice(0, goodwillVisible);
  const filteredRsvps = rsvps.filter((rsvp) => (rsvpFilter === "all" || (rsvpFilter === "attending" ? rsvp.attendance === "yes" : rsvp.attendance === "no")) && `${rsvp.name || ""} ${rsvp.email || ""}`.toLowerCase().includes(rsvpSearch.toLowerCase()));

  return <main className="admin-app">
    <header className="admin-hero">
      <div className="admin-hero__brand"><img src={weddingLogo} alt="Comfort and Shammah wedding logo" /><div><p>Comfort &amp; Shammah · October 17, 2026</p><h1>Wedding Admin</h1></div></div>
      <div className="admin-hero__actions"><span className="admin-signed-in">Signed in as <b>{currentAdmin?.name}</b></span><a className="admin-button admin-button--quiet" href="/?portal=main" target="_blank" rel="noreferrer">View public site</a><Button tone="quiet" onClick={handleLogout}>Log out</Button></div>
    </header>
    <nav className="admin-nav" aria-label="Dashboard sections">
      {(canAccess("site_settings") || canAccess("programmes")) ? <a href="#portal">Portal</a> : null}
      {canAccess("galleries") ? <a href="#media">Media library</a> : null}
      {canAccess("live_updates") ? <a href="#updates">Live updates</a> : null}
      {canAccess("goodwill_messages") ? <a href="#goodwill">Goodwill messages</a> : null}
      {canAccess("support") ? <a href="#support">Support &amp; gifts</a> : null}
      {canAccess("planning_team") ? <a href="#team">Planning team</a> : null}
      {canAccess("rsvps") ? <a href="#rsvps">RSVPs</a> : null}
      <a href="#account">My password</a>
      {currentAdmin?.super_admin ? <a href="#admin-access">Admin access</a> : null}
    </nav>
    <div className="admin-content">
      {canAccess("rsvps") ? <section className="admin-stats">
        <article><strong>{stats.total || 0}</strong><span>Total RSVPs</span></article><article><strong>{stats.attending || 0}</strong><span>Attending</span></article><article><strong>{stats.not_attending || 0}</strong><span>Not attending</span></article><article><strong>{stats.total_guests || 0}</strong><span>Total guests</span></article>
      </section> : null}

      {(canAccess("site_settings") || canAccess("programmes")) ? <Panel id="portal" eyebrow="Guest experience" title="Portal & programmes">
        <form className="admin-form" onSubmit={saveSettings}>
          {canAccess("site_settings") ? <>
          <div className="admin-form__grid"><Field label="Visitor mode"><select value={settingsForm.portal_mode} onChange={(event) => setSettingsForm((current) => ({ ...current, portal_mode: event.target.value }))}><option value="auto">Auto switch by time</option><option value="invitation">Always show invitation</option><option value="main">Always show main portal</option></select></Field><Field label="Switch time"><input type="datetime-local" value={settingsForm.switch_at} onChange={(event) => setSettingsForm((current) => ({ ...current, switch_at: event.target.value }))} disabled={settingsForm.portal_mode !== "auto"} /></Field></div>
          <p className="admin-note">Current public state: <b>{siteSettings.portal_state || "invitation"}</b>. Auto switch remains active and uses the saved local date and time.</p>
          <div className="admin-form__grid"><Field label="Church direction URL"><input type="url" value={settingsForm.church_direction_url} onChange={(event) => setSettingsForm((current) => ({ ...current, church_direction_url: event.target.value }))} /></Field><Field label="Reception direction URL"><input type="url" value={settingsForm.reception_direction_url} onChange={(event) => setSettingsForm((current) => ({ ...current, reception_direction_url: event.target.value }))} /></Field></div>
          </> : null}
          {canAccess("programmes") ?
          <div className="programme-manager">{[{ key: "church", label: "Church programme", ref: churchProgrammeInput }, { key: "reception", label: "Reception programme", ref: receptionProgrammeInput }].map((programme) => { const url = siteSettings[`${programme.key}_programme_url`]; const isUploaded = url?.startsWith("/uploads/programmes/"); return <article key={programme.key}><div><span>{programme.label}</span><small>{isUploaded ? "PDF ready for guests" : "Using the programme page until a PDF is uploaded"}</small></div><input ref={programme.ref} type="file" accept="application/pdf,.pdf" onChange={(event) => uploadProgramme(programme.key, event)} /><div><Button onClick={() => programme.ref.current?.click()}>{uploading === `${programme.key}-programme` ? "Uploading..." : "Replace PDF"}</Button>{isUploaded ? <><a className="admin-button admin-button--quiet" href={`/programmes/${programme.key}`} target="_blank" rel="noreferrer">Preview</a><Button tone="danger" disabled={deletingProgramme === programme.key} onClick={() => requestConfirmation({ title: `Remove ${programme.label}?`, message: "Guests will no longer be able to open this uploaded PDF until another one is added.", confirmLabel: "Remove PDF", action: () => removeProgramme(programme.key) })}>{deletingProgramme === programme.key ? "Removing..." : "Remove"}</Button></> : null}</div></article>; })}</div>
          : null}
          {canAccess("site_settings") ? <><Button type="submit" disabled={savingSettings}>{savingSettings ? "Saving..." : "Save portal settings"}</Button>{settingsMessage ? <small className="admin-feedback">{settingsMessage}</small> : null}</> : null}
        </form>
      </Panel> : null}

      {canAccess("galleries") ? <Panel id="media" eyebrow="Files, not JSON" title="Media library" action={<span className="admin-count">{activeMedia.items.length} files</span>}>
        <div className="media-toolbar"><div className="media-tabs">{Object.entries(mediaSections).map(([key, section]) => <button key={key} type="button" className={mediaTab === key ? "is-active" : ""} onClick={() => { setMediaTab(key); setMediaVisible(MEDIA_PAGE_SIZE); }}>{section.label}</button>)}</div><div className="media-toolbar__actions"><label>Preview size<select value={mediaGrid} onChange={(event) => setMediaGrid(event.target.value)}><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="large">Large</option></select></label><Button onClick={() => activeMedia.ref.current?.click()}>{uploading === mediaTab ? "Uploading..." : "Upload files"}</Button><input ref={activeMedia.ref} type="file" accept={activeMedia.accept} onChange={(event) => uploadMedia(mediaTab, event)} /></div></div>
        <p className="admin-note">Files stay grouped by public gallery. Use the preview size control to manage large libraries without a long page.</p>
        <div className={`admin-media-grid admin-media-grid--${mediaGrid}`}>{visibleMedia.length ? visibleMedia.map((item) => { const fileName = item.downloadName || item.title || item.alt || "this uploaded file"; return <article key={item.src}><div className="admin-media-grid__preview">{mediaTab === "video" ? <video preload="metadata"><source src={item.src} /></video> : <img src={item.src} alt={item.alt || "Gallery file"} />}</div><div><span title={fileName}>{fileName}</span><Button tone="danger" disabled={deletingMedia === `${mediaTab}:${item.src}`} onClick={() => requestConfirmation({ title: "Delete gallery file?", message: `${fileName} will be removed from the admin library and the public gallery.`, confirmLabel: "Delete file", action: () => removeMedia(mediaTab, item.src) })}>{deletingMedia === `${mediaTab}:${item.src}` ? "Deleting..." : "Delete"}</Button></div></article>; }) : <p className="admin-empty">No files in this collection yet.</p>}</div>
        {mediaVisible < activeMedia.items.length ? <Button tone="quiet" onClick={() => setMediaVisible((count) => count + MEDIA_PAGE_SIZE)}>View more files</Button> : null}
      </Panel> : null}

      {canAccess("live_updates") ? <Panel id="updates" eyebrow="Public timeline" title="Live updates" action={<Button tone="quiet" onClick={refreshLiveUpdates}>Refresh</Button>}>
        <form className="admin-form" onSubmit={submitLiveUpdate}><div className="admin-form__grid"><Field label="Timeline"><select value={liveForm.context} onChange={(event) => setLiveForm((current) => ({ ...current, context: event.target.value }))}><option>Church</option><option>Reception</option><option>General</option></select></Field><Field label="Posted by"><input value={liveForm.author_name} onChange={(event) => setLiveForm((current) => ({ ...current, author_name: event.target.value }))} placeholder="Wedding team" /></Field></div><Field label="Update"><textarea value={liveForm.message} onChange={(event) => setLiveForm((current) => ({ ...current, message: event.target.value }))} placeholder="Share the latest moment with guests..." required rows="4" /></Field><Button type="submit" disabled={savingLive}>{savingLive ? "Posting..." : "Post live update"}</Button>{liveMessage ? <small className="admin-feedback">{liveMessage}</small> : null}</form>
        <div className="admin-live-list">{liveUpdates.length ? liveUpdates.map((update) => <article key={update.id}><div><span>{update.context}</span><time>{new Date(update.published_at).toLocaleString()}</time></div><p>{update.message}</p><small>{update.author_name || "Wedding team"}</small><Button tone="danger" disabled={deletingLive === update.id} onClick={() => requestConfirmation({ title: "Delete live update?", message: `This ${update.context.toLowerCase()} update will disappear from the public timeline.`, confirmLabel: "Delete post", action: () => deleteLiveUpdate(update.id) })}>{deletingLive === update.id ? "Deleting..." : "Delete post"}</Button></article>) : <p className="admin-empty">No live updates have been posted.</p>}</div>
      </Panel> : null}

      {canAccess("goodwill_messages") ? <Panel id="goodwill" eyebrow="Guest message book" title="Goodwill messages" action={<div className="admin-rsvp-actions"><span className="admin-count">{goodwillMessages.length} messages</span><Button tone="quiet" onClick={refreshGoodwillMessages}>Refresh</Button></div>}>
        <p className="admin-note">Guests add messages from the public Goodwill Messages page. Select a name to read the message, then delete it here if necessary.</p>
        <div className="admin-goodwill-list">
          {visibleGoodwillMessages.length ? visibleGoodwillMessages.map((entry) => {
            const isExpanded = expandedGoodwillId === entry.id;
            return <article className={`goodwill-entry${isExpanded ? " is-open" : ""}`} key={entry.id}><button type="button" className="goodwill-entry__trigger" aria-expanded={isExpanded} onClick={() => setExpandedGoodwillId(isExpanded ? null : entry.id)}><strong>{entry.name}</strong><span aria-hidden="true">{isExpanded ? "−" : "+"}</span></button>{isExpanded ? <div className="goodwill-entry__body"><div><p>{entry.message}</p><div className="admin-goodwill-entry__footer"><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time><Button tone="danger" disabled={deletingGoodwill === entry.id} onClick={() => requestConfirmation({ title: "Delete goodwill message?", message: `The message submitted by ${entry.name} will be permanently removed from the public message book.`, confirmLabel: "Delete message", action: () => deleteGoodwillMessage(entry.id) })}>{deletingGoodwill === entry.id ? "Deleting..." : "Delete message"}</Button></div></div></div> : null}</article>;
          }) : <p className="admin-empty">No goodwill messages have been submitted yet.</p>}
        </div>
        {goodwillVisible < goodwillMessages.length ? <Button tone="quiet" onClick={() => setGoodwillVisible((current) => current + GOODWILL_PAGE_SIZE)}>View more messages</Button> : null}
        {goodwillMessage ? <small className="admin-feedback">{goodwillMessage}</small> : null}
      </Panel> : null}

      {canAccess("support") ? <Panel id="support" eyebrow="Guest support" title="Support & gifts">
        <form className="admin-form" onSubmit={saveSupport}><Field label="Heading"><input value={supportDetail.heading} onChange={(event) => setSupportDetail((current) => ({ ...current, heading: event.target.value }))} /></Field><Field label="Guest note"><textarea rows="3" value={supportDetail.note} onChange={(event) => setSupportDetail((current) => ({ ...current, note: event.target.value }))} /></Field><div className="admin-account-grid">{[["Primary account", ""], ["Second account", "secondary_"]].map(([title, prefix]) => <fieldset key={prefix}><legend>{title}</legend><Field label="Bank name"><input value={supportDetail[`${prefix}bank_name`]} onChange={(event) => setSupportDetail((current) => ({ ...current, [`${prefix}bank_name`]: event.target.value }))} /></Field><Field label="Account name"><input value={supportDetail[`${prefix}account_name`]} onChange={(event) => setSupportDetail((current) => ({ ...current, [`${prefix}account_name`]: event.target.value }))} /></Field><Field label="Account number"><input value={supportDetail[`${prefix}account_number`]} onChange={(event) => setSupportDetail((current) => ({ ...current, [`${prefix}account_number`]: event.target.value }))} /></Field><Field label="Sort code"><input value={supportDetail[`${prefix}sort_code`]} onChange={(event) => setSupportDetail((current) => ({ ...current, [`${prefix}sort_code`]: event.target.value }))} /></Field></fieldset>)}</div><Button type="submit" disabled={savingSupport}>{savingSupport ? "Saving..." : "Save support details"}</Button>{supportMessage ? <small className="admin-feedback">{supportMessage}</small> : null}</form>
      </Panel> : null}

      {canAccess("planning_team") ? <Panel id="team" eyebrow="People behind the day" title="Planning team">
        <form className="admin-form" onSubmit={addContact}><div className="admin-form__grid admin-form__grid--four"><Field label="Name"><input value={contactForm.name} onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))} required /></Field><Field label="Role"><input value={contactForm.position} onChange={(event) => setContactForm((current) => ({ ...current, position: event.target.value }))} required /></Field><Field label="Phone"><input value={contactForm.phone} onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Order"><input type="number" value={contactForm.display_order} onChange={(event) => setContactForm((current) => ({ ...current, display_order: Number(event.target.value) }))} /></Field><Field label="Member photo"><input ref={contactPhotoInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={(event) => setContactPhoto(event.target.files?.[0] || null)} /></Field></div><p className="admin-note">A photo is optional. When added, it replaces the member's letter on the public Planning Team page.</p><Button type="submit" disabled={savingContact}>{savingContact ? "Adding..." : "Add contact"}</Button>{contactMessage ? <small className="admin-feedback">{contactMessage}</small> : null}</form>
        <div className="admin-contact-list">{contacts.length ? contacts.map((contact) => <article key={contact.id}><div className="admin-contact-list__summary"><div className="admin-contact-list__avatar">{contact.photo_url ? <img src={contact.photo_url} alt="" /> : contact.name?.trim().charAt(0) || "C"}</div><div className="admin-contact-list__details"><strong>{contact.name}</strong><span>{contact.position}</span><small>{contact.phone || "No phone provided"}</small></div><div className="admin-contact-list__actions"><Button tone="quiet" onClick={() => startContactEdit(contact)}>Edit</Button><Button tone="danger" onClick={() => requestConfirmation({ title: "Delete planning team member?", message: `${contact.name} and their public profile will be removed from the Planning Team page.`, confirmLabel: "Delete member", action: () => deleteContact(contact.id) })}>Delete</Button></div></div>{editingContactId === contact.id ? <form className="admin-contact-editor" onSubmit={updateContact}><div className="admin-form__grid admin-form__grid--four"><Field label="Name"><input value={editingContactForm.name} onChange={(event) => setEditingContactForm((current) => ({ ...current, name: event.target.value }))} required /></Field><Field label="Role"><input value={editingContactForm.position} onChange={(event) => setEditingContactForm((current) => ({ ...current, position: event.target.value }))} required /></Field><Field label="Phone"><input value={editingContactForm.phone} onChange={(event) => setEditingContactForm((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Order"><input type="number" value={editingContactForm.display_order} onChange={(event) => setEditingContactForm((current) => ({ ...current, display_order: Number(event.target.value) }))} /></Field><Field label="Replace photo"><input ref={editingContactPhotoInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={(event) => setEditingContactPhoto(event.target.files?.[0] || null)} /></Field></div><div className="admin-contact-editor__actions"><Button type="submit" disabled={savingContactEdit}>{savingContactEdit ? "Saving..." : "Save changes"}</Button><Button tone="quiet" onClick={cancelContactEdit}>Cancel</Button></div></form> : null}</article>) : <p className="admin-empty">No planning contacts yet.</p>}</div>
      </Panel> : null}

      {canAccess("rsvps") ? <Panel id="rsvps" eyebrow="Guest responses" title="RSVP dashboard" action={<div className="admin-rsvp-actions"><Button tone="quiet" onClick={refreshRsvps}>Refresh</Button><Button tone="quiet" disabled={!rsvps.length} onClick={() => { const rows = [["Name", "Email", "Attendance", "Guests", "Message"], ...rsvps.map((rsvp) => [rsvp.name, rsvp.email, rsvp.attendance, rsvp.guest_count, rsvp.message])]; const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([rows.map((row) => row.map((value) => `\"${String(value || "").replace(/\"/g, '\"\"')}\"`).join(",")).join("\n")], { type: "text/csv" })); link.download = "comfort-shammah-rsvps.csv"; link.click(); }}>Export CSV</Button></div>}>
        <div className="admin-rsvp-controls"><div>{["all", "attending", "not_attending"].map((filter) => <button key={filter} type="button" className={rsvpFilter === filter ? "is-active" : ""} onClick={() => setRsvpFilter(filter)}>{filter === "all" ? "All" : filter === "attending" ? "Attending" : "Not attending"}</button>)}</div><input placeholder="Search name or email" value={rsvpSearch} onChange={(event) => setRsvpSearch(event.target.value)} /></div>
        <div className="admin-rsvp-list">{filteredRsvps.length ? filteredRsvps.map((rsvp) => <article key={rsvp.id}><div><strong>{rsvp.name || "Guest"}</strong><span>{rsvp.email || "No email"}</span></div><span className={`admin-rsvp-status admin-rsvp-status--${rsvp.attendance}`}>{rsvp.attendance === "yes" ? "Attending" : "Not attending"}</span><small>{rsvp.guest_count || 0} guest{rsvp.guest_count === 1 ? "" : "s"}</small></article>) : <p className="admin-empty">No RSVPs match this view.</p>}</div>
      </Panel> : null}

      <Panel id="account" eyebrow="Personal security" title="Change my password">
        <p className="admin-note">Update the password for <b>{currentAdmin?.name}</b>. Your other signed-in devices will remain active.</p>
        <form className="admin-form admin-password-form" onSubmit={changeOwnPassword}>
          <div className="admin-form__grid admin-form__grid--three">
            <Field label="Current password"><input type="password" value={passwordForm.current_password} onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))} autoComplete="current-password" required /></Field>
            <Field label="New password"><input type="password" minLength="8" value={passwordForm.password} onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))} autoComplete="new-password" required /></Field>
            <Field label="Confirm new password"><input type="password" minLength="8" value={passwordForm.password_confirmation} onChange={(event) => setPasswordForm((current) => ({ ...current, password_confirmation: event.target.value }))} autoComplete="new-password" required /></Field>
          </div>
          <div className="admin-inline-actions"><Button type="submit" disabled={savingPassword}>{savingPassword ? "Updating..." : "Update my password"}</Button>{passwordMessage ? <small className="admin-feedback">{passwordMessage}</small> : null}</div>
        </form>
      </Panel>

      {currentAdmin?.super_admin ? <Panel id="admin-access" eyebrow="Primary admin controls" title="Admin accounts" action={<span className="admin-count">{adminUsers.length} accounts</span>}>
        <p className="admin-note">Create a separate login for each administrator and select only the responsibilities they should manage.</p>
        <form className="admin-access-create" onSubmit={createAdminAccount}>
          <div className="admin-form__grid admin-form__grid--three">
            <Field label="Admin name"><input value={newAdminForm.name} onChange={(event) => setNewAdminForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Gallery Manager" required /></Field>
            <Field label="Password"><input type="password" minLength="8" value={newAdminForm.password} onChange={(event) => setNewAdminForm((current) => ({ ...current, password: event.target.value }))} autoComplete="new-password" required /></Field>
            <Field label="Confirm password"><input type="password" minLength="8" value={newAdminForm.password_confirmation} onChange={(event) => setNewAdminForm((current) => ({ ...current, password_confirmation: event.target.value }))} autoComplete="new-password" required /></Field>
          </div>
          <fieldset className="admin-permissions"><legend>Responsibilities</legend><div>{Object.entries(availablePermissions).map(([permission, label]) => <label key={permission}><input type="checkbox" checked={newAdminForm.permissions.includes(permission)} onChange={() => toggleNewAdminPermission(permission)} /><span>{label}</span></label>)}</div></fieldset>
          <Button type="submit" disabled={savingAdmin === "new"}>{savingAdmin === "new" ? "Creating..." : "Create admin account"}</Button>
        </form>

        <div className="admin-user-list">
          {adminUsers.map((admin) => <article className={`admin-user-card${admin.active ? "" : " is-inactive"}`} key={admin.id}>
            <div className="admin-user-card__heading"><div><strong>{admin.name}</strong><span>{admin.super_admin ? "Primary admin · Full access" : admin.active ? "Additional admin" : "Access paused"}</span></div>{admin.super_admin ? <span className="admin-role-badge">Primary</span> : <label className="admin-active-toggle"><input type="checkbox" checked={admin.active} onChange={(event) => updateAdminDraft(admin.id, "active", event.target.checked)} /><span>Active</span></label>}</div>
            {admin.super_admin ? <p className="admin-note">This account manages passwords, additional administrators, and every dashboard section.</p> : <>
              <Field label="Admin name"><input value={admin.name} onChange={(event) => updateAdminDraft(admin.id, "name", event.target.value)} /></Field>
              <fieldset className="admin-permissions"><legend>Responsibilities</legend><div>{Object.entries(availablePermissions).map(([permission, label]) => <label key={permission}><input type="checkbox" checked={admin.permissions.includes(permission)} onChange={() => toggleAdminPermission(admin.id, permission)} /><span>{label}</span></label>)}</div></fieldset>
              <div className="admin-password-reset"><Field label="New password (optional)"><input type="password" minLength="8" value={admin.password || ""} onChange={(event) => updateAdminDraft(admin.id, "password", event.target.value)} autoComplete="new-password" /></Field><Field label="Confirm new password"><input type="password" minLength="8" value={admin.password_confirmation || ""} onChange={(event) => updateAdminDraft(admin.id, "password_confirmation", event.target.value)} autoComplete="new-password" /></Field></div>
              <div className="admin-user-card__actions"><Button onClick={() => saveAdminAccount(admin)} disabled={savingAdmin === admin.id}>{savingAdmin === admin.id ? "Saving..." : "Save access"}</Button><Button tone="danger" onClick={() => requestConfirmation({ title: "Delete admin account?", message: `${admin.name} will immediately lose access to the wedding admin portal.`, confirmLabel: "Delete account", action: () => deleteAdminAccount(admin) })}>Delete account</Button></div>
            </>}
          </article>)}
        </div>
        {adminAccessMessage ? <small className="admin-feedback">{adminAccessMessage}</small> : null}
      </Panel> : null}
    </div>
    <ConfirmationDialog dialog={confirmation} busy={confirmingAction} onCancel={() => setConfirmation(null)} onConfirm={runConfirmedAction} />
  </main>;
}
