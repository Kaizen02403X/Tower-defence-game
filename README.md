# Last Light — Tower Defense

Last Light is a browser-based tower defense game. The visuals, animation, and game logic run in JavaScript and Canvas in your browser. `game.py` is the older standalone Pygame version and is not used by this browser game.

## Run

Play the game online at **[Last Light — Tower Defense](https://kaizen02403x.github.io/Tower-defence-game/)** once the GitHub Pages deployment completes.

To run the game locally, open `static/index.html` in a browser. If you prefer to run it through a local server, start this from the project folder:

```bash
python3 server.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Stop the server with **Ctrl+C**.

To let friends play from Macs on the same Wi-Fi network, keep the server running and share your Mac's local IP address with them. On macOS, find it in **System Settings → Wi-Fi → Details**, then have them open `http://YOUR-MAC-IP:8000` in a browser. If macOS asks whether Python can accept incoming connections, allow it. This shares the game only on your local network; friends on other networks need a deployed version.

## Play

Choose a tower from the arsenal, then click an open patch of grass to deploy it. Towers automatically attack enemies within range. Select a placed tower to upgrade or sell it, and start each wave when you're ready. Turn **AUTO: ON** beside the wave button to automatically begin the next wave shortly after each wave is cleared; turn it off during the intermission to stop the next wave. The campaign has 100 increasingly difficult waves, with a boss encounter every fifth wave. Seventeen distinct bosses bring abilities such as tower shutdowns, armor, regeneration, phase jumps, skeleton attacks, and reinforcements; the final wave features VEX-9.

The **Soulweaver** raises up to three lower-health, lower-damage skeleton defenders at the gate. They march along the road toward enemies, fight them, and have visible health bars. Enemies stop to attack skeletons in melee; skeletons die when their HP runs out, and the Soulweaver can summon replacements. Bosses require adapting tower placement and upgrades to their abilities.

Elemental towers have distinct synthesized sound effects: Stormcoil crackles with thunder, Rimecaller chimes with icy sounds, and Blastforge fires a deep explosive boom. Damage and summoning have their own effects. Click the music-note button to mute or enable sound; browsers enable audio after your first click or key press.

| Input | Action |
| --- | --- |
| Click a tower or press `1`–`5` | Select a defender |
| Click open grass | Place the selected tower |
| Click a placed tower | Inspect, upgrade, or sell it |
| `Space` | Start the next wave |
| `Esc` | Cancel tower placement |
| `P` | Pause or resume |
| Music-note button | Mute or enable sounds |
| Speed button | Toggle 1×/2× speed |

Your best wave is saved in this browser on this device.
