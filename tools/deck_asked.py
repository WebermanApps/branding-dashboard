#!/usr/bin/env python3
"""deck_asked.py [--style-swipe DIR]  (Branding, Oct 17 2026)
Writes decks/asked.json = {"updated", "asked": {deck id: ISO time the deck was asked/built}} for the main deck board
(decks/index.html + decks/board.js, 'Agent · Asked Oct 17' line and newest-asked-first order).
Source per decks.json entry: requested_at / asked on the entry, else the style-swipe deck JSON generated_at (deck id, or the
page slug from decks/pages.json), else the time this entry first appeared in decks.json (git log). Re-run after decks.json changes."""
import json, os, re, subprocess, sys, datetime as dt
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]
SS = a[a.index("--style-swipe") + 1] if "--style-swipe" in a else "/workspace/style-swipe"
D = json.load(open(os.path.join(ROOT, "decks.json")))
pages = json.load(open(os.path.join(SS, "decks/pages.json")))
slug2id = {v: k for k, v in pages.items()}
def gen(i):
    p = os.path.join(SS, "decks", i + ".json")
    if os.path.exists(p):
        try: return json.load(open(p)).get("generated_at")
        except Exception: return None
def first_seen(i):
    try:
        out = subprocess.run(["git", "-C", ROOT, "log", "--reverse", "--format=%aI", "-S", f'"id": "{i}"', "--", "decks.json"], capture_output=True, text=True).stdout.split()
        return out[0] if out else None
    except Exception: return None
asked = {}
for d in D.get("decks", []):
    i = d.get("id")
    if not i: continue
    v = d.get("requested_at") or d.get("asked")
    if not v and d.get("url"):
        m = re.search(r"style-swipe/([^/?#]+)/", d["url"])
        if m and m.group(1) in slug2id: v = gen(slug2id[m.group(1)])
    v = v or gen(i) or first_seen(i)
    if v: asked[i] = v
out = {"updated": dt.datetime.now().astimezone().isoformat(timespec="seconds"), "asked": asked}
json.dump(out, open(os.path.join(ROOT, "decks/asked.json"), "w"), indent=1, ensure_ascii=False)
print(f"asked.json: {len(asked)} of {len(D.get('decks', []))} decks dated")
