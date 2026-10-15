import json
import logging
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
WEB_ROOT = ROOT / "static"
SCORE_FILE = ROOT / "data" / "tower_defense.json"
MAX_REQUEST_SIZE = 1024


class GameHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/api/best":
            self.send_json({"best": self.read_best_score()})
            return
        if self.path.startswith("/api/"):
            self.send_error(404, "API endpoint not found")
            return
        if self.path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/best":
            self.send_error(404, "API endpoint not found")
            return

        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(400, "Invalid content length")
            return
        if size <= 0 or size > MAX_REQUEST_SIZE:
            self.send_error(400, "Invalid request size")
            return

        try:
            payload = json.loads(self.rfile.read(size))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.send_error(400, "Invalid JSON")
            return
        score = payload.get("score") if isinstance(payload, dict) else None
        if type(score) is not int or score < 0:
            self.send_error(400, "Score must be a non-negative integer")
            return

        best = max(score, self.read_best_score())
        try:
            SCORE_FILE.parent.mkdir(parents=True, exist_ok=True)
            SCORE_FILE.write_text(json.dumps({"best": best}) + "\n", encoding="utf-8")
        except OSError:
            logging.exception("Could not save best score")
            self.send_error(500, "Could not save best score")
            return
        self.send_json({"best": best})

    def read_best_score(self):
        try:
            data = json.loads(SCORE_FILE.read_text(encoding="utf-8"))
        except FileNotFoundError:
            return 0
        except (OSError, json.JSONDecodeError):
            logging.exception("Could not read best score")
            self.send_error(500, "Could not read best score")
            raise
        best = data.get("best") if isinstance(data, dict) else None
        if type(best) is not int or best < 0:
            self.send_error(500, "Best score data is invalid")
            raise ValueError("Best score data is invalid")
        return best

    def send_json(self, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
    server = ThreadingHTTPServer(("127.0.0.1", 8000), GameHandler)
    print("Last Light is ready at http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    finally:
        server.server_close()
