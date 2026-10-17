#!/usr/bin/env python3
"""deck_asked.py [--style-swipe DIR]  (Branding, Oct 17 2026)
Writes decks/asked.json = {"updated", "asked": {deck id: ISO time the deck was asked/built}, "agent": {deck id: owning agent}}
for the main deck board (decks/index.html + decks/board.js, bold 'Branding · asked Oct 17' line, same as Max's Picks, and newest-asked-first order).
Agent per entry: agent / owner / by on the entry (e.g. video-v2 = video-photo -> 'Video & Photo'), else the style-swipe deck JSON submit_agent, else the category when it is an agent
(UpKeep, WellNest, Prop, ...), else Branding (Branding builds the Dashboards / Daily / Variety / Jokes / Jane Amex decks).
Source per decks.json entry: requested_at / asked on the entry, else the style-swipe deck JSON generated_at (deck id, or the
page slug from decks/pages.json), else the time this entry first appeared in decks.json (git log). Re-run after decks.json changes."""
import json, os, re, subprocess, sys, datetime as dt
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]
SS = a[a.index("--style-swipe") + 1] if "--style-swipe" in a else "/workspace/style-swipe"
D = json.load(open(os.path.join(ROOT, "decks.json")))
pages = json.load(open(os.path.join(SS, "decks/pages.json")))
slug2id = {v: k for k, v in pages.items()}
def deck_json(i):
    p = os.path.join(SS, "decks", i + ".json")
    if os.path.exists(p):
        try: return json.load(open(p))
        except Exception: return {}
    return {}
def gen(i): return deck_json(i).get("generated_at")
AGENT_CATS = {"upkeep", "prop", "construction", "scout", "wellnest", "blueprint", "thai", "blog", "portfolio", "japan-cottage", "miles", "security"}
NAMES = {"upkeep": "UpKeep", "wellnest": "WellNest", "grok-bot": "Grok Bot", "japan-cottage": "Japan Cottage", "branding": "Branding", "video-photo": "Video & Photo"}
CATNAME = {c["slug"]: c["name"] for c in D.get("categories", [])}
def nice(x):
    k = str(x).strip().lower().replace(" ", "-")
    return NAMES.get(k) or CATNAME.get(k) or str(x).replace("-", " ").title()
def first_seen(i):
    try:
        out = subprocess.run(["git", "-C", ROOT, "log", "--reverse", "--format=%aI", "-S", f'"id": "{i}"', "--", "decks.json"], capture_output=True, text=True).stdout.split()
        return out[0] if out else None
    except Exception: return None
asked, agent = {}, {}
for d in D.get("decks", []):
    i = d.get("id")
    if not i: continue
    v = d.get("requested_at") or d.get("asked")
    j = None
    if d.get("url"):
        m = re.search(r"style-swipe/([^/?#]+)/", d["url"])
        if m and m.group(1) in slug2id: j = slug2id[m.group(1)]
    if not v and j: v = gen(j)
    v = v or gen(i) or first_seen(i)
    if v: asked[i] = v
    sa = (deck_json(j) if j else {}).get("submit_agent") or deck_json(i).get("submit_agent")
    ag = d.get("agent") or d.get("owner") or d.get("by") or sa or (d.get("cat") if d.get("cat") in AGENT_CATS else "branding")
    agent[i] = nice(ag)
out = {"updated": dt.datetime.now().astimezone().isoformat(timespec="seconds"), "asked": asked, "agent": agent}
json.dump(out, open(os.path.join(ROOT, "decks/asked.json"), "w"), indent=1, ensure_ascii=False)
print(f"asked.json: {len(asked)} of {len(D.get('decks', []))} decks dated, {len(agent)} with an agent")
