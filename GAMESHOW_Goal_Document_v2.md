# Housewarming Gameshow Web App — Goal Document

This document defines the full scope, behaviour, design intent, and confirmed technical decisions for a browser-based gameshow management application to be run at a private housewarming party. The theme is inspired by the German television show *Schlag den Henssler* — tacky, high-energy, early-2000s gameshow aesthetic.

| Property    | Value                                           |
|-------------|------------------------------------------------|
| Author      | Dilhan                                          |
| Date        | 27th of June 2026                               |
| Version     | 2.0                                             |
| Hosting     | GitHub Pages (static)                           |
| Stack       | Single `index.html` + `admin.html`, vanilla HTML/CSS/JS |
| State       | `localStorage` + URL hash encoding (no backend) |
| Sync method | URL hash polled every 2 seconds (cross-device)  |

---

## Table of contents

- [Overview](#overview)
- [Architecture and hosting](#architecture-and-hosting)
- [Device setup](#device-setup)
- [URL routing](#url-routing)
- [Phase 1 - Guest registration](#phase-1---guest-registration)
- [Phase 2 - Fixture generation](#phase-2---fixture-generation)
- [Phase 3 - Tournament play](#phase-3---tournament-play)
- [Phase 4 - Podium and winner announcement](#phase-4---podium-and-winner-announcement)
- [Visual theme requirements](#visual-theme-requirements)
- [Admin controls](#admin-controls)
- [Screen inventory](#screen-inventory)
- [Technical requirements](#technical-requirements)
- [Decisions log](#decisions-log)
- [Out of scope](#out-of-scope)

---

## Overview

The app is a self-contained web application that runs a single-elimination knockout tournament at a housewarming party. It is hosted on GitHub Pages with no server-side infrastructure. State is persisted in `localStorage` and synchronised across devices via URL hash encoding.

The host (admin) controls the flow entirely from their mobile phone. A laptop browser tab displays the live bracket on the TV via Chromecast or HDMI. Guests self-register via QR code before the tournament begins.

Expected attendance: 15 to 25 guests.

---

## Architecture and hosting

The app consists of two static HTML files deployed to GitHub Pages.

The following table summarises the file structure.

| File         | Purpose                                      |
|--------------|----------------------------------------------|
| `index.html` | Guest registration view and TV display view  |
| `admin.html` | Admin PIN + all admin controls               |

No build step, no Node.js, no backend, no database. The entire app is vanilla HTML, CSS, and JavaScript.

State is stored in `localStorage` on whichever device runs the admin. The TV display device syncs by polling the URL hash every 2 seconds. The admin encodes full tournament state into the URL hash on every action; the display tab reads and renders it.

---

## Device setup

The confirmed setup for the event is Option B: two devices, with the TV display running on a laptop and the admin controls on the host's mobile phone.

The following table describes each device's role.

| Device        | URL loaded              | Role                                      |
|---------------|-------------------------|-------------------------------------------|
| Host's phone  | `yoursite.com/admin.html` | Admin controls — PIN login, lobby, match management |
| Laptop (Tab 1) | `yoursite.com/index.html` | TV display — full bracket, active match zoom, podium |
| TV            | Laptop screen cast/mirrored | Landscape display for all guests to watch |

The laptop tab is cast to the TV via Chromecast ("Cast tab" in Chrome) or HDMI cable. The display is landscape fullscreen. The admin phone is held by the host and is not visible to guests.

Guest QR code points to `yoursite.com/index.html` — the same URL as the TV display. The app detects whether registration is open and shows the appropriate view (registration form vs. display mode) based on state.

---

## URL routing

Routing is handled entirely via URL parameters and app state — no server-side routing required.

The following table summarises all URLs and their behaviour.

| URL                          | View shown                                         |
|------------------------------|----------------------------------------------------|
| `index.html`                 | Guest registration form (if registration open) or TV display bracket |
| `index.html` (after lock)    | TV display — full bracket, active match, podium    |
| `admin.html`                 | PIN entry screen → admin lobby → match controls    |

---

## Phase 1 - Guest registration

This phase runs before the tournament begins. Guests scan a QR code displayed on the TV or printed, which takes them to the registration page on their own mobile phone.

### Registration page behaviour

The registration page allows each guest to:

1. Enter their name (text field, required).
2. Take a selfie using their phone camera (camera capture input, required).
3. Submit their registration.

Once submitted, the guest's name and photo are stored and their entry appears on the admin lobby screen in real time.

### One registration per phone

A flag is stored in the phone's `localStorage` after a successful registration. If the flag exists when the registration page loads, the guest sees a "You're in!" confirmation screen showing their name and photo instead of the blank form. This prevents duplicate registrations from the same device.

> **Note:** A guest opening an incognito tab could bypass this. For a housewarming party, this is acceptable.

### Admin registration view

The admin sees a live grid of registered guests, showing each guest's name and thumbnail photo. The list polls for updates every 2 seconds. The admin can remove a guest (e.g. if they registered twice) before locking.

The admin can also display the QR code full-screen on their phone for guests to scan.

### Locking registration

When the admin is satisfied that all guests have registered, they press a **"Lock and build fixture"** button. A confirmation dialog appears. On confirmation, registration closes and the app moves to Phase 2.

Latecomers who scan the QR code after locking see: "Registration is closed. Ask the host to add you manually."

---

## Phase 2 - Fixture generation

Once registration is locked, the app automatically generates a single-elimination knockout bracket capped at 16 slots.

### Bracket sizing logic

The bracket is always exactly 16 slots. The following rules apply based on player count.

| Players registered | Bracket approach                                                   |
|--------------------|---------------------------------------------------------------------|
| Up to 16           | Fill 16 slots. Remaining slots receive random byes (auto-advance). |
| 17 to 25           | First 16 players enter the main bracket. Overflow players (17th onwards) enter a play-in round. Play-in winners fill the remaining main bracket slots. |

Play-in matches run first. Winners of play-in matches are slotted into the main bracket before Round 1 begins. This means early registrants get the slight advantage of entering the main bracket directly — a deliberate incentive to register early.

### Round naming convention

The following round names apply regardless of how many play-in matches occur.

| Round             | Description                              |
|-------------------|------------------------------------------|
| Play-in           | Overflow matches to earn a bracket slot  |
| Qualifiers        | Round 1 of the main 16-player bracket    |
| Quarter-finals    | Last 8 players                           |
| Semi-finals       | Last 4 players                           |
| Final             | Last 2 players                           |

### Match count reference

The following table shows expected total matches by player count.

| Players | Play-in matches | Main bracket matches | Total |
|---------|-----------------|----------------------|-------|
| 14      | 0 (2 byes)      | 15                   | 15    |
| 16      | 0               | 15                   | 15    |
| 19      | 3               | 15                   | 18    |
| 23      | 7               | 15                   | 22    |

---

## Phase 3 - Tournament play

### Match flow

Each match follows this sequence:

1. Admin views the current match on their phone (two players shown, large tap targets).
2. Admin presses **"Start match"** — the 1-minute countdown begins on both the phone and the TV.
3. Timer counts down from 60 seconds. Colour changes: green above 20s, amber 10–20s, red below 10s.
4. At 0:00, the screen starts flashing red (alternating between two shades of red at 0.6s intervals) on both admin phone and TV.
5. Admin taps a player name to declare the winner.
6. A bottom-sheet confirmation modal appears: "Mark [Name] as winner? This advances them to [next round]."
7. Admin confirms. Bracket updates. Flash stops. TV auto-zooms to the next match.
8. Timer resets and waits idle. Admin presses "Start match" again for the next match.

The pause between step 8 and pressing "Start match" gives the host time to announce the next game to the room before the clock starts.

### Display layout

The TV (laptop tab) shows the full bracket at all times. The current active match is enlarged prominently. Remaining matches are de-emphasised (reduced opacity) but still visible.

As the tournament progresses, the bracket view zooms in:

| Stage           | Bracket zoom level                               |
|-----------------|--------------------------------------------------|
| Play-in         | Full bracket visible                             |
| Qualifiers      | Full bracket visible                             |
| Quarter-finals  | Zooms to show remaining 8 players only           |
| Semi-finals     | Zooms to show remaining 4 players only           |
| Final           | Only the two finalists shown, maximally enlarged |

### Selecting a winner

The admin taps a player's name or photo on the admin phone. A confirmation bottom-sheet appears. On confirmation, the player advances to the next round and the bracket updates on both devices within 2 seconds.

### Undo function

A clearly visible **Undo** button is available at the bottom of the admin screen after any result is confirmed. Pressing Undo reverses the most recent winner selection and returns the bracket to its previous state. Single-step undo only.

### Timer behaviour

The following table summarises timer states.

| Timer state     | Display colour | TV behaviour           |
|-----------------|---------------|------------------------|
| 60s → 21s       | Green          | Normal display         |
| 20s → 11s       | Amber          | Normal display         |
| 10s → 1s        | Red            | Normal display         |
| 0:00            | Red            | Full-screen red flash  |
| Winner declared | Resets to 60s  | Flash stops, next match zooms in |

The admin can pause the timer at any point. Pausing does not affect the TV display other than freezing the countdown.

---

## Phase 4 - Podium and winner announcement

When the final match is resolved, the app automatically transitions to the podium screen on both devices.

### Podium layout

The podium displays four positions.

| Position     | Player                                  |
|--------------|-----------------------------------------|
| 1st place    | Tournament winner                       |
| 2nd place    | Tournament runner-up                    |
| Equal 3rd    | Both semi-final losers                  |

Each position shows the player's name and their selfie photo. The layout uses a physical podium structure — 1st elevated in the centre, 2nd to the left, equal 3rd split on the right at a lower height.

The podium page uses the full gold finale visual theme with a confetti animation.

---

## Visual theme requirements

The visual design is inspired by *Schlag den Henssler* — loud, gaudy, early-2000s German gameshow aesthetic. Over-the-top metallic textures, Roman-style ornamental patterns, dramatic typography, high contrast.

The theme escalates as the tournament progresses.

### Theme progression

| Stage           | Primary colour  | Background style                                               |
|-----------------|-----------------|----------------------------------------------------------------|
| Play-in         | Bronze          | Warm dark background, copper/gold text, Roman ornamental borders |
| Qualifiers      | Bronze          | Same as play-in, slightly more saturated                        |
| Quarter-finals  | Bronze+         | Increased saturation and brightness                             |
| Semi-finals     | Silver          | Cool silver gradient, sleek metallic sheen                      |
| Final           | Gold            | Deep gold background, maximum drama, crown/star motifs          |
| Podium          | Gold            | Same as final with confetti animation overlay                   |

### Round transitions

Each new round begins with a brief full-screen flash/wipe transition animation before the new bracket view loads. The zoom-in effect as the bracket narrows is a smooth CSS transition, not an instant jump.

### Typography

- Headlines: bold, condensed, high contrast — reminiscent of gameshow title cards.
- Player names: large, legible, white or gold on dark backgrounds.
- Timer: oversized, monospaced, colour-coded by urgency.

---

## Admin controls

All admin actions are performed on the host's mobile phone via `admin.html`. The admin interface is mobile-optimised (large tap targets, portrait orientation). The admin PIN is `1995`.

The following table lists all admin actions.

| Action                    | When available         | Description                                              |
|---------------------------|------------------------|----------------------------------------------------------|
| Enter PIN                 | On load of admin.html  | 4-digit keypad. Session stored so refresh does not require re-entry. |
| Show QR code              | Phase 1                | Displays QR full-screen for guests to scan               |
| Remove guest              | Phase 1                | Removes a guest from the lobby before locking            |
| Lock registration         | Phase 1                | Closes registration and triggers fixture generation      |
| Start match               | Before each match      | Starts the 60-second countdown                           |
| Pause timer               | During countdown       | Freezes the countdown without declaring a result         |
| Mark winner               | During each match      | Taps player → confirmation modal → bracket updates       |
| Undo last result          | After any match result | Reverses the most recent winner selection                |
| Advance to next round     | Automatic              | Triggered automatically once all matches in a round resolve |
| View podium               | After final            | Automatic — both devices transition to podium screen     |

---

## Screen inventory

The following table lists all 8 screens in the application.

| # | Screen name        | Device       | Key elements                                              |
|---|--------------------|--------------|-----------------------------------------------------------|
| 1 | Guest registration | Guest phone  | Name field, selfie capture, Join button                   |
| 2 | Already registered | Guest phone  | "You're in!" confirmation with name and photo             |
| 3 | Admin PIN          | Host phone   | 4-digit keypad, session persistence                       |
| 4 | Admin lobby        | Host phone   | Guest grid, QR code button, Lock button                   |
| 5 | Fixture display    | TV + phone   | Full bracket, bronze theme, "Start match" button          |
| 6 | Match active       | TV + phone   | Zoomed match, countdown timer, player tap targets         |
| 7 | Timer expired      | TV + phone   | Full-screen red flash, prompt to declare winner           |
| 8 | Declare winner     | Host phone   | Bottom-sheet confirmation modal                           |
| 9 | Podium             | TV + phone   | Gold theme, 1st/2nd/equal 3rd, selfie photos, confetti   |

---

## Technical requirements

### State management

All tournament state is stored as a JSON object in `localStorage` on the admin device. On every state change, the admin device also encodes the state as a base64 string in the URL hash (`#state=...`). The TV display device polls `window.location.hash` every 2 seconds and re-renders if the hash has changed.

### Camera and photo handling

Guest selfies are captured via the browser's standard file input with `capture="user"`. Photos are stored as base64-encoded strings within the state object in `localStorage`. The same base64 strings are included in the URL hash so the TV display can render player photos without any backend.

> **Note:** With 25 players and compressed selfies, the URL hash could become large. Photos will be resized and compressed client-side to a maximum of 200×200px and ~20KB each before storage.

### QR code generation

A QR code pointing to `index.html` is generated client-side using the `qrcode.js` library (loaded from CDN). No external API required.

### Browser compatibility

The app must work on:
- Safari on iOS (guest registration and admin phone)
- Chrome on macOS (laptop TV display tab)
- Chrome on Android (alternative admin device)

### Landscape TV display

The TV display tab is designed for landscape orientation at approximately 1920×1080 or whatever the laptop screen resolution is when cast. All bracket layouts, active match views, and the podium are optimised for landscape aspect ratios.

---

## Decisions log

The following table records all confirmed design and technical decisions made during planning.

| # | Decision | Detail |
|---|----------|--------|
| 1 | Bracket cap | Fixed at 16 slots always |
| 2 | Overflow handling | Play-in round for players 17+ (not byes) |
| 3 | Bye assignment | Random, for under-16 player counts only |
| 4 | State persistence | `localStorage` + URL hash encoding. No backend or database. |
| 5 | Cross-device sync | URL hash polled every 2 seconds by TV display device |
| 6 | Device setup | Option B — phone (admin) + laptop (TV display) |
| 7 | TV orientation | Landscape. Host screencasts laptop tab to TV. |
| 8 | Casting method | Chromecast "Cast tab" or HDMI cable |
| 9 | Admin access | `admin.html` — separate file from `index.html` |
| 10 | Admin PIN | `1995` |
| 11 | Timer duration | 60 seconds per match |
| 12 | Timer expiry | Full-screen red flash at 0:00. Manual winner declaration required. |
| 13 | Timer start | Manual — admin presses "Start match" before each countdown |
| 14 | Undo | Single-step undo of most recent winner declaration |
| 15 | Round transitions | CSS transition zoom + full-screen flash/wipe between rounds |
| 16 | Sound effects | None |
| 17 | Podium positions | 1st, 2nd, and equal 3rd (both semi-final losers) |
| 18 | Photo storage | Base64 in localStorage and URL hash, compressed to max 200×200px / ~20KB |
| 19 | QR code | Generated client-side via qrcode.js CDN library |
| 20 | One registration per phone | localStorage flag. Incognito bypass accepted for party context. |

---

## Out of scope

The following features are explicitly not part of this build.

- Score tracking within a single match (the app only records who won, not by how much).
- Online multiplayer or remote participation by guests not physically present.
- Integration with any external gameshow platform.
- Custom seeding or manual bracket editing by the admin.
- Sound effects or music.
- Server-side rendering, databases, or any backend infrastructure.
