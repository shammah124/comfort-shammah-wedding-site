# Project Tracker

Project: Comfort & Shammah Digital Wedding Site

Renamed folder:
- From `digital_wedding_invite-main`
- To `comfort-shammah-wedding-site`

Working rules from the master prompt:
- Keep the invitation site content untouched
- Build the main wedding site as a premium, mobile-first experience
- Support a timed switch from invitation portal to main wedding portal
- Make the folder and file structure easy to understand
- Keep the admin side secure and editable

Current status:
- [x] Project folder renamed to a clearer name
- [x] Tracker file created
- [ ] Preserve the existing invitation experience exactly as-is
- [x] Add switch-time controls for invitation-to-main-site testing
- [x] Build the main wedding launcher-style landing page
- [x] Add church and reception programme downloads
- [x] Add public and pre-wedding galleries with download support
- [x] Add live wedding updates feed
- [x] Add guest goodwill messages with admin moderation
- [x] Add support and gifting details
- [x] Add planning committee and developer contacts
- [x] Add background music with mute control
- [x] Add offline-friendly PWA support if practical
- [x] Add elegant 404 page
- [x] Build secure admin dashboard for content management

Notes:
- The master prompt also asks for responsive design, performance, accessibility, SEO, and maintainability.
- The invitation site already has a working wedding-invite experience, so future changes should extend the project rather than replace that content.
- `bin/setup` now installs dependencies and compiles the frontend assets so the app starts more reliably after a fresh install.
- The gallery now uses local `/gallery/*.svg` assets so downloads work without external hosting.
- The site favicon now uses a round-cropped version of the provided `My Wedding Logo.png`, and launcher tiles use emoji glyphs again.
- The main launcher now uses the day palette, larger equal-height cards, and softer motion styling.
- The launcher hero now uses the original `My Wedding Logo.png` in a round badge.
- `Wedding launcher` was replaced with `Welcome To CoSh2026`.
- Card shine was softened with warmer cream tones and calmer text colors for better blending.
- Feature cards are now simplified to emoji and title only, with a cleaner centered layout.
- The admin login screen now uses the round wedding logo badge too.
- Admin settings now include upload buttons for gallery JSON files and delete buttons for live updates.
- Gallery admin now uses real file uploads with live previews and delete buttons for images/videos.
- Public video gallery now reads the saved uploaded media instead of a fixed placeholder list.
- Public launcher now refreshes site settings from the API on load so admin changes appear in the public view.
- Public feature cards now open their own browser tab, while still loading the current admin-managed content there.
- Launcher cards are simplified to equal-sized emoji-and-title tiles with a calmer matte finish on an olive, burgundy, and champagne backdrop.
- Main launcher visual system rebuilt around the invitation's premium typography, spacing, ornamental details, and gentle motion.
- Launcher now uses a champagne-gold canvas with olive-green depth, a reduced hero heading, and the circular crop of the supplied wedding logo.
- Launcher palette refined to an off-white canvas and deep burgundy hero, with champagne-gold and dusty-pink used only as subtle supporting accents.
- Hero eyebrow now preserves the intended `CoSh2026` casing and includes a slow, low-contrast champagne glint animation across its inner frame.
- Launcher feature cards now use a consistent, lightweight outline icon set instead of multi-colour emoji glyphs.
- Removed the coloured shadows behind launcher icons for a cleaner, flatter card appearance.
- Removed the remaining radial colour glow and tinted fill behind each launcher icon.
- Programme cards now prompt guests to open or download the latest admin-uploaded PDF, while the PDF itself opens in the browser's native viewer.
- Saving portal settings now preserves the programme, directions, gallery, and video values in the admin form.
- Wedding and pre-wedding galleries now use refined uniform photo-card grids with view, full-screen, and download actions.
- Video gallery now uses a distinct cinematic 16:9 grid with view and download actions, using the same launcher visual language.
- Gallery heroes now contain only `Comfort & Shammah · 2026` and the relevant gallery title.
- Gallery tiles now show only the media itself; visitors select a file to view/watch or download it.
- Galleries initially render 20 media files and reveal each following group with `View more` for scalable browsing.
- Live Updates now uses the same compact hero and launcher-inspired visual system, with separate connected timelines for Church, Reception, and General posts.
- Every live post now shows its publisher and precise published date/time so guests can follow the day as updates arrive.
- Support and Gifts now uses the same compact hero and a refined responsive account-details card.
- Planning Team now uses the compact gallery-style hero and responsive contact cards with direct phone links.
- WhatsApp has been removed from planning-contact forms, public cards, API parameters, and the database through a migration.
- Completed a public-only mobile-first review across the invitation, launcher, programmes, galleries, live updates, gifts, and Planning Team.
- Improved phone touch targets, safe-area spacing, narrow-screen density, lightbox controls, RSVP spacing, maps, and the browser PDF view without changing the admin experience.
- Rebuilt the admin portal into a launcher-inspired wedding workspace with burgundy, champagne, and ivory styling, section navigation, and correct Comfort & Shammah 2026 branding.
- Admin sessions now survive refreshes until the administrator explicitly logs out, and live updates can now be deleted through the restored delete route.
- Added a second support-and-gifts account, including public display of either or both accounts.
- Replaced the long gallery management area with a tabbed media library, adjustable preview size, grouped uploads, compact previews, deletion, and progressive file loading.
- Programme PDFs now have clear replace, preview, and remove actions; saved church and reception direction URLs also power the public launcher links.
- Support/Gifts now visibly reserves the second account section in the public view, with its saved details displayed immediately once entered in admin.
- Further refined the new admin portal for phones: no iOS input zoom, scrollable section navigation, full-width actions, compact media controls, and safe RSVP/live-update cards.
- Admin login and dashboard now use the Rails-served `My Wedding Logo.png` asset, preserving the same round crop as the public portal.
- Support account responses now explicitly include every primary and second-account field; the admin form rechecks the saved record before confirming that both accounts are ready for guests.
- Planning Team contacts now support an optional member-photo upload; uploaded circular portraits replace the letter avatar on the public Planning Team cards.
- Hardened Planning Team photo uploads with pre-save validation and clear admin messages instead of JSON parsing errors when a file cannot be accepted.
- Planning Team API requests now refresh an outdated model schema cache automatically after the photo-field migration, avoiding `undefined method 'photo_url'` errors from an already-running development server.
- Enlarged public Planning Team portraits to a balanced medium size, with a slightly smaller responsive crop for phones.
- Split and minified the frontend into route-level invitation, public launcher, and admin chunks so visitors download only the experience they open; generated chunks use Propshaft's `.digested` convention for reliable local and deployed serving.
- Restored the saved portal-switch behavior: the admin's visitor mode now controls the normal home page, while `?portal=main` and `?portal=invite` remain useful direct-preview links.
- Programme links now use stable Rails viewer and download routes rather than dated upload filenames; stale saved programme paths self-repair to the newest matching uploaded PDF.
- Planning Team members can now be edited directly in the admin portal, including their name, role, phone, display order, and optional replacement profile photo.
- Organized the supplied wedding media into permanent programme-source, public gallery, video, programme, and Planning Team locations; linked the new pre-wedding gallery and video records, then removed the verified empty source folder.
- Updated the live invitation portal with one-click envelope opening, the revised reception and departure schedule, the corrected Comfort and Shammah love-story milestones, and complete removal of the invitation gallery section.
- Prepared production deployment: strengthened ignored local files, added PostgreSQL production configuration, added Cloudflare R2-backed admin media uploads with local fallback, and documented the GitHub-to-hosting launch process.
- Routed public programme, gallery image, and video downloads through attachment responses so downloads stay direct on mobile and desktop, including Cloudflare R2 media.
- Prevented GitHub deployment uploads from including the nested standalone invitation copy, local bundled dependencies, editor metadata, or Mac metadata while retaining the safe `.env.example` deployment template.
- Added a public Goodwill Messages feature with a styled name-and-message form, expandable sender-name message book, and 15-at-a-time browsing; the admin dashboard now mirrors the expandable message view and can permanently delete submissions.
- Refined Goodwill Messages with professional individual-or-organisation naming, a visible message-book scroll cue, and a one-at-a-time accordion that stays closed by default; replaced native browser confirmations with styled admin dialogs for every destructive action and redesigned the global loading screen around the round wedding logo.
- Rebuilt the loading experience as a clean ivory-and-burgundy wedding card with the round logo, event details, and a restrained champagne progress animation; replaced the stale cache-first service worker with versioned network-first app/API loading, immediate worker activation, and automatic refresh so future interface updates appear without old cached screens.
- Removed the main portal's second-stage lazy-loading request so the public home and feature pages render immediately after the primary bundle loads, while invitation and admin code remain separately split.
- Standardized transient task feedback: public and admin success confirmations now clear after two seconds, while actionable error messages remain visible for five seconds.
- Replaced the single shared admin password with secure individual admin accounts: the primary admin can create, edit, pause, reset, or delete additional accounts and assign section-specific responsibilities, while every administrator can update their own password.
