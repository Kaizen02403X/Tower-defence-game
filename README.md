# Last Light — Tower Defense

Last Light is a browser-based tower defense game. The visuals, animation, and game logic run in JavaScript and Canvas in your browser. `game.py` is the older standalone Pygame version and is not used by this browser game.

Choose from five enemy-difficulty modes: Easy (30 waves), Intermediate (35), Molten (35), Void (40), and Frost (50). Then choose one of five visually distinct maps with its own route and terrain, rated from one to five terrain stars:

| Map | Terrain | Stars |
| --- | --- | --- |
| Verdant Crossing | Open grassland | 1 |
| Ember Pass | Volcanic ridges and glowing fissures | 2 |
| Frostfall Ridge | Snowfields, ice, and mountain pines | 3 |
| Abyssal Reach | Corrupted voidlands and violet crystals | 4 |
| The Shattered Citadel | Ruined fortress and broken stonework | 5 |

Map stars describe the terrain and route layout only; they do not change enemy strength or speed. Enemy difficulty comes from the selected mode. Bosses arrive on waves 15, 20, 30, and the campaign's final wave.

Ten towers can be upgraded to level 10, with per-tower placement limits. Five specialist towers are permanent gem unlocks in the Tower Shop. Gems are earned by completing a campaign and remain separate from battle gold, which resets for each campaign. Gems, unlocks, sound, and best wave are saved in the current browser on the current device.

## Run

Play the game online at **[Last Light — Tower Defense](https://kaizen02403x.github.io/Tower-defence-game/)** once the GitHub Pages deployment completes.

To run the game locally, open `static/index.html` in a browser. If you prefer to run it through a local server, start this from the project folder:

```bash
python3 server.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Stop the server with **Ctrl+C**.

To let friends play from Macs on the same Wi-Fi network, keep the server running and share your Mac's local IP address with them. On macOS, find it in **System Settings → Wi-Fi → Details**, then have them open `http://YOUR-MAC-IP:8000` in a browser. If macOS asks whether Python can accept incoming connections, allow it. This shares the game only on your local network; friends on other networks need a deployed version.

## Real apps: Android, iPhone, Windows, Mac

The same game is packaged as normal installable apps, built automatically by GitHub (nothing to install on your computer):

1. Push the `add-pwa-support` branch to GitHub; the app build starts automatically. Once the workflow is on the default branch, you can also start it from **Actions** → **Build apps** → **Run workflow**. A build takes roughly 10–25 minutes.
2. When a job finishes, download its file from the **Artifacts** section at the bottom of the run page. (To get a proper **Releases** page with all the files, push a version tag instead: `git tag v1.0.0 && git push origin v1.0.0`.)

| Platform | File | How to install |
| --- | --- | --- |
| Android | `LastLight-android.apk` | Copy it to the phone and open it. Allow **Install unknown apps** when asked. Builds use a temporary debug key, so a later build may not install over an earlier one; uninstalling the old app can erase its saved progress. |
| Windows | `LastLight-Setup-<version>.exe` | Run it. If Windows says "protected your PC", click **More info → Run anyway** (the app isn't code-signed). |
| Mac | `LastLight-<version>-mac-arm64.dmg` (M1/M2/M3/M4) or `-mac-x64.dmg` (Intel) | Open the `.dmg` and drag Last Light to Applications. The first time, right-click the app → **Open**. If macOS says it is "damaged", run `xattr -cr "/Applications/Last Light.app"` in Terminal. |
| iPhone | `LastLight-iOS-unsigned.ipa` | iOS only runs signed apps, so this file must be signed on install: use [Sideloadly](https://sideloadly.io) or [AltStore](https://altstore.io) with a free Apple ID (re-sign every 7 days). For TestFlight or the App Store you need a paid Apple Developer account and signing set up in the workflow. |

The apps keep their own saved gems, unlocks, and best wave on each device; progress is not shared between devices.

**Changing the app:** edit the game in `static/`, bump `version` in `package.json` and `CACHE_VERSION` in `static/sw.js`, then run the workflow again. The app name, icon art, and ID (`com.kaizen.lastlight`) live in `package.json`, `capacitor.config.json`, `assets/`, and `build/`. Android builds here are for sharing directly; publishing to Google Play needs your own private signing key.

## Install the web version (PWA)

The online version is also an installable web app. Once it's open, it can be added to your device and then runs full-screen from its own icon, even offline:

- **Android (Chrome):** menu **⋮ → Install app** (or **Add to Home screen**).
- **iPhone / iPad (Safari):** **Share → Add to Home Screen**.
- **Windows / Mac / Linux (Chrome or Edge):** click the install icon at the right of the address bar, or menu **→ Install Last Light**.

Installing needs the game to be served over `https://` (the GitHub Pages link works) or `http://localhost`. Opening `static/index.html` directly still works for playing, but it can't be installed.

When you change any game file, bump `CACHE_VERSION` in `static/sw.js` so installed copies pick up the update.

## Play

Choose a tower from the arsenal, then click an open patch of grass to deploy it. Towers can be placed between waves or during an active wave, so you can reinforce your defenses as the battle unfolds. Towers automatically attack enemies within range. Select a placed tower to upgrade it, choose an available attack path, or sell it. Start each wave when you're ready. Turn **AUTO: ON** beside the wave button to automatically begin the next wave shortly after each wave is cleared; turn it off during the intermission to stop the next wave. Enemies are tougher and faster, and later Void and Frost waves introduce shields and hidden enemies.

The **Soulweaver** raises up to three lower-health, lower-damage skeleton defenders at the gate. They march along the road toward enemies, fight them, and have visible health bars. Enemies stop to attack skeletons in melee; skeletons die when their HP runs out, and the Soulweaver can summon replacements. Bosses require adapting tower placement and upgrades to their abilities.

Elemental towers have distinct synthesized sound effects: Stormcoil crackles with thunder, Rimecaller chimes with icy sounds, and Blastforge fires a deep explosive boom. Damage and summoning have their own effects. Click the music-note button to mute or enable sound; browsers enable audio after your first click or key press.

| Input | Action |
| --- | --- |
| Click a tower or press `1`–`9`, `0` | Select a defender |
| Click open grass | Place the selected tower |
| Click a placed tower | Inspect, upgrade, or sell it |
| `Space` | Start the next wave |
| `Esc` | Cancel tower placement |
| `P` | Pause or resume |
| Music-note button | Mute or enable sounds |
| Speed button | Toggle 1×/2× speed |
| Menu button | Return to the main menu |

Your best wave is saved in this browser on this device.
