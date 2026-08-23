#!/usr/bin/env python3
"""
JARVIS — the server (Prompts 2, 5, 6)

A tiny standard-library web server. It does three things:

  • Serves ONLY the viewer/ folder as static files (port 4700).
  • POST /chat     — answers a question from the top-matching notes, in the
                     voice of a dry British butler. Returns {answer, nodes}.
  • POST /remember — writes a new markdown note into a captures/ folder inside
                     the notes directory and returns the newly-born node so the
                     galaxy can add it live.

Security:
  • config.json (with your API key) lives in the project root and is NEVER
    inside viewer/, so it can never be requested through the browser.
  • The static handler refuses any path that escapes viewer/.

No pip installs — standard library only.
"""

import os
import re
import io
import json
import time
import http.server
import socketserver
import subprocess
import urllib.request
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
VIEWER_DIR = os.path.join(HERE, "viewer")
CONFIG_PATH = os.path.join(HERE, "config.json")
GRAPH_JS = os.path.join(VIEWER_DIR, "graph-data.js")
PORT = 4700

WORD_RE = re.compile(r"[A-Za-z0-9']+")
STOPWORDS = set("""a an the of to in on for and or but with without from into is are was were be been
being this that these those it its as at by our your my me we you they he she his her their them then
than so if not no do does did what which who whom whose how when where why about over under again more
most some any all can could should would will just like get got make made use used note notes""".split())

# --------------------------------------------------------------------------- #
#  Graph / notes loading
# --------------------------------------------------------------------------- #
def load_graph():
    """Parse the GRAPH object and NOTES_DIR out of viewer/graph-data.js."""
    with open(GRAPH_JS, "r", encoding="utf-8") as fh:
        src = fh.read()
    m = re.search(r"const GRAPH\s*=\s*(\{.*?\});\s*\n", src, re.DOTALL)
    if not m:
        raise RuntimeError("graph-data.js not built yet — run:  python3 build.py")
    graph = json.loads(m.group(1))
    nd = re.search(r'const NOTES_DIR\s*=\s*("(?:[^"\\]|\\.)*")', src)
    notes_dir = json.loads(nd.group(1)) if nd else os.path.join(HERE, "notes")
    return graph, notes_dir


def read_note_body(notes_dir, path):
    full = os.path.join(notes_dir, path)
    try:
        with open(full, "r", encoding="utf-8", errors="ignore") as fh:
            return fh.read()
    except OSError:
        return ""


def tokenize(text):
    return [w for w in (t.lower() for t in WORD_RE.findall(text)) if w not in STOPWORDS and len(w) > 2]


def score_notes(question, nodes):
    """Keyword-overlap score. Title matches weigh extra."""
    q = set(tokenize(question))
    scored = []
    for n in nodes:
        title_words = set(tokenize(n["label"]))
        body_words = set(tokenize(n.get("excerpt", "")))
        title_hits = len(q & title_words)
        body_hits = len(q & body_words)
        score = title_hits * 3 + body_hits
        if score > 0:
            scored.append((score, n))
    scored.sort(key=lambda s: s[0], reverse=True)
    return scored


# --------------------------------------------------------------------------- #
#  Personality (Prompt 5)
# --------------------------------------------------------------------------- #
SYSTEM_PROMPT = """You are JARVIS, the user's personal AI second brain — a dry, impeccably \
polite British butler with a razor wit. A few rules of the house:

• Address the user as "sir" occasionally — not every sentence. Wit over servility.
• One genuinely funny, understated line beats three bland ones.
• When answering a question about the user's NOTES: reply in ONE witty sentence \
plus the relevant facts. Never recite the note back verbatim — it is already on \
screen in front of them.
• Answer ONLY from the provided notes. If the notes don't cover it, say so plainly \
(with a touch of dry humour) rather than inventing anything.
• For small talk, jokes, or greetings where no note is relevant, just be charming \
and brief — do not pretend to cite notes.
Keep every reply to 2–3 sentences at most."""


def clean_reply(text):
    """Strip note markup so the answer reads and speaks naturally."""
    text = re.sub(r"\[\[([^\]]+)\]\]", r"\1", text)   # [[wikilinks]] -> plain
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)  # **bold** / *italic*
    text = re.sub(r"`([^`]+)`", r"\1", text)
    return text.strip()


def build_user_prompt(question, context_notes):
    if context_notes:
        blocks = []
        for n in context_notes:
            blocks.append(f"### {n['label']} (folder: {n['group']})\n{n['_body']}")
        notes_blob = "\n\n".join(blocks)
        return (f"Relevant notes:\n\n{notes_blob}\n\n---\n"
                f"The user asks: {question}")
    return (f"(No notes matched this — it's small talk or off-topic.)\n"
            f"The user says: {question}")


# --------------------------------------------------------------------------- #
#  Model call — Anthropic API, with a claude -p fallback
# --------------------------------------------------------------------------- #
def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
        return json.load(fh)


def call_anthropic(system, history, model, api_key):
    payload = {
        "model": model,
        "max_tokens": 400,
        "system": system,
        "messages": history,
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "content-type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    parts = [b.get("text", "") for b in data.get("content", []) if b.get("type") == "text"]
    return "".join(parts).strip()


def call_claude_cli(system, history, model):
    """Fallback: shell out to `claude -p` (uses the Claude Code subscription)."""
    convo = system + "\n\n"
    for turn in history:
        who = "User" if turn["role"] == "user" else "You"
        convo += f"{who}: {turn['content']}\n"
    convo += "You:"
    try:
        out = subprocess.run(
            ["claude", "-p", convo],
            capture_output=True, text=True, timeout=120,
        )
        if out.returncode == 0 and out.stdout.strip():
            return out.stdout.strip()
        return "I'm afraid the Claude CLI didn't answer, sir. " + (out.stderr or "").strip()[:200]
    except FileNotFoundError:
        return ("No API key is configured and the `claude` CLI isn't on my PATH, sir. "
                "Add your key to config.json.")
    except subprocess.TimeoutExpired:
        return "The CLI took too long to think, sir. Do try again."


def answer(system, history, cfg):
    api_key = (cfg.get("api_key") or "").strip()
    model = cfg.get("model") or "claude-opus-4-8"
    placeholder = (not api_key) or api_key.upper().startswith("PUT-YOUR-KEY")
    if placeholder:
        return call_claude_cli(system, history, model)
    try:
        return call_anthropic(system, history, model, api_key)
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")[:300]
        return f"The brain returned an error ({e.code}), sir: {detail}"
    except Exception as e:  # noqa: BLE001
        return f"I couldn't reach the brain, sir: {e}"


# --------------------------------------------------------------------------- #
#  Total Recall (Prompt 6)
# --------------------------------------------------------------------------- #
def slug_title(text):
    body = re.sub(r"^\s*remember\s+(that\s+)?", "", text, flags=re.IGNORECASE).strip()
    words = body.split()
    title = " ".join(words[:7]).strip(" .,:;!?") or "Captured note"
    # Title-case for a clean star label, but leave existing acronyms alone.
    title = " ".join(w if (w.isupper() and len(w) > 1) else w.capitalize()
                     for w in title.split())
    return title, body


def safe_filename(title):
    # Keep spaces so the galaxy label reads naturally (like the other notes).
    name = re.sub(r"[^A-Za-z0-9 _-]", "", title).strip()
    return (name or "Note")[:60]


def do_remember(text, notes_dir):
    title, body = slug_title(text)
    captures = os.path.join(notes_dir, "captures")
    os.makedirs(captures, exist_ok=True)
    fname = safe_filename(title) + ".md"
    dest = os.path.join(captures, fname)
    # Avoid clobbering an existing capture.
    i = 2
    while os.path.exists(dest):
        dest = os.path.join(captures, safe_filename(title) + f"-{i}.md")
        i += 1
    stamp = time.strftime("%Y-%m-%d %H:%M")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write(f"# {title}\n\n{body}\n\n*Captured {stamp} by voice.*\n")

    # Regenerate the galaxy so the new star persists across reloads.
    subprocess.run(
        ["python3", os.path.join(HERE, "build.py"), notes_dir],
        capture_output=True, text=True,
    )
    graph, _ = load_graph()
    rel = os.path.relpath(dest, notes_dir).replace(os.sep, "/")
    new_node = next((n for n in graph["nodes"] if n.get("path") == rel), None)
    if not new_node:
        return {"ok": False, "answer": "I wrote the note, sir, but couldn't find it in the galaxy."}

    # Find the most-related existing node by keyword overlap.
    others = [n for n in graph["nodes"] if n["id"] != new_node["id"]]
    scored = score_notes(body + " " + title, others)
    near = scored[0][1]["id"] if scored else None
    return {
        "ok": True,
        "id": new_node["id"],
        "label": new_node["label"],
        "group": new_node["group"],
        "excerpt": new_node["excerpt"],
        "path": new_node["path"],
        "near": near,
        "answer": f"Noted, sir: “{title}.” A new star has joined the firmament.",
    }


# --------------------------------------------------------------------------- #
#  HTTP handler
# --------------------------------------------------------------------------- #
SESSIONS = {}          # session id -> list of {role, content}
MAX_TURNS = 12         # keep ~6 exchanges of history


class Handler(http.server.BaseHTTPRequestHandler):
    server_version = "JarvisGalaxy/1.0"

    # ---- static: serve ONLY viewer/ ----
    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/", ""):
            path = "/index.html"
        # Resolve against viewer/ and refuse anything that escapes it.
        rel = path.lstrip("/")
        target = os.path.normpath(os.path.join(VIEWER_DIR, rel))
        if not (target == VIEWER_DIR or target.startswith(VIEWER_DIR + os.sep)):
            return self._send(403, b"Forbidden", "text/plain")
        if not os.path.isfile(target):
            return self._send(404, b"Not found", "text/plain")
        ctype = self._guess_type(target)
        try:
            with open(target, "rb") as fh:
                body = fh.read()
        except OSError:
            return self._send(404, b"Not found", "text/plain")
        self._send(200, body, ctype)

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw.decode("utf-8") or "{}")
        except (ValueError, TypeError):
            return self._json(400, {"error": "bad json"})

        if path == "/chat":
            return self.handle_chat(data)
        if path == "/remember":
            return self.handle_remember(data)
        return self._json(404, {"error": "no such endpoint"})

    # ---- /chat ----
    def handle_chat(self, data):
        question = (data.get("message") or "").strip()
        session = data.get("session") or "default"
        if not question:
            return self._json(400, {"error": "empty message"})

        graph, notes_dir = load_graph()
        scored = score_notes(question, graph["nodes"])
        top = scored[:6]

        # Attach full note bodies for the model's context.
        context_notes = []
        for _score, n in top:
            nn = dict(n)
            nn["_body"] = read_note_body(notes_dir, n["path"]) or n.get("excerpt", "")
            context_notes.append(nn)

        # Only surface source nodes to the client when the match is real
        # (so small talk doesn't drag the camera around — Prompt 5). A couple of
        # coincidental body-word hits (e.g. "good evening") must NOT count; we
        # require a genuine topical match before flying anywhere.
        client_nodes = []
        if top:
            best = top[0][0]
            if best >= 3:
                floor = max(3, best * 0.5)
                client_nodes = [n["id"] for score, n in top if score >= floor]

        # Per-session history.
        hist = SESSIONS.setdefault(session, [])
        hist.append({"role": "user", "content": build_user_prompt(question, context_notes)})
        del hist[:-MAX_TURNS]

        cfg = load_config()
        reply = clean_reply(answer(SYSTEM_PROMPT, hist, cfg))
        hist.append({"role": "assistant", "content": reply})
        del hist[:-MAX_TURNS]

        return self._json(200, {"answer": reply, "nodes": client_nodes})

    # ---- /remember ----
    def handle_remember(self, data):
        text = (data.get("text") or "").strip()
        if not text:
            return self._json(400, {"error": "empty"})
        _graph, notes_dir = load_graph()
        result = do_remember(text, notes_dir)
        return self._json(200, result)

    # ---- helpers ----
    def _guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
            ".ico": "image/x-icon",
        }.get(ext, "application/octet-stream")

    def _send(self, code, body, ctype):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, code, obj):
        self._send(code, json.dumps(obj).encode("utf-8"), "application/json; charset=utf-8")

    def log_message(self, fmt, *args):
        # Quiet, single-line logging.
        print("  " + (fmt % args))


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    if not os.path.isfile(GRAPH_JS):
        print("graph-data.js not found — building the galaxy first...")
        subprocess.run(["python3", os.path.join(HERE, "build.py")])
    graph, notes_dir = load_graph()
    print("=" * 58)
    print("  JARVIS galaxy server")
    print(f"  notes:  {notes_dir}")
    print(f"  nodes:  {len(graph['nodes'])}")
    cfg = load_config()
    key = (cfg.get("api_key") or "").strip()
    if (not key) or key.upper().startswith("PUT-YOUR-KEY"):
        print("  brain:  claude CLI fallback (no API key in config.json)")
    else:
        print(f"  brain:  Anthropic API — {cfg.get('model')}")
    print(f"\n  ▶  Open in Chrome:  http://localhost:{PORT}")
    print("=" * 58)
    with ThreadingServer(("0.0.0.0", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  shutting down.")


if __name__ == "__main__":
    main()
