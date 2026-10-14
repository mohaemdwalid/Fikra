# FIKRA Agency — current website

The website entry point is `index.html`. It includes English/Arabic content, the Shopify offer, a moving client-logo strip, client reviews, seven stacked showcase videos, a pre-booking questionnaire and the supplied HubSpot calendar embed.

## Preview

Run `python3 server.py`, then open http://127.0.0.1:5184. No frontend build is required. The calendar now uses HubSpot; the local SQLite booking implementation remains in the repository for reference but is not the active website booking flow.

## Cloudflare Pages upload

```sh
python3 -m pip install -r requirements.txt
python3 prepare_cloudflare.py
```

Upload the generated `fikra-cloudflare-upload.zip` through Cloudflare Pages Direct Upload. For a Git-connected Pages deployment, install the requirements and run `python3 prepare_cloudflare.py` as the build command, with `cloudflare-upload` as the output directory. Deploy only that public output folder.

The output contains `index.html` and public assets. Database files, local backups, the original large source recording and generated upload artifacts are excluded from Git. All shipped videos are below Cloudflare Pages' 25 MiB per-file limit.

The HubSpot calendar is `https://meetings-eu1.hubspot.com/fikra-agency`. The website questionnaire shows a copyable summary; its answers are **not automatically saved to HubSpot**. Calendar availability, account calendar connections and actual confirmation delivery are configured in HubSpot and still require owner verification. No test appointment has been submitted to HubSpot.

The VSL area and offer values still need the owner's final content. The restored original footer contains reference material that should be reviewed before public launch.

The following notes document earlier local implementations and may describe sections since replaced.

---

# FIKRA Shopify website

A local website based on the supplied HTML design, with FIKRA logos, Shopify service copy, Instagram enquiries, a custom booking calendar, and an English/Arabic switcher.

## Run locally

```sh
python3 server.py
```

Open http://127.0.0.1:5184. Python 3.9+ is required; there are no third-party Python dependencies or build steps. The booking API requires this server. A plain static server can display the design but cannot save appointments.

## Booking calendar

Availability is **every day, 10:00–15:00, Asia/Qatar**, as requested. The initial call duration is **30 minutes**. The last start time is 14:30 so the meeting finishes by 15:00. A 60-minute minimum notice and 60-day booking window are configured as initial defaults.

Edit `booking-config.json` to change these settings. Working days use Sunday=0 through Saturday=6. Disable `enabled` to pause new bookings. The frontend currently displays a 60-day window and the agreed hours; update `assets/booking.js` and the booking section in `index.html` if those settings change.

- `GET /api/availability?date=YYYY-MM-DD` returns available slots without client details.
- `POST /api/bookings` validates client details and saves a reservation.
- `.data/bookings.sqlite3` persists reservations. A unique slot constraint prevents simultaneous duplicate bookings.
- The confirmation screen provides an `.ics` appointment download.

View and cancel bookings locally:

```sh
python3 manage_bookings.py list
python3 manage_bookings.py cancel BOOKING_ID
```

A confirmation reserves time in this website database. Email delivery, owner notifications, video meeting creation and external calendar synchronisation are not connected. Personal calendar events will not block these slots automatically. Back up the database when moving or deploying the site; do not commit or publish it. The server excludes database files, configuration, source backups and owner management commands from HTTP serving. It also checks submission origins and applies a basic request rate limit.

## English and Arabic

The language switch translates the main copy, navigation, enquiry dialog, booking calendar, form and confirmation. It applies RTL layout and remembers the language in this browser. Arabic uses self-hosted **IBM Plex Sans Arabic**, with regular and semibold fonts and their licence under `assets/fonts/`.

Translations live in `assets/i18n.js`. Reference testimonials, case-study excerpts, image text and some third-party material remain in their source language. Replace them with approved FIKRA content in both languages before launch.

## Files

- `index.html`: page layout, retained design interactions and booking markup.
- `assets/site.css`: FIKRA styling, Arabic typography, RTL overrides and booking layout.
- `assets/site.js`: enquiry dialog and newsletter handling.
- `assets/site-config.js`: Instagram and optional contact destinations.
- `assets/i18n.js`: translations and language persistence.
- `assets/booking.js`: date/time selection, booking submission and calendar export.
- `server.py`: local HTTP server, availability rules and SQLite reservations.
- `booking-config.json`: availability settings.
- `manage_bookings.py`: owner-only local booking commands.
- `assets/vendor/`: local copies of the original stylesheet and nine runtime scripts.
- `backups/design-original.html`: unchanged original design, excluded from HTTP serving.

## Source analysis

The original was a roughly 2.3 MB Webflow export of ConversionWise, with 98 script elements, missing secondary pages, third-party analytics and booking forms, a hosted newsletter form and another business's WhatsApp details. Removed 69 identical duplicate inline scripts, the original analytics and booking tracking, hosted review widget, Typeform switcher, duplicate entry loaders and WhatsApp modal.

Core styles and scripts are local. Photos, remaining videos and original fonts still use external hosts; the site is not fully offline. The blocked reference hero video was replaced with a local Shopify introduction panel. The supplied FIKRA PNG is unchanged and displayed in cropped CSS viewports in the header and footer.

Service, work, about, FAQ and review navigation scrolls to homepage sections. Main project CTAs scroll to the booking calendar. Service enquiry buttons and the contact icon open the Instagram dialog for @fikraagency.qa. Unbuilt secondary pages show a pending-page message. Newsletter signup never claims to save a subscriber without a configured destination.

## Verification

```sh
python3 -m unittest discover -s tests -v
```

Backend tests cover daily opening hours, persistent reservations, simultaneous duplicate attempts, invalid email, closed times, past dates and disabled availability. Local Chrome checks verified a complete Arabic booking, slot removal after reservation, confirmation and calendar-download link, saved language choice, English restoration, and desktop/mobile RTL layouts without horizontal overflow or JavaScript errors. The test reservation was cancelled after checking. These are local browser checks, not physical-device or live-hosting checks.

## Before publication

The design still contains reference testimonials, results, client logos, case studies, founder information, legal text and some social/reference links from ConversionWise. These are not verified FIKRA claims. Replace them with approved content, implement the secondary pages, add a genuine privacy policy explaining the stored booking details, connect owner notifications, and deploy the Python server with persistent storage and HTTPS.

Nothing has been published or deployed. Appointments currently exist only in the local website database.
