# Schlag den Henssler — Housewarming Edition

A self-contained, static gameshow web app that runs a 16-slot single-elimination
knockout tournament at a party. No backend, no build step — just two HTML files.

## Files

| File         | Purpose                                                        |
|--------------|---------------------------------------------------------------|
| `index.html` | Guest registration + TV display (bracket, active match, podium) |
| `admin.html` | Host controls — PIN, lobby, match management                  |
| `assets/`    | Game-show motif SVGs (crown, laurels, trophy, medal, swords)  |

## How to run it

State is synced across all devices live via **Firebase Realtime Database**
(see `firebase-config.js`), so phones, the admin, and the TV all stay in sync.

1. **Laptop → TV:** open **`index.html?tv`** and cast/mirror the tab to the TV
   (Chrome "Cast tab" or HDMI). This is the big bracket display.
2. **Host phone:** open **`admin.html`**, enter PIN **`1995`**.
3. **Guests:** scan the QR code shown on the TV (or in the admin's "Show QR code"),
   then register with a name + selfie on their own phones. They appear in the admin
   lobby instantly. (You can also use **"+ Add guest manually"** in the lobby.)
4. When everyone is in, press **"Lock and build fixture"** on the admin phone.
5. Run each match: **Start match** → 60s timer → tap the winner → confirm.
   Every device updates within ~1 second. The podium appears automatically after the final.

Use **"Reset game"** in the admin to clear all players and start a fresh tournament
(e.g. after testing, before the real party).

### Firebase setup
The Realtime Database is in **test mode** (open read/write), which is fine for a
private party but expires ~30 days after creation. To keep it open indefinitely,
in the Firebase console go to **Realtime Database → Rules** and set:

```json
{ "rules": { ".read": true, ".write": true } }
```

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
