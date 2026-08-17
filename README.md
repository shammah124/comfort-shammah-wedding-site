# Comfort & Shammah Digital Wedding Site

Premium wedding site built with Ruby on Rails 8 and React 19.
It keeps the original invitation experience intact and adds a main wedding launcher with downloads, galleries, live updates, support details, contacts, music, offline support, and an admin dashboard.

## Open the site

- `http://localhost:3000` for the main wedding portal
- `http://localhost:3000/?portal=main` to force the main wedding launcher
- `http://localhost:3000/?portal=invite` for the original invitation
- `http://localhost:3000/admin` for the dashboard

If you are seeing the fallback `Page not found` screen, start the Rails app first and then open one of the links above.

## Setup

```bash
bin/setup
```

## Run locally

```bash
bin/rails server -p 3000
```

Optional watch commands:

```bash
yarn build --watch
yarn build:css --watch
```

## Included features

- Invitation portal preserved as a separate experience
- Main launcher-style wedding home page
- Church and reception programme downloads
- Wedding and pre-wedding galleries with local downloads
- Live wedding updates feed
- Support and gifting details
- Planning committee and developer contacts
- Background music with mute control
- Offline-friendly PWA support
- Secure admin dashboard
