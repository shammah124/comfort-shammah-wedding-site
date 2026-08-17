import React, { useCallback, useEffect, useRef, useState } from "react";

const MEDIA_PAGE_SIZE = 24;

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
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);
  const [settingsForm, setSettingsForm] = useState({
    portal_mode: initialSiteSettings.portal_mode || "auto",
    switch_at: initialSiteSettings.switch_at?.slice(0, 16) || "",
    church_direction_url: initialSiteSettings.church_direction_url || "",
    reception_direction_url: initialSiteSettings.reception_direction_url || "",
  });
  const [settingsMessage, setSettingsMessage] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploading, setUploading] = useState("");
  const [deletingMedia, setDeletingMedia] = useState("");
  const [deletingProgramme, setDeletingProgramme] = useState("");
  const [mediaTab, setMediaTab] = useState("wedding");
  const [mediaGrid, setMediaGrid] = useState("comfortable");
  const [mediaVisible, setMediaVisible] = useState(MEDIA_PAGE_SIZE);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [liveForm, setLiveForm] = useState({ context: "Church", author_name: "", message: "" });
  const [liveMessage, setLiveMessage] = useState("");
  const [savingLive, setSavingLive] = useState(false);
  const [deletingLive, setDeletingLive] = useState(null);
  const [supportDetail, setSupportDetail] = useState(supportDefaults());
  const [supportMessage, setSupportMessage] = useState("");
  const [savingSupport, setSavingSupport] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: "", position: "", phone: "", display_order: 0 });
  const [contactPhoto, setContactPhoto] = useState(null);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingContactForm, setEditingContactForm] = useState({ name: "", position: "", phone: "", display_order: 0 });
  const [editingContactPhoto, setEditingContactPhoto] = useState(null);
  const [savingContactEdit, setSavingContactEdit] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState({ total: 0, attending: 0, not_attending: 0, total_guests: 0 });
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [rsvpSearch, setRsvpSearch] = useState("");
  const weddingInput = useRef(null);
  const preweddingInput = useRef(null);
  const videoInput = useRef(null);
  const churchProgrammeInput = useRef(null);
  const receptionProgrammeInput = useRef(null);
  const contactPhotoInput = useRef(null);
  const editingContactPhotoInput = useRef(null);

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

  useEffect(() => {
    fetch("/api/session")
      .then(readJson)
      .then(({ ok, data }) => setAuthed(Boolean(ok && data.signed_in)))
      .catch(() => setAuthed(false))
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!authed) return;
    Promise.all([refreshSettings(), refreshLiveUpdates(), refreshSupport(), refreshContacts(), refreshRsvps()]).catch(() => {});
  }, [authed, refreshContacts, refreshLiveUpdates, refreshRsvps, refreshSettings, refreshSupport]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    const { ok, data } = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).then(readJson);
    if (!ok || !data.success) {
      setLoginError(data.errors?.join(", ") || "Incorrect password. Try again.");
      setPassword("");
      return;
    }
    setAuthed(true);
  }

  async function handleLogout() {
    await fetch("/api/session", { method: "DELETE" });
    setAuthed(false);
    setPassword("");
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
      setSettingsMessage(error.message);
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
      setSettingsMessage(error.message);
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
      setSettingsMessage(error.message);
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
      setSettingsMessage(error.message);
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
      setSettingsMessage(error.message);
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
      setLiveMessage(error.message);
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
      setLiveMessage(error.message);
    } finally {
      setDeletingLive(null);
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
      setSupportMessage(error.message);
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
      setContactMessage(error.message);
    } finally {
      setSavingContact(false);
    }
  }

  async function deleteContact(id) {
    const { ok, data } = await fetch(`/api/planning_contacts/${id}`, { method: "DELETE" }).then(readJson);
    if (!ok || !data.success) {
      setContactMessage("Could not delete this contact.");
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
      setContactMessage(error.message);
    } finally {
      setSavingContactEdit(false);
    }
  }

  if (!authReady) return <main className="admin-auth"><p>Opening wedding admin...</p></main>;

  if (!authed) {
    return <main className="admin-auth"><form className="admin-login" onSubmit={handleLogin}>
      <img src={weddingLogo} alt="Comfort and Shammah wedding logo" />
      <p>Comfort &amp; Shammah · 2026</p><h1>Wedding Admin</h1><span>Private wedding workspace</span>
      <Field label="Admin password"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus /></Field>
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
  const filteredRsvps = rsvps.filter((rsvp) => (rsvpFilter === "all" || (rsvpFilter === "attending" ? rsvp.attendance === "yes" : rsvp.attendance === "no")) && `${rsvp.name || ""} ${rsvp.email || ""}`.toLowerCase().includes(rsvpSearch.toLowerCase()));

  return <main className="admin-app">
    <header className="admin-hero">
      <div className="admin-hero__brand"><img src={weddingLogo} alt="Comfort and Shammah wedding logo" /><div><p>Comfort &amp; Shammah · October 17, 2026</p><h1>Wedding Admin</h1></div></div>
      <div className="admin-hero__actions"><a className="admin-button admin-button--quiet" href="/?portal=main" target="_blank" rel="noreferrer">View public site</a><Button tone="quiet" onClick={handleLogout}>Log out</Button></div>
    </header>
    <nav className="admin-nav" aria-label="Dashboard sections"><a href="#portal">Portal</a><a href="#media">Media library</a><a href="#updates">Live updates</a><a href="#support">Support &amp; gifts</a><a href="#team">Planning team</a><a href="#rsvps">RSVPs</a></nav>
    <div className="admin-content">
      <section className="admin-stats">
        <article><strong>{stats.total || 0}</strong><span>Total RSVPs</span></article><article><strong>{stats.attending || 0}</strong><span>Attending</span></article><article><strong>{stats.not_attending || 0}</strong><span>Not attending</span></article><article><strong>{stats.total_guests || 0}</strong><span>Total guests</span></article>
      </section>

      <Panel id="portal" eyebrow="Guest experience" title="Portal & programmes">
        <form className="admin-form" onSubmit={saveSettings}>
          <div className="admin-form__grid"><Field label="Visitor mode"><select value={settingsForm.portal_mode} onChange={(event) => setSettingsForm((current) => ({ ...current, portal_mode: event.target.value }))}><option value="auto">Auto switch by time</option><option value="invitation">Always show invitation</option><option value="main">Always show main portal</option></select></Field><Field label="Switch time"><input type="datetime-local" value={settingsForm.switch_at} onChange={(event) => setSettingsForm((current) => ({ ...current, switch_at: event.target.value }))} disabled={settingsForm.portal_mode !== "auto"} /></Field></div>
          <p className="admin-note">Current public state: <b>{siteSettings.portal_state || "invitation"}</b>. Auto switch remains active and uses the saved local date and time.</p>
          <div className="admin-form__grid"><Field label="Church direction URL"><input type="url" value={settingsForm.church_direction_url} onChange={(event) => setSettingsForm((current) => ({ ...current, church_direction_url: event.target.value }))} /></Field><Field label="Reception direction URL"><input type="url" value={settingsForm.reception_direction_url} onChange={(event) => setSettingsForm((current) => ({ ...current, reception_direction_url: event.target.value }))} /></Field></div>
          <div className="programme-manager">{[{ key: "church", label: "Church programme", ref: churchProgrammeInput }, { key: "reception", label: "Reception programme", ref: receptionProgrammeInput }].map((programme) => { const url = siteSettings[`${programme.key}_programme_url`]; const isUploaded = url?.startsWith("/uploads/programmes/"); return <article key={programme.key}><div><span>{programme.label}</span><small>{isUploaded ? "PDF ready for guests" : "Using the programme page until a PDF is uploaded"}</small></div><input ref={programme.ref} type="file" accept="application/pdf,.pdf" onChange={(event) => uploadProgramme(programme.key, event)} /><div><Button onClick={() => programme.ref.current?.click()}>{uploading === `${programme.key}-programme` ? "Uploading..." : "Replace PDF"}</Button>{isUploaded ? <><a className="admin-button admin-button--quiet" href={`/programmes/${programme.key}`} target="_blank" rel="noreferrer">Preview</a><Button tone="danger" disabled={deletingProgramme === programme.key} onClick={() => removeProgramme(programme.key)}>{deletingProgramme === programme.key ? "Removing..." : "Remove"}</Button></> : null}</div></article>; })}</div>
          <Button type="submit" disabled={savingSettings}>{savingSettings ? "Saving..." : "Save portal settings"}</Button>{settingsMessage ? <small className="admin-feedback">{settingsMessage}</small> : null}
        </form>
      </Panel>

      <Panel id="media" eyebrow="Files, not JSON" title="Media library" action={<span className="admin-count">{activeMedia.items.length} files</span>}>
        <div className="media-toolbar"><div className="media-tabs">{Object.entries(mediaSections).map(([key, section]) => <button key={key} type="button" className={mediaTab === key ? "is-active" : ""} onClick={() => { setMediaTab(key); setMediaVisible(MEDIA_PAGE_SIZE); }}>{section.label}</button>)}</div><div className="media-toolbar__actions"><label>Preview size<select value={mediaGrid} onChange={(event) => setMediaGrid(event.target.value)}><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="large">Large</option></select></label><Button onClick={() => activeMedia.ref.current?.click()}>{uploading === mediaTab ? "Uploading..." : "Upload files"}</Button><input ref={activeMedia.ref} type="file" accept={activeMedia.accept} onChange={(event) => uploadMedia(mediaTab, event)} /></div></div>
        <p className="admin-note">Files stay grouped by public gallery. Use the preview size control to manage large libraries without a long page.</p>
        <div className={`admin-media-grid admin-media-grid--${mediaGrid}`}>{visibleMedia.length ? visibleMedia.map((item) => <article key={item.src}><div className="admin-media-grid__preview">{mediaTab === "video" ? <video preload="metadata"><source src={item.src} /></video> : <img src={item.src} alt={item.alt || "Gallery file"} />}</div><div><span title={item.downloadName || item.title || item.alt}>{item.downloadName || item.title || item.alt || "Uploaded file"}</span><Button tone="danger" disabled={deletingMedia === `${mediaTab}:${item.src}`} onClick={() => removeMedia(mediaTab, item.src)}>{deletingMedia === `${mediaTab}:${item.src}` ? "Deleting..." : "Delete"}</Button></div></article>) : <p className="admin-empty">No files in this collection yet.</p>}</div>
        {mediaVisible < activeMedia.items.length ? <Button tone="quiet" onClick={() => setMediaVisible((count) => count + MEDIA_PAGE_SIZE)}>View more files</Button> : null}
      </Panel>

      <Panel id="updates" eyebrow="Public timeline" title="Live updates" action={<Button tone="quiet" onClick={refreshLiveUpdates}>Refresh</Button>}>
        <form className="admin-form" onSubmit={submitLiveUpdate}><div className="admin-form__grid"><Field label="Timeline"><select value={liveForm.context} onChange={(event) => setLiveForm((current) => ({ ...current, context: event.target.value }))}><option>Church</option><option>Reception</option><option>General</option></select></Field><Field label="Posted by"><input value={liveForm.author_name} onChange={(event) => setLiveForm((current) => ({ ...current, author_name: event.target.value }))} placeholder="Wedding team" /></Field></div><Field label="Update"><textarea value={liveForm.message} onChange={(event) => setLiveForm((current) => ({ ...current, message: event.target.value }))} placeholder="Share the latest moment with guests..." required rows="4" /></Field><Button type="submit" disabled={savingLive}>{savingLive ? "Posting..." : "Post live update"}</Button>{liveMessage ? <small className="admin-feedback">{liveMessage}</small> : null}</form>
        <div className="admin-live-list">{liveUpdates.length ? liveUpdates.map((update) => <article key={update.id}><div><span>{update.context}</span><time>{new Date(update.published_at).toLocaleString()}</time></div><p>{update.message}</p><small>{update.author_name || "Wedding team"}</small><Button tone="danger" disabled={deletingLive === update.id} onClick={() => deleteLiveUpdate(update.id)}>{deletingLive === update.id ? "Deleting..." : "Delete post"}</Button></article>) : <p className="admin-empty">No live updates have been posted.</p>}</div>
      </Panel>

      <Panel id="support" eyebrow="Guest support" title="Support & gifts">
        <form className="admin-form" onSubmit={saveSupport}><Field label="Heading"><input value={supportDetail.heading} onChange={(event) => setSupportDetail((current) => ({ ...current, heading: event.target.value }))} /></Field><Field label="Guest note"><textarea rows="3" value={supportDetail.note} onChange={(event) => setSupportDetail((current) => ({ ...current, note: event.target.value }))} /></Field><div className="admin-account-grid">{[["Primary account", ""], ["Second account", "secondary_"]].map(([title, prefix]) => <fieldset key={prefix}><legend>{title}</legend><Field label="Bank name"><input value={supportDetail[`${prefix}bank_name`]} onChange={(event) => setSupportDetail((current) => ({ ...current, [`${prefix}bank_name`]: event.target.value }))} /></Field><Field label="Account name"><input value={supportDetail[`${prefix}account_name`]} onChange={(event) => setSupportDetail((current) => ({ ...current, [`${prefix}account_name`]: event.target.value }))} /></Field><Field label="Account number"><input value={supportDetail[`${prefix}account_number`]} onChange={(event) => setSupportDetail((current) => ({ ...current, [`${prefix}account_number`]: event.target.value }))} /></Field><Field label="Sort code"><input value={supportDetail[`${prefix}sort_code`]} onChange={(event) => setSupportDetail((current) => ({ ...current, [`${prefix}sort_code`]: event.target.value }))} /></Field></fieldset>)}</div><Button type="submit" disabled={savingSupport}>{savingSupport ? "Saving..." : "Save support details"}</Button>{supportMessage ? <small className="admin-feedback">{supportMessage}</small> : null}</form>
      </Panel>

      <Panel id="team" eyebrow="People behind the day" title="Planning team">
        <form className="admin-form" onSubmit={addContact}><div className="admin-form__grid admin-form__grid--four"><Field label="Name"><input value={contactForm.name} onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))} required /></Field><Field label="Role"><input value={contactForm.position} onChange={(event) => setContactForm((current) => ({ ...current, position: event.target.value }))} required /></Field><Field label="Phone"><input value={contactForm.phone} onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Order"><input type="number" value={contactForm.display_order} onChange={(event) => setContactForm((current) => ({ ...current, display_order: Number(event.target.value) }))} /></Field><Field label="Member photo"><input ref={contactPhotoInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={(event) => setContactPhoto(event.target.files?.[0] || null)} /></Field></div><p className="admin-note">A photo is optional. When added, it replaces the member's letter on the public Planning Team page.</p><Button type="submit" disabled={savingContact}>{savingContact ? "Adding..." : "Add contact"}</Button>{contactMessage ? <small className="admin-feedback">{contactMessage}</small> : null}</form>
        <div className="admin-contact-list">{contacts.length ? contacts.map((contact) => <article key={contact.id}><div className="admin-contact-list__summary"><div className="admin-contact-list__avatar">{contact.photo_url ? <img src={contact.photo_url} alt="" /> : contact.name?.trim().charAt(0) || "C"}</div><div className="admin-contact-list__details"><strong>{contact.name}</strong><span>{contact.position}</span><small>{contact.phone || "No phone provided"}</small></div><div className="admin-contact-list__actions"><Button tone="quiet" onClick={() => startContactEdit(contact)}>Edit</Button><Button tone="danger" onClick={() => deleteContact(contact.id)}>Delete</Button></div></div>{editingContactId === contact.id ? <form className="admin-contact-editor" onSubmit={updateContact}><div className="admin-form__grid admin-form__grid--four"><Field label="Name"><input value={editingContactForm.name} onChange={(event) => setEditingContactForm((current) => ({ ...current, name: event.target.value }))} required /></Field><Field label="Role"><input value={editingContactForm.position} onChange={(event) => setEditingContactForm((current) => ({ ...current, position: event.target.value }))} required /></Field><Field label="Phone"><input value={editingContactForm.phone} onChange={(event) => setEditingContactForm((current) => ({ ...current, phone: event.target.value }))} /></Field><Field label="Order"><input type="number" value={editingContactForm.display_order} onChange={(event) => setEditingContactForm((current) => ({ ...current, display_order: Number(event.target.value) }))} /></Field><Field label="Replace photo"><input ref={editingContactPhotoInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={(event) => setEditingContactPhoto(event.target.files?.[0] || null)} /></Field></div><div className="admin-contact-editor__actions"><Button type="submit" disabled={savingContactEdit}>{savingContactEdit ? "Saving..." : "Save changes"}</Button><Button tone="quiet" onClick={cancelContactEdit}>Cancel</Button></div></form> : null}</article>) : <p className="admin-empty">No planning contacts yet.</p>}</div>
      </Panel>

      <Panel id="rsvps" eyebrow="Guest responses" title="RSVP dashboard" action={<div className="admin-rsvp-actions"><Button tone="quiet" onClick={refreshRsvps}>Refresh</Button><Button tone="quiet" disabled={!rsvps.length} onClick={() => { const rows = [["Name", "Email", "Attendance", "Guests", "Message"], ...rsvps.map((rsvp) => [rsvp.name, rsvp.email, rsvp.attendance, rsvp.guest_count, rsvp.message])]; const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([rows.map((row) => row.map((value) => `\"${String(value || "").replace(/\"/g, '\"\"')}\"`).join(",")).join("\n")], { type: "text/csv" })); link.download = "comfort-shammah-rsvps.csv"; link.click(); }}>Export CSV</Button></div>}>
        <div className="admin-rsvp-controls"><div>{["all", "attending", "not_attending"].map((filter) => <button key={filter} type="button" className={rsvpFilter === filter ? "is-active" : ""} onClick={() => setRsvpFilter(filter)}>{filter === "all" ? "All" : filter === "attending" ? "Attending" : "Not attending"}</button>)}</div><input placeholder="Search name or email" value={rsvpSearch} onChange={(event) => setRsvpSearch(event.target.value)} /></div>
        <div className="admin-rsvp-list">{filteredRsvps.length ? filteredRsvps.map((rsvp) => <article key={rsvp.id}><div><strong>{rsvp.name || "Guest"}</strong><span>{rsvp.email || "No email"}</span></div><span className={`admin-rsvp-status admin-rsvp-status--${rsvp.attendance}`}>{rsvp.attendance === "yes" ? "Attending" : "Not attending"}</span><small>{rsvp.guest_count || 0} guest{rsvp.guest_count === 1 ? "" : "s"}</small></article>) : <p className="admin-empty">No RSVPs match this view.</p>}</div>
      </Panel>
    </div>
  </main>;
}
