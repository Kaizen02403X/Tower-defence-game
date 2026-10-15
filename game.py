import json
import math
import random
import sys
from pathlib import Path

import pygame


WIDTH, HEIGHT = 1280, 760
FIELD = pygame.Rect(20, 112, 960, 600)
SCORE_FILE = Path(__file__).resolve().parent / "data" / "tower_defense.json"
ROUTE = [
    (-24, 145), (205, 145), (205, 365), (455, 365),
    (455, 173), (705, 173), (705, 455), (984, 455),
]
TOWER_DATA = {
    "ranger": {"name": "Sunshot", "role": "Quick · precise", "key": "1", "cost": 65, "range": 142, "cooldown": .58, "damage": 14, "color": "#f3cf7b", "shot": "arrow"},
    "cannon": {"name": "Blastforge", "role": "Heavy · splash", "key": "2", "cost": 115, "range": 128, "cooldown": 1.4, "damage": 37, "color": "#ff946e", "shot": "shell", "splash": 61},
    "frost": {"name": "Rimecaller", "role": "Chill · slow", "key": "3", "cost": 85, "range": 136, "cooldown": 1.08, "damage": 8, "color": "#81daeb", "shot": "frost", "slow": .43, "splash": 33},
    "tesla": {"name": "Stormcoil", "role": "Chain · lightning", "key": "4", "cost": 145, "range": 118, "cooldown": 1.3, "damage": 22, "color": "#c7a4ff", "shot": "lightning", "chains": 3},
}
BOSSES = [
    {"name": "Stone Warden", "color": "#e7c58e", "symbol": "⬡", "trait": "ARMORED"},
    {"name": "Embermaw", "color": "#ff8866", "symbol": "✹", "trait": "FRENZIED"},
    {"name": "Frost Colossus", "color": "#8de3f2", "symbol": "❄", "trait": "CHILLING AURA"},
    {"name": "The Hollow King", "color": "#d5a1ff", "symbol": "◉", "trait": "PHASE WALKER"},
]
ENEMY_DATA = {
    "shade": {"hp": 42, "speed": 51, "radius": 11, "reward": 10, "color": "#c18ee0"},
    "runner": {"hp": 29, "speed": 88, "radius": 9, "reward": 12, "color": "#f0a96c"},
    "brute": {"hp": 140, "speed": 31, "radius": 15, "reward": 19, "color": "#db8084"},
}


def color(value):
    return pygame.Color(value)


def route_segments():
    result = []
    for start, end in zip(ROUTE, ROUTE[1:]):
        dx, dy = end[0] - start[0], end[1] - start[1]
        result.append((start, dx, dy, math.hypot(dx, dy)))
    return result


SEGMENTS = route_segments()
ROUTE_LENGTH = sum(segment[3] for segment in SEGMENTS)


def route_position(progress):
    remaining = max(0, progress)
    for start, dx, dy, length in SEGMENTS:
        if remaining <= length:
            ratio = remaining / length
            return start[0] + dx * ratio, start[1] + dy * ratio
        remaining -= length
    return ROUTE[-1]


def distance_to_route(x, y):
    closest = float("inf")
    for start, dx, dy, length in SEGMENTS:
        ratio = max(0, min(1, ((x - start[0]) * dx + (y - start[1]) * dy) / (length * length)))
        closest = min(closest, math.hypot(x - start[0] - ratio * dx, y - start[1] - ratio * dy))
    return closest


class LastLight:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption("Last Light — Tower Defense")
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock = pygame.time.Clock()
        self.fonts = {
            "tiny": pygame.font.SysFont("trebuchetms", 12, bold=True),
            "small": pygame.font.SysFont("trebuchetms", 15),
            "body": pygame.font.SysFont("trebuchetms", 17),
            "medium": pygame.font.SysFont("trebuchetms", 21, bold=True),
            "large": pygame.font.SysFont("trebuchetms", 38, bold=True),
            "title": pygame.font.SysFont("trebuchetms", 52, bold=True),
        }
        self.random = random.Random(1991)
        self.decorations = [
            (self.random.randrange(960), self.random.randrange(600), self.random.randrange(1, 4))
            for _ in range(170)
        ]
        self.decorations = [p for p in self.decorations if distance_to_route(p[0], p[1]) > 41]
        self.terrain_features = []
        for _ in range(26):
            x, y = self.random.randrange(34, 926), self.random.randrange(34, 566)
            if distance_to_route(x, y) > 76:
                self.terrain_features.append((x, y, self.random.choice(("shrub", "stone", "crystal"))))
        self.grass_tufts = [
            (self.random.randrange(960), self.random.randrange(600), self.random.random() * math.tau)
            for _ in range(95)
        ]
        self.grass_tufts = [p for p in self.grass_tufts if distance_to_route(p[0], p[1]) > 53]
        self.fireflies = [
            (self.random.randrange(960), self.random.randrange(600), self.random.random() * math.tau)
            for _ in range(18)
        ]
        self.glow_cache = {}
        self.best_wave = self.load_best_score()
        self.next_id = 1
        self.game_state = "intro"
        self.reset_state()
        self.game_state = "intro"
        self.message = "Select a tower, then place it on the grass."
        self.overlay_button = pygame.Rect(0, 0, 0, 0)
        self.running = True

    def load_best_score(self):
        try:
            data = json.loads(SCORE_FILE.read_text(encoding="utf-8"))
            score = data.get("best", 0) if isinstance(data, dict) else 0
            if type(score) is int and score >= 0:
                return score
            print(f"Invalid best-wave data in {SCORE_FILE}; starting at 0.", file=sys.stderr)
            return 0
        except FileNotFoundError:
            return 0
        except (OSError, json.JSONDecodeError) as error:
            print(f"Could not load best wave: {error}", file=sys.stderr)
            return 0

    def save_best_score(self):
        try:
            SCORE_FILE.parent.mkdir(parents=True, exist_ok=True)
            SCORE_FILE.write_text(json.dumps({"best": self.best_wave}) + "\n", encoding="utf-8")
        except OSError as error:
            print(f"Could not save best wave: {error}", file=sys.stderr)

    def reset_state(self):
        self.gold, self.lives, self.wave = 260, 20, 0
        self.selected_type = None
        self.selected_tower = None
        self.towers, self.enemies = [], []
        self.projectiles, self.effects, self.particles = [], [], []
        self.spawn_queue = []
        self.spawn_timer = 0
        self.wave_speed = 1
        self.game_time = 0
        self.mouse = (-100, -100)
        self.next_id = 1

    def text(self, value, font="body", tint="#e6e9df"):
        return self.fonts[font].render(str(value), True, color(tint))

    def draw_text(self, value, x, y, font="body", tint="#e6e9df", center=False):
        image = self.text(value, font, tint)
        rect = image.get_rect()
        if center:
            rect.center = (x, y)
        else:
            rect.topleft = (x, y)
        self.screen.blit(image, rect)
        return rect

    def glow(self, x, y, tint, radius, strength=1):
        key = (color(tint).r, color(tint).g, color(tint).b, radius)
        image = self.glow_cache.get(key)
        if image is None:
            size = radius * 2
            image = pygame.Surface((size, size), pygame.SRCALPHA)
            center = radius
            for ring in range(radius, 0, -2):
                alpha = max(1, round(27 * (1 - ring / radius) ** 2))
                pygame.draw.circle(image, (*key[:3], alpha), (center, center), ring)
            self.glow_cache[key] = image
        image.set_alpha(max(0, min(255, round(255 * strength))))
        self.screen.blit(image, (round(x) - radius, round(y) - radius), special_flags=pygame.BLEND_RGBA_ADD)

    def burst(self, x, y, tint, count=8, speed=90):
        for _ in range(count):
            angle = self.random.random() * math.tau
            velocity = speed * (.35 + self.random.random() * .65)
            lifetime = .22 + self.random.random() * .32
            self.particles.append({
                "x": x, "y": y, "vx": math.cos(angle) * velocity, "vy": math.sin(angle) * velocity,
                "life": lifetime, "max_life": lifetime, "size": 1.5 + self.random.random() * 2.5,
                "color": tint,
            })

    def add_effect(self, effect_type, x, y, tint, radius=24, duration=.24):
        self.effects.append({
            "type": effect_type, "x": x, "y": y, "radius": radius,
            "color": tint, "expires": self.game_time + duration,
        })

    def start_wave(self):
        if self.game_state != "build":
            return
        self.game_state = "wave"
        self.wave += 1
        count = 7 + self.wave * 2
        self.spawn_queue = [
            {"index": i, "boss": self.wave % 5 == 0 and i == count - 2}
            for i in range(count)
        ]
        self.spawn_timer = .3
        self.message = "Boss wave! Brace for a legendary enemy." if self.wave % 5 == 0 else "Enemies incoming. Towers fire automatically."

    def create_enemy(self, index, boss=False):
        enemy_id = self.next_id
        self.next_id += 1
        if boss:
            kind = self.wave // 5
            data = BOSSES[(kind - 1) % len(BOSSES)]
            hp = 780 + self.wave * 48
            x, y = route_position(0)
            return {
                "id": enemy_id, "name": data["name"], "boss": True, "boss_kind": kind,
                "color": data["color"], "symbol": data["symbol"], "trait": data["trait"],
                "hp": hp, "max_hp": hp, "progress": 0,
                "x": FIELD.x + x, "y": FIELD.y + y, "speed": 34 + min(self.wave, 20) * .4,
                "radius": 20, "reward": 75 + self.wave * 2, "attack_timer": 0,
                "slow_until": 0, "slow_factor": 1, "burst": 0,
            }
        kind = "runner" if index % 7 == 4 else "brute" if index % 7 == 1 and self.wave >= 3 else "shade"
        stats = ENEMY_DATA[kind]
        hp = math.ceil(stats["hp"] * (1 + max(0, self.wave - 1) * .14))
        x, y = route_position(0)
        return {
            "id": enemy_id, "type": kind, **stats, "hp": hp, "max_hp": hp,
            "speed": stats["speed"] + min(self.wave, 15), "progress": 0,
            "x": FIELD.x + x, "y": FIELD.y + y,
            "slow_until": 0, "slow_factor": 1, "attack_timer": 0,
        }

    def spawn_enemy(self, entry):
        enemy = self.create_enemy(entry["index"], entry["boss"])
        self.enemies.append(enemy)
        if enemy.get("boss"):
            self.message = f"BOSS APPROACHING · {enemy['name'].upper()}"

    def damage_enemy(self, enemy, amount, slow=0):
        if enemy.get("dead"):
            return
        armor = .28 if enemy.get("boss") and enemy["boss_kind"] == 1 else .12 if enemy.get("boss") and enemy["boss_kind"] == 4 else .08 if enemy.get("type") == "brute" else 0
        enemy["hp"] -= amount * (1 - armor)
        if slow > 0:
            enemy["slow_until"] = max(enemy["slow_until"], self.game_time + (1.05 if enemy.get("boss") else 2.6))
            enemy["slow_factor"] = min(enemy.get("slow_factor", 1), slow)
        if enemy["hp"] <= 0:
            enemy["dead"] = True
            self.gold += enemy["reward"] + (85 if enemy.get("boss") else 0)
            self.burst(enemy["x"], enemy["y"], enemy["color"], 24 if enemy.get("boss") else 10, 140)
            self.add_effect("impact", enemy["x"], enemy["y"], enemy["color"], 44 if enemy.get("boss") else 22, .34)
            if enemy.get("boss"):
                self.message = f"{enemy['name']} defeated · +◈ {enemy['reward'] + 85}"

    def fire_tower(self, tower, target):
        stats = TOWER_DATA[tower["type"]]
        multiplier = 1 + tower["level"] * .42
        tower["aim"] = math.atan2(target["y"] - tower["y"], target["x"] - tower["x"])
        shot = {
            "type": stats["shot"], "tower": tower, "target": target, "x": tower["x"],
            "y": tower["y"] - 7, "damage": stats["damage"] * multiplier,
            "speed": 295 if tower["type"] == "cannon" else 405, "color": stats["color"],
            "slow": stats.get("slow", 0), "splash": stats.get("splash", 0),
            "trail": [(tower["x"], tower["y"] - 7)],
        }
        self.add_effect("muzzle", tower["x"] + math.cos(tower["aim"]) * 20, tower["y"] + math.sin(tower["aim"]) * 20, stats["color"], 17, .12)
        self.burst(tower["x"] + math.cos(tower["aim"]) * 20, tower["y"] + math.sin(tower["aim"]) * 20, stats["color"], 3, 65)
        if tower["type"] == "tesla":
            struck = [target]
            self.damage_enemy(target, shot["damage"])
            for _ in range(1, stats["chains"]):
                origin = struck[-1]
                candidates = [
                    enemy for enemy in self.enemies
                    if not enemy.get("dead") and enemy not in struck
                    and math.hypot(enemy["x"] - origin["x"], enemy["y"] - origin["y"]) < 91
                ]
                if not candidates:
                    break
                next_enemy = min(candidates, key=lambda e: math.hypot(e["x"] - origin["x"], e["y"] - origin["y"]))
                struck.append(next_enemy)
                self.damage_enemy(next_enemy, shot["damage"] * .72)
            points = [(tower["x"], tower["y"] - 8)] + [(e["x"], e["y"]) for e in struck]
            self.effects.append({"type": "lightning", "points": points, "color": stats["color"], "expires": self.game_time + .24})
            for enemy in struck:
                self.burst(enemy["x"], enemy["y"], stats["color"], 5, 100)
            return
        self.projectiles.append(shot)

    def impact(self, shot):
        target = shot["target"]
        if shot["splash"]:
            self.add_effect("blast", shot["x"], shot["y"], shot["color"], shot["splash"], .38)
            self.burst(shot["x"], shot["y"], shot["color"], 17, 155)
            for enemy in self.enemies:
                if not enemy.get("dead") and math.hypot(enemy["x"] - shot["x"], enemy["y"] - shot["y"]) <= shot["splash"]:
                    self.damage_enemy(enemy, shot["damage"] * (1 if enemy is target else .68), shot["slow"])
        else:
            self.damage_enemy(target, shot["damage"], shot["slow"])
            self.add_effect("impact", shot["x"], shot["y"], shot["color"], 18, .2)
            self.burst(shot["x"], shot["y"], shot["color"], 5, 110)

    def update(self, dt):
        if self.game_state not in ("build", "wave"):
            return
        dt *= self.wave_speed
        self.game_time += dt
        if self.game_state == "wave":
            self.spawn_timer -= dt
            while self.spawn_queue and self.spawn_timer <= 0:
                self.spawn_enemy(self.spawn_queue.pop(0))
                self.spawn_timer += max(.31, .78 - self.wave * .012)

        for enemy in self.enemies:
            if enemy.get("dead"):
                continue
            if enemy["slow_until"] <= self.game_time:
                enemy["slow_factor"] = 1
            enemy["attack_timer"] += dt
            kind = enemy.get("boss_kind")
            if enemy.get("boss") and kind == 2 and enemy["attack_timer"] >= 2.1:
                enemy["attack_timer"], enemy["burst"] = 0, .8
            elif enemy.get("boss") and kind == 3 and enemy["attack_timer"] >= 2.4:
                enemy["attack_timer"] = 0
                x, y = route_position(enemy["progress"])
                x, y = FIELD.x + x, FIELD.y + y
                self.effects.append({"type": "pulse", "x": x, "y": y, "radius": 112, "color": enemy["color"], "expires": self.game_time + .6})
            elif enemy.get("boss") and kind == 4 and enemy["attack_timer"] >= 3.6:
                enemy["attack_timer"] = 0
                old_x, old_y = enemy["x"], enemy["y"]
                enemy["progress"] += 78
                self.burst(old_x, old_y, enemy["color"], 12, 125)
            speed_factor = enemy["slow_factor"] if enemy["slow_until"] > self.game_time else 1
            if enemy.get("boss") and kind == 2 and enemy["burst"] > 0:
                enemy["burst"] -= dt
                speed_factor *= 2.05
            enemy["progress"] += enemy["speed"] * speed_factor * dt
            enemy["x"], enemy["y"] = route_position(enemy["progress"])
            enemy["x"] += FIELD.x
            enemy["y"] += FIELD.y
            if enemy["progress"] >= ROUTE_LENGTH:
                enemy["dead"] = True
                self.lives -= 5 if enemy.get("boss") else 3 if enemy.get("type") == "brute" else 1
                x, y = FIELD.x + 933, FIELD.y + 455
                self.effects.append({"type": "leak", "x": x, "y": y, "radius": 28, "color": enemy["color"], "expires": self.game_time + .65})
                self.burst(x, y, enemy["color"], 10, 95)
                if self.lives <= 0:
                    self.lives = 0
                    self.game_over()

        self.enemies = [enemy for enemy in self.enemies if not enemy.get("dead")]
        if self.game_state == "wave" and not self.spawn_queue and not self.enemies:
            self.game_state = "build"
            reward = 30 + self.wave * 4
            self.gold += reward
            self.message = f"Wave {self.wave} cleared · +◈ {reward} bonus"
            self.update_best()

        for tower in self.towers:
            tower["cooldown"] -= dt
            if tower["cooldown"] > 0:
                continue
            stats = TOWER_DATA[tower["type"]]
            radius = stats["range"] + tower["level"] * 10
            attack_speed = .57 if any(e.get("boss") and e.get("boss_kind") == 3 and math.hypot(e["x"] - tower["x"], e["y"] - tower["y"]) < 112 for e in self.enemies) else 1
            targets = [e for e in self.enemies if math.hypot(e["x"] - tower["x"], e["y"] - tower["y"]) <= radius]
            if targets:
                target = max(targets, key=lambda e: e["progress"])
                self.fire_tower(tower, target)
                cooldown = stats["cooldown"] * (1 - tower["level"] * .12 if tower["type"] == "ranger" else 1)
                tower["cooldown"] = cooldown * attack_speed

        for shot in self.projectiles:
            target = shot["target"]
            if target.get("dead"):
                shot["dead"] = True
                continue
            dx, dy = target["x"] - shot["x"], target["y"] - shot["y"]
            distance = math.hypot(dx, dy)
            step = shot["speed"] * dt
            shot["trail"].append((shot["x"], shot["y"]))
            shot["trail"] = shot["trail"][-5:]
            if distance <= step + target["radius"]:
                shot["x"], shot["y"] = target["x"], target["y"]
                self.impact(shot)
                shot["dead"] = True
            else:
                shot["x"] += dx / distance * step
                shot["y"] += dy / distance * step
        self.projectiles = [shot for shot in self.projectiles if not shot.get("dead")]
        for particle in self.particles:
            particle["life"] -= dt
            particle["x"] += particle["vx"] * dt
            particle["y"] += particle["vy"] * dt
            damping = .12 ** dt
            particle["vx"] *= damping
            particle["vy"] *= damping
        self.particles = [p for p in self.particles if p["life"] > 0]
        self.effects = [effect for effect in self.effects if effect["expires"] > self.game_time]

    def update_best(self):
        if self.wave > self.best_wave:
            self.best_wave = self.wave
            self.save_best_score()

    def game_over(self):
        self.game_state = "gameover"
        self.selected_type = None
        self.selected_tower = None
        self.update_best()
        self.message = f"The gate has fallen. You reached wave {self.wave}."

    def tower_valid(self, x, y, tower_type):
        x -= FIELD.x
        y -= FIELD.y
        if not (28 <= x <= 932 and 28 <= y <= 572) or distance_to_route(x, y) < 49:
            return False
        if any(math.hypot(t["x"] - (x + FIELD.x), t["y"] - (y + FIELD.y)) < 47 for t in self.towers):
            return False
        return self.gold >= TOWER_DATA[tower_type]["cost"] and self.game_state != "gameover"

    def place_tower(self, x, y):
        if not self.selected_type:
            return
        stats = TOWER_DATA[self.selected_type]
        if self.tower_valid(x, y, self.selected_type):
            tower = {
                "id": self.next_id, "type": self.selected_type, "x": x, "y": y,
                "level": 0, "cooldown": 0, "aim": -math.pi / 2,
            }
            self.next_id += 1
            self.gold -= stats["cost"]
            self.towers.append(tower)
            self.selected_type = None
            self.selected_tower = tower
            self.message = f"{stats['name']} placed. Add more towers or start the next wave."
        elif self.gold < stats["cost"]:
            self.message = f"Not enough gold for {stats['name']} · need ◈ {stats['cost']}"
        else:
            self.message = "Find an open patch of grass beside the road."

    def upgrade_tower(self):
        tower = self.selected_tower
        if not tower or tower["level"] >= 2:
            return
        cost = round(TOWER_DATA[tower["type"]]["cost"] * (.85 + tower["level"] * .5))
        if self.gold >= cost:
            self.gold -= cost
            tower["level"] += 1
            tower["cooldown"] = min(tower["cooldown"], .15)

    def sell_tower(self):
        tower = self.selected_tower
        if tower and tower in self.towers:
            self.gold += math.floor(TOWER_DATA[tower["type"]]["cost"] * (.72 + tower["level"] * .25))
            self.towers.remove(tower)
            self.selected_tower = None

    def draw_background(self):
        self.screen.fill(color("#10151e"))
        pygame.draw.rect(self.screen, color("#171f2a"), (0, 0, WIDTH, 94))
        pygame.draw.line(self.screen, color("#2b3843"), (0, 94), (WIDTH, 94), 1)
        self.draw_text("✦  LAST LIGHT", 22, 16, "medium", "#f1d99c")
        self.draw_text("THE NIGHT IS COMING. BUILD YOUR DEFENSE.", 244, 21, "tiny", "#89999a")
        self.draw_text(f"BEST WAVE  {self.best_wave or '—'}", 1080, 22, "small", "#e4c681")
        self.draw_text(f"♥  {self.lives}", 24, 68, "medium", "#f09a94")
        self.draw_text(f"◈  {self.gold}", 142, 68, "medium", "#e7c77f")
        self.draw_text(f"⌁  WAVE {self.wave}", 270, 68, "medium", "#a8c8bb")
        self.draw_button(pygame.Rect(1058, 56, 90, 28), f"▶ {self.wave_speed}×", active=self.wave_speed == 2)
        self.draw_button(pygame.Rect(1158, 56, 94, 28), "Ⅱ PAUSE", active=self.game_state == "paused")

    def draw_button(self, rect, label, active=False, disabled=False, tint="#e6e9df"):
        fill = "#34453f" if active else "#29333d" if not disabled else "#202832"
        pygame.draw.rect(self.screen, color(fill), rect, border_radius=7)
        pygame.draw.rect(self.screen, color("#65756c" if active else "#3a4750"), rect, 1, border_radius=7)
        image = self.text(label, "small", tint if not disabled else "#67737a")
        self.screen.blit(image, image.get_rect(center=rect.center))

    def draw_world(self):
        surface = self.screen.subsurface(FIELD)
        surface.fill(color("#263f3e"))
        for band in range(12):
            shade = 7 - abs(5 - band)
            tint = color((37 + shade, 67 + shade, 61 + shade))
            pygame.draw.rect(surface, tint, (0, band * 50, FIELD.width, 50))
        for x, y, size in self.decorations:
            tint = ("#547466", "#607e6a", "#4c6c61")[(x * 3 + y) % 3]
            pygame.draw.circle(surface, color(tint), (x, y), size)
        for x, y, feature in self.terrain_features:
            if feature == "shrub":
                pygame.draw.ellipse(surface, color("#203a36"), (x - 15, y + 4, 31, 10))
                for ox, oy, radius, tint in (
                    (-8, 1, 8, "#355e4e"), (0, -4, 10, "#416c55"),
                    (9, 1, 7, "#315747"),
                ):
                    pygame.draw.circle(surface, color(tint), (x + ox, y + oy), radius)
                    pygame.draw.circle(surface, color("#6c9a6b"), (x + ox - 2, y + oy - 3), 2)
            elif feature == "stone":
                pygame.draw.ellipse(surface, color("#203534"), (x - 12, y + 5, 26, 8))
                stone = [(x - 10, y + 3), (x - 8, y - 5), (x - 2, y - 9),
                         (x + 8, y - 6), (x + 12, y + 2), (x + 7, y + 6), (x - 6, y + 6)]
                pygame.draw.polygon(surface, color("#506660"), stone)
                pygame.draw.lines(surface, color("#829083"), False, stone[1:4], 1)
            else:
                points = [(x, y - 12), (x + 7, y), (x, y + 10), (x - 7, y)]
                pygame.draw.polygon(surface, color("#286267"), points)
                pygame.draw.polygon(surface, color("#8bd8cd"), points, 1)
                pygame.draw.line(surface, color("#d1f2d2"), (x, y - 7), (x, y + 5), 1)
        for x, y, phase in self.grass_tufts:
            sway = math.sin(self.game_time * 1.5 + phase) * 2
            pygame.draw.line(surface, color("#547958"), (x, y), (x - 3 + sway, y - 7), 1)
            pygame.draw.line(surface, color("#71916a"), (x, y), (x + 3 + sway, y - 6), 1)
        for x, y, phase in self.fireflies:
            glow = .2 + .3 * (.5 + .5 * math.sin(self.game_time * 2 + phase))
            self.glow(FIELD.x + x, FIELD.y + y, "#f3d992", 10, glow)
            pygame.draw.circle(self.screen, color("#f4e6ac"), (FIELD.x + x, FIELD.y + y), 1)
        pygame.draw.rect(self.screen, color("#6c8e68"), FIELD, 1, border_radius=3)
        self.screen.set_clip(FIELD)
        points = [(FIELD.x + x, FIELD.y + y) for x, y in ROUTE]
        pygame.draw.lines(self.screen, color("#213735"), False, points, 82)
        pygame.draw.lines(self.screen, color("#273f3b"), False, points, 75)
        pygame.draw.lines(self.screen, color("#766e58"), False, points, 66)
        pygame.draw.lines(self.screen, color("#9a8a69"), False, points, 55)
        pygame.draw.lines(self.screen, color("#b29b72"), False, points, 2)
        pygame.draw.lines(self.screen, color("#ab9a77"), False, points, 3)
        pygame.draw.lines(self.screen, color("#8d8065"), False, points, 1)
        for (x1, y1), (x2, y2) in zip(ROUTE, ROUTE[1:]):
            length = math.hypot(x2 - x1, y2 - y1)
            steps = int(length // 24)
            for step in range(steps):
                t = (step + .5) / max(1, steps)
                px, py = FIELD.x + x1 + (x2 - x1) * t, FIELD.y + y1 + (y2 - y1) * t
                self.glow(px, py, "#d4bc8b", 8, .32)
                pygame.draw.circle(self.screen, color("#c3ad82"), (round(px), round(py)), 1)
        pulse = .5 + .5 * math.sin(self.game_time * 2.4)
        self.glow(FIELD.x + 16, FIELD.y + 145, "#f28b71", 25, .55 + pulse * .25)
        self.glow(FIELD.x + 942, FIELD.y + 455, "#efb17a", 42, .45 + pulse * .18)
        self.glow(FIELD.x + 910, FIELD.y + 450, "#db7169", 58, .22 + pulse * .12)
        gate = pygame.Rect(FIELD.x + 886, FIELD.y + 407, 49, 95)
        pygame.draw.rect(self.screen, color("#242b32"), gate, border_radius=8)
        pygame.draw.rect(self.screen, color("#d28a72"), gate, 2, border_radius=8)
        pygame.draw.rect(self.screen, color("#503943"), (gate.x + 7, gate.y + 14, 35, 76), border_radius=16)
        pygame.draw.arc(self.screen, color("#f3c58b"), (gate.x + 8, gate.y + 12, 33, 47), 0, math.pi, 2)
        pygame.draw.line(self.screen, color("#825960"), (gate.x + 7, gate.y + 76), (gate.x + 42, gate.y + 76), 2)
        self.draw_text("✦", FIELD.x + 910, FIELD.y + 443, "medium", "#ffe0a4", center=True)
        self.draw_text("GATE", FIELD.x + 910, FIELD.y + 477, "tiny", "#f3ba81", center=True)
        pygame.draw.circle(self.screen, color("#e99477"), (FIELD.x + 16, FIELD.y + 145), 5)
        self.draw_text("BREACH", FIELD.x + 16, FIELD.y + 87, "tiny", "#e99477", center=True)
        pygame.draw.circle(self.screen, color("#efb17a"), (FIELD.x + 942, FIELD.y + 455), 16, 2)
        self.screen.set_clip(None)

    def draw_tower(self, tower, selected=False):
        x, y = round(tower["x"]), round(tower["y"])
        stats = TOWER_DATA[tower["type"]]
        tint = color(stats["color"])
        animation_id = tower.get("id", 0)
        pulse = .75 + .25 * math.sin(self.game_time * 4 + animation_id)
        self.glow(x, y, stats["color"], 36, .4 * pulse)
        if selected:
            ring_radius = 24 + round(math.sin(self.game_time * 3) * 2)
            pygame.draw.circle(self.screen, color("#f3eac9"), (x, y), ring_radius, 2)
            pygame.draw.circle(self.screen, (*color("#f3eac9")[:3], 80), (x, y), ring_radius + 5, 1)
        pygame.draw.ellipse(self.screen, color("#182524"), (x - 21, y + 5, 42, 19))
        pygame.draw.circle(self.screen, color("#293b3b"), (x, y + 4), 19)
        pygame.draw.circle(self.screen, color("#809087"), (x, y + 4), 16, 1)
        pygame.draw.circle(self.screen, color("#405650"), (x, y + 4), 11, 1)
        pygame.draw.circle(self.screen, color("#91a28e"), (x - 8, y - 2), 2)
        if tower["type"] == "tesla":
            sway = math.sin(self.game_time * 5 + animation_id) * 2
            pygame.draw.lines(self.screen, color("#8a78b2"), False, [(x - 9, y + 8), (x - 5, y - 10), (x + 4, y - 16), (x + 10, y - 8), (x + 17, y - 15)], 4)
            pygame.draw.lines(self.screen, tint, False, [(x - 5, y + 3), (x - 2, y - 9), (x + 4, y - 13), (x + 9, y - 7), (x + 17, y - 13)], 2)
            self.glow(x + 18, y - 15 + sway, stats["color"], 20, .9)
            pygame.draw.circle(self.screen, color("#f1e6ff"), (x + 18, round(y - 15 + sway)), 5)
        elif tower["type"] == "frost":
            angle = tower.get("aim", -math.pi / 2)
            cx, cy = round(x + math.cos(angle) * 5), round(y - 3 + math.sin(angle) * 5)
            crystal = [(cx, cy - 17), (cx + 9, cy - 3), (cx + 5, cy + 10),
                       (cx, cy + 14), (cx - 5, cy + 10), (cx - 9, cy - 3)]
            self.glow(cx, cy, stats["color"], 23, .72 * pulse)
            pygame.draw.polygon(self.screen, color("#315766"), crystal)
            pygame.draw.polygon(self.screen, tint, crystal, 2)
            pygame.draw.line(self.screen, color("#e5fbff"), (cx, cy - 11), (cx, cy + 8), 2)
            pygame.draw.line(self.screen, color("#9eeaf3"), (cx, cy - 2), (cx + 7, cy - 7), 1)
            pygame.draw.line(self.screen, color("#9eeaf3"), (cx, cy + 1), (cx - 7, cy - 5), 1)
        else:
            angle = tower.get("aim", -math.pi / 2)
            length = 25 if tower["type"] == "ranger" else 22
            tip = (round(x + math.cos(angle) * length), round(y - 2 + math.sin(angle) * length))
            body_color = "#aa7949" if tower["type"] == "ranger" else "#67544c"
            thickness = 8 if tower["type"] == "ranger" else 13
            pygame.draw.line(self.screen, color("#18201f"), (x, y + 4), tip, thickness + 3)
            pygame.draw.line(self.screen, color(body_color), (x, y + 4), tip, thickness)
            pygame.draw.line(self.screen, tint, (x, y + 4), tip, 3 if tower["type"] == "ranger" else 5)
            self.glow(*tip, stats["color"], 15, .72 * pulse)
            pygame.draw.circle(self.screen, tint, tip, 6 if tower["type"] == "cannon" else 4)
            pygame.draw.circle(self.screen, color("#fff2cf"), tip, 2)
            if tower["type"] == "cannon":
                for side in (-1, 1):
                    wheel = (x + round(math.cos(angle + math.pi / 2) * 12 * side),
                             y + 4 + round(math.sin(angle + math.pi / 2) * 12 * side))
                    pygame.draw.circle(self.screen, color("#332d2c"), wheel, 5)
                    pygame.draw.circle(self.screen, color("#b17c5a"), wheel, 3, 1)
            else:
                bow = []
                for step in range(7):
                    t = step / 6
                    bx = x + math.cos(angle) * (9 + t * 7) + math.cos(angle + math.pi / 2) * math.sin(t * math.pi) * 7
                    by = y + math.sin(angle) * (9 + t * 7) + math.sin(angle + math.pi / 2) * math.sin(t * math.pi) * 7
                    bow.append((round(bx), round(by)))
                pygame.draw.lines(self.screen, color("#edc77f"), False, bow, 2)
                pygame.draw.line(self.screen, color("#f3e8c9"), bow[0], bow[-1], 1)
        if tower["level"]:
            badge = pygame.Rect(x - 13, y - 31, 26, 15)
            pygame.draw.rect(self.screen, color("#31352f"), badge, border_radius=6)
            pygame.draw.rect(self.screen, color("#a88e51"), badge, 1, border_radius=6)
            self.draw_text("★" * tower["level"], x, y - 24, "tiny", "#f0cf83", center=True)

    def draw_enemy(self, enemy):
        bob = math.sin(self.game_time * 7 + enemy["id"]) * 1.6
        x, y = round(enemy["x"]), round(enemy["y"] + bob)
        radius = enemy["radius"]
        tint = color(enemy["color"])
        if enemy["progress"] > 12:
            tail = []
            for step in range(5, 0, -1):
                tx, ty = route_position(max(0, enemy["progress"] - step * 8))
                tail.append((round(FIELD.x + tx), round(FIELD.y + ty)))
            if len(tail) > 1:
                pygame.draw.lines(self.screen, color(enemy["color"]), False, tail, 2 if enemy.get("boss") else 1)
        self.glow(x, y, enemy["color"], radius * (2 if enemy.get("boss") else 1) + 12, .7 if enemy.get("boss") else .45)
        pygame.draw.ellipse(self.screen, color("#17221f"), (x - radius, y + radius - 1, radius * 2, max(4, radius // 2)))
        if enemy.get("boss"):
            aura_radius = radius + 8 + round(math.sin(self.game_time * 3) * 2)
            pygame.draw.circle(self.screen, color("#4b364c"), (x, y), aura_radius, 1)
            pygame.draw.circle(self.screen, tint, (x, y), radius + 5, 2)
            points = []
            for i in range(12):
                r = radius + 2 if i % 2 == 0 else radius * .78
                angle = i / 12 * math.tau
                points.append((x + math.cos(angle) * r, y + math.sin(angle) * r))
            pygame.draw.polygon(self.screen, color("#201f2b"), points)
            pygame.draw.polygon(self.screen, tint, points, 2)
            for mote in range(3):
                angle = self.game_time * 1.8 + mote * math.tau / 3
                mx, my = round(x + math.cos(angle) * (radius + 11)), round(y + math.sin(angle) * (radius + 11))
                self.glow(mx, my, enemy["color"], 10, .7)
                pygame.draw.circle(self.screen, color("#fff1ce"), (mx, my), 2)
            self.glow(x - 7, y - 3, enemy["color"], 10, 1)
            self.glow(x + 7, y - 3, enemy["color"], 10, 1)
            pygame.draw.circle(self.screen, color("#fff4da"), (x - 7, y - 3), 2)
            pygame.draw.circle(self.screen, color("#fff4da"), (x + 7, y - 3), 2)
            self.draw_text(enemy["symbol"], x, y + 17, "small", "#fff4da", center=True)
            bar = pygame.Rect(x - 33, y - radius - 15, 66, 7)
            pygame.draw.rect(self.screen, color("#12141a"), bar, border_radius=3)
            bar.width = max(0, round(66 * enemy["hp"] / enemy["max_hp"]))
            pygame.draw.rect(self.screen, tint, bar, border_radius=3)
            pygame.draw.rect(self.screen, color("#f8e5bd"), (bar.x, bar.y, bar.width, 1), border_radius=1)
        else:
            if enemy.get("type") == "runner":
                direction = route_position(min(ROUTE_LENGTH, enemy["progress"] + 3))
                dx, dy = direction[0] - route_position(enemy["progress"])[0], direction[1] - route_position(enemy["progress"])[1]
                angle = math.atan2(dy, dx)
                front = (round(x + math.cos(angle) * (radius + 3)), round(y + math.sin(angle) * (radius + 3)))
                rear_a = (round(x + math.cos(angle + 2.4) * radius), round(y + math.sin(angle + 2.4) * radius))
                rear_b = (round(x + math.cos(angle - 2.4) * radius), round(y + math.sin(angle - 2.4) * radius))
                pygame.draw.polygon(self.screen, tint, (front, rear_a, rear_b))
                pygame.draw.polygon(self.screen, color("#ffe0a5"), (front, rear_a, rear_b), 1)
                self.glow(x, y, enemy["color"], 12, .65)
            elif enemy.get("type") == "brute":
                armor = [(x, y - radius - 2), (x + radius, y - radius // 2),
                         (x + radius - 2, y + radius // 2), (x + radius // 2, y + radius),
                         (x - radius // 2, y + radius), (x - radius + 2, y + radius // 2),
                         (x - radius, y - radius // 2)]
                pygame.draw.polygon(self.screen, tint, armor)
                pygame.draw.polygon(self.screen, color("#f2c2a0"), armor, 1)
                pygame.draw.line(self.screen, color("#663e4a"), (x - 7, y + 3), (x + 7, y + 3), 3)
                pygame.draw.circle(self.screen, color("#ffe6c1"), (x - 4, y - 3), 2)
                pygame.draw.circle(self.screen, color("#ffe6c1"), (x + 4, y - 3), 2)
            else:
                wobble = math.sin(self.game_time * 5 + enemy["id"]) * 2
                pygame.draw.circle(self.screen, tint, (x, round(y + wobble)), radius + 1)
                pygame.draw.circle(self.screen, color("#e8c5f0"), (x - radius // 3, round(y - radius // 3 + wobble)), max(2, radius // 3))
                pygame.draw.circle(self.screen, color("#2a1b33"), (x - 3, round(y - 2 + wobble)), 2)
                pygame.draw.circle(self.screen, color("#2a1b33"), (x + 3, round(y - 2 + wobble)), 2)
            if enemy["hp"] < enemy["max_hp"]:
                bar = pygame.Rect(x - radius, y - radius - 6, radius * 2, 3)
                pygame.draw.rect(self.screen, color("#15171b"), bar)
                bar.width = max(0, round(bar.width * enemy["hp"] / enemy["max_hp"]))
                pygame.draw.rect(self.screen, color("#f3d790"), bar)
        if enemy["slow_until"] > self.game_time:
            pygame.draw.circle(self.screen, color("#97ebf6"), (x, y), radius + 3, 1)

    def draw_game(self):
        self.draw_background()
        self.draw_world()
        if self.selected_tower in self.towers:
            tower = self.selected_tower
            radius = TOWER_DATA[tower["type"]]["range"] + tower["level"] * 10
            pulse = round(math.sin(self.game_time * 2.5) * 2)
            self.draw_range(tower["x"], tower["y"], radius + pulse, TOWER_DATA[tower["type"]]["color"], .07)
            pygame.draw.circle(self.screen, color("#6d9d83"), (round(tower["x"]), round(tower["y"])), radius + pulse, 1)
            pygame.draw.circle(self.screen, color("#456b5b"), (round(tower["x"]), round(tower["y"])), radius + pulse - 2, 1)
        for tower in self.towers:
            self.draw_tower(tower, tower is self.selected_tower)
        for enemy in self.enemies:
            self.draw_enemy(enemy)
        for shot in self.projectiles:
            tint = color(shot["color"])
            for index, point in enumerate(shot["trail"]):
                ratio = (index + 1) / len(shot["trail"])
                pygame.draw.circle(self.screen, tint, (round(point[0]), round(point[1])), max(1, round(3 * ratio)))
            self.glow(shot["x"], shot["y"], shot["color"], 14, .95)
            pygame.draw.circle(self.screen, color("#fff4d6"), (round(shot["x"]), round(shot["y"])), 3)
        for effect in self.effects:
            duration = .38 if effect["type"] == "blast" else .6 if effect["type"] == "pulse" else .2 if effect["type"] == "impact" else .12 if effect["type"] == "muzzle" else .65
            progress = 1 - (effect["expires"] - self.game_time) / duration
            if effect["type"] == "lightning":
                points = [(round(x), round(y)) for x, y in effect["points"]]
                if len(points) > 1:
                    pygame.draw.lines(self.screen, color("#f7efff"), False, points, 5)
                    pygame.draw.lines(self.screen, color(effect["color"]), False, points, 2)
                    for x, y in points[1:]:
                        self.glow(x, y, effect["color"], 22, max(.15, 1 - progress))
            else:
                radius = effect.get("radius", 28)
                center = (round(effect["x"]), round(effect["y"]))
                if effect["type"] == "muzzle":
                    self.glow(*center, effect["color"], max(3, round(radius * (1 - progress))), 1 - progress)
                    pygame.draw.circle(self.screen, color("#fff0c5"), center, max(1, round(4 * (1 - progress))))
                else:
                    ring_radius = max(1, round(radius * (progress if effect["type"] == "blast" else .4 + progress)))
                    self.glow(*center, effect["color"], max(4, round(radius * .45)), max(.12, 1 - progress))
                    pygame.draw.circle(self.screen, color(effect["color"]), center, ring_radius, max(1, round(3 * (1 - progress))))
                    if effect["type"] in ("blast", "impact"):
                        pygame.draw.circle(self.screen, color("#fff0cf"), center, max(1, round(ring_radius * .55)), 1)
        for particle in self.particles:
            alpha = max(0, min(1, particle["life"] / particle["max_life"]))
            radius = max(1, round(particle["size"] * alpha))
            self.glow(particle["x"], particle["y"], particle["color"], max(4, radius * 3), alpha * .8)
            pygame.draw.circle(self.screen, color(particle["color"]), (round(particle["x"]), round(particle["y"])), radius)
        if self.selected_type:
            mx, my = self.mouse
            stats = TOWER_DATA[self.selected_type]
            valid = self.tower_valid(mx, my, self.selected_type)
            if FIELD.collidepoint(mx, my):
                self.draw_range(mx, my, stats["range"], "#9be8b5" if valid else "#f49b8c", .11)
                pygame.draw.circle(self.screen, color("#9be8b5" if valid else "#f49b8c"), (mx, my), stats["range"], 1)
                ghost = {"type": self.selected_type, "x": mx, "y": my, "level": 0, "id": 0}
                self.draw_tower(ghost)
                pygame.draw.circle(self.screen, color("#b7f6c7" if valid else "#f49b8c"), (mx, my), 4)
        self.draw_sidebar()
        if self.game_state in ("intro", "paused", "gameover"):
            self.draw_overlay()

    def draw_range(self, x, y, radius, tint, opacity):
        size = radius * 2 + 2
        overlay = pygame.Surface((size, size), pygame.SRCALPHA)
        shade = color(tint)
        pygame.draw.circle(overlay, (shade.r, shade.g, shade.b, round(255 * opacity)), (radius + 1, radius + 1), radius)
        self.screen.blit(overlay, (round(x) - radius - 1, round(y) - radius - 1))

    def draw_sidebar(self):
        panel = pygame.Rect(1000, 112, 260, 600)
        pygame.draw.rect(self.screen, color("#171f27"), panel, border_radius=12)
        self.draw_text("YOUR ARSENAL", 1018, 130, "tiny", "#a9c8b5")
        self.draw_text("Build a tower", 1018, 151, "medium")
        self.draw_text(f"{len(self.towers)} BUILT", 1175, 158, "tiny", "#b3a77f")
        self.tower_rects = {}
        for index, (key, stats) in enumerate(TOWER_DATA.items()):
            rect = pygame.Rect(1016, 190 + index * 58, 228, 48)
            self.tower_rects[key] = rect
            selected = self.selected_type == key
            pygame.draw.rect(self.screen, color("#34453f" if selected else "#222d36"), rect, border_radius=7)
            pygame.draw.rect(self.screen, color("#6c8a76" if selected else "#34414a"), rect, 1, border_radius=7)
            self.draw_text(stats["name"], 1027, rect.y + 6, "small", stats["color"])
            self.draw_text(stats["role"], 1027, rect.y + 27, "tiny", "#a3aaa5")
            self.draw_text(f"◈ {stats['cost']}", 1183, rect.y + 17, "small", "#e7c77f")

        self.draw_text("FIELD INTEL", 1018, 435, "tiny", "#a9c8b5")
        tower = self.selected_tower
        if tower in self.towers:
            stats = TOWER_DATA[tower["type"]]
            self.draw_text(f"{stats['name']} · LV {tower['level'] + 1}", 1018, 459, "medium", stats["color"])
            self.draw_text(f"{round(stats['damage'] * (1 + .42 * tower['level']))} damage · {stats['range'] + tower['level'] * 10} range", 1018, 490, "tiny")
            self.action_rects = {}
            if tower["level"] < 2:
                cost = round(stats["cost"] * (.85 + tower["level"] * .5))
                rect = pygame.Rect(1018, 521, 105, 34)
                self.action_rects["upgrade"] = rect
                self.draw_button(rect, f"UPGRADE {cost}", disabled=self.gold < cost, tint="#e7c77f")
            rect = pygame.Rect(1131, 521, 112, 34)
            self.action_rects["sell"] = rect
            value = math.floor(stats["cost"] * (.72 + tower["level"] * .25))
            self.draw_button(rect, f"SELL {value}", tint="#f09a94")
        else:
            self.action_rects = {}
            self.draw_text("Hold the line", 1018, 459, "medium")
            self.draw_text("Shades follow the road.", 1018, 490, "small", "#a3aaa5")
            self.draw_text("Place towers beside the path.", 1018, 512, "small", "#a3aaa5")
        self.draw_text("QUICK BUILD  1  2  3  4", 1018, 579, "tiny", "#b3a77f")
        self.draw_text("ESC cancels · SPACE starts wave", 1018, 600, "tiny", "#a3aaa5")
        self.draw_button(pygame.Rect(1018, 644, 226, 48), f"⚔  START WAVE {self.wave + 1}", disabled=self.game_state != "build", tint="#f0cf83")
        self.draw_text(self.message, 28, 724, "small", "#d5d1bc")

    def draw_overlay(self):
        veil = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        veil.fill((7, 12, 17, 190))
        self.screen.blit(veil, (0, 0))
        if self.game_state == "intro":
            eyebrow, title, copy, button = "A DEFENSE GAME ABOUT HOLDING ON", "Last Light", "Four towers. A winding road. Legendary bosses every fifth wave.", "ENTER THE FIELD"
        elif self.game_state == "paused":
            eyebrow, title, copy, button = "TAKE A BREATH", "Battle paused", "Your defenders are waiting. Pick up where you left off.", "RESUME DEFENSE"
        else:
            eyebrow, title, copy, button = "THE GATE HAS FALLEN", "The night wins.", f"You reached wave {self.wave}. Defend the gate again.", "DEFEND AGAIN"
        self.draw_text(eyebrow, WIDTH // 2, 278, "small", "#c9b078", center=True)
        self.draw_text(title, WIDTH // 2, 325, "title", "#f1e6cc", center=True)
        self.draw_text(copy, WIDTH // 2, 378, "body", "#b8c1b9", center=True)
        self.overlay_button = pygame.Rect(WIDTH // 2 - 100, 419, 200, 48)
        self.draw_button(self.overlay_button, button, tint="#f0cf83")

    def pause_toggle(self):
        if self.game_state in ("build", "wave"):
            self.paused_from = self.game_state
            self.game_state = "paused"
        elif self.game_state == "paused":
            self.game_state = self.paused_from

    def handle_click(self, pos):
        if self.game_state in ("intro", "paused", "gameover"):
            if self.overlay_button.collidepoint(pos):
                if self.game_state == "intro":
                    self.game_state = "build"
                elif self.game_state == "paused":
                    self.game_state = self.paused_from
                else:
                    self.reset_state()
                    self.game_state = "build"
                    self.message = "Select a tower, then place it on the grass."
            return
        if pygame.Rect(1058, 56, 90, 28).collidepoint(pos):
            self.wave_speed = 2 if self.wave_speed == 1 else 1
            return
        if pygame.Rect(1158, 56, 94, 28).collidepoint(pos):
            self.pause_toggle()
            return
        for key, rect in self.tower_rects.items():
            if rect.collidepoint(pos):
                if self.gold >= TOWER_DATA[key]["cost"] or self.selected_type == key:
                    self.selected_type = None if self.selected_type == key else key
                    self.selected_tower = None
                return
        if pygame.Rect(1018, 644, 226, 48).collidepoint(pos):
            self.start_wave()
            return
        for action, rect in self.action_rects.items():
            if rect.collidepoint(pos):
                self.upgrade_tower() if action == "upgrade" else self.sell_tower()
                return
        if FIELD.collidepoint(pos):
            if self.selected_type:
                self.place_tower(*pos)
            else:
                tower = next((t for t in reversed(self.towers) if math.hypot(t["x"] - pos[0], t["y"] - pos[1]) <= 22), None)
                self.selected_tower = tower

    def run(self):
        while self.running:
            dt = min(self.clock.tick(60) / 1000, .045)
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.MOUSEMOTION:
                    self.mouse = event.pos
                elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                    self.handle_click(event.pos)
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE and self.selected_type:
                        self.selected_type = None
                    elif event.key == pygame.K_SPACE and self.game_state == "build":
                        self.start_wave()
                    elif event.key == pygame.K_p:
                        self.pause_toggle()
                    elif pygame.K_1 <= event.key <= pygame.K_4 and self.game_state not in ("intro", "gameover"):
                        key = list(TOWER_DATA)[event.key - pygame.K_1]
                        if self.gold >= TOWER_DATA[key]["cost"] or self.selected_type == key:
                            self.selected_type = None if self.selected_type == key else key
                            self.selected_tower = None
            self.update(dt)
            self.draw_game()
            pygame.display.flip()
        pygame.quit()


if __name__ == "__main__":
    LastLight().run()
