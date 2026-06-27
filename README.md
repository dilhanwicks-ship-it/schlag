# Schlag den Henssler — Housewarming Edition

A self-contained, static gameshow web app that runs a 16-slot single-elimination
knockout tournament at a party. No backend, no build step — just two HTML files.

## Files

| File         | Purpose                                                        |
|--------------|---------------------------------------------------------------|
| `index.html` | Guest registration + TV display (bracket, active match, podium) |
| `admin.html` | Host controls — PIN, lobby, match management                  |
| `assets/`    | Game-show motif SVGs (crown, laurels, trophy, medal, swords)  |

## How to run it (single-laptop setup)

State is shared via the browser's `localStorage`, so **the admin and the TV display
must run in two tabs of the same browser on the same laptop.**

1. Open **`admin.html`** in one tab. Enter PIN **`1995`**.
2. Open **`index.html?tv`** in a second tab — this is the TV display. Cast/mirror
   this tab to the TV (Chrome "Cast tab" or HDMI).
3. Register guests on the laptop:
   - Open `index.html` (no `?tv`) and use the selfie form, tapping
     **"Register another guest"** after each person, **or**
   - Use **"+ Add guest manually"** in the admin lobby.
4. When everyone is in, press **"Lock and build fixture"** in the admin tab.
5. Run each match: **Start match** → 60s timer → tap the winner → confirm.
   The TV updates within ~2 seconds. The podium appears automatically after the final.

> Note: because there is no backend, guests cannot register from their own phones
> in this setup — registration happens on the laptop. (Adding live cross-device sync
> would require a small hosted service such as Firebase.)

## Deploy to GitHub Pages

1. Create a new GitHub repository and push these files (see below).
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, branch `main`, folder `/ (root)`.
3. Your app will be live at `https://<username>.github.io/<repo>/`
   - TV display: `.../index.html?tv`
   - Admin: `.../admin.html`

## Credits

Icons from [game-icons.net](https://game-icons.net) by Lorc, licensed
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). See `assets/CREDITS.txt`.
