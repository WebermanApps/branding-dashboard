#!/usr/bin/env python3
"""Decks finished today tracker (Max, Oct 14 2026). Writes decks/today.json for the Deck Building page and the main dashboard deck section.
Counts each deck submitted per ICT day once (partial submits count). Sources: /workspace/ops/submit/inbox/*/ (Style Swipe deck submissions
from any inbox) plus every submission in the portfolio, upkeep and wellnest inboxes. Test and unauthenticated rows are skipped
(auth_filter.judge). No answers or notes are written, only deck names and counts.
Usage: python3 tools/deck_today.py [--push]   (--push commits decks/today.json and pushes with git pull --rebase --autostash origin main)
Run it from the 10-minute submissions routine."""
import json, glob, os, sys, subprocess, datetime as dt, runpy
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); INBOX = "/workspace/ops/submit/inbox"
ICT = dt.timezone(dt.timedelta(hours=7)); EXTRA = {"portfolio", "upkeep", "wellnest"}
_argv = sys.argv; sys.argv = [_argv[0]]; judge = runpy.run_path(os.path.join(INBOX, "..", "auth_filter.py"))["judge"]; sys.argv = _argv
names = {}
try:
    for d in json.load(open(os.path.join(ROOT, "decks.json")))["decks"]: names[d["id"]] = d["name"]
except Exception: pass
seen, days = set(), {}
for f in glob.glob(os.path.join(INBOX, "*", "*.json")):
    box = os.path.basename(os.path.dirname(f))
    try: it = json.load(open(f))
    except Exception: continue
    d = it.get("data") if isinstance(it.get("data"), dict) else {}
    app = str(it.get("app") or d.get("app") or ""); agent = str(it.get("agent") or d.get("agent") or box).lower()
    if app != "style-swipe" and box not in EXTRA: continue
    st, _ = judge(it)
    if st != "ok": continue
    ts = int(it.get("ts") or 0)
    if not ts: continue
    day = dt.datetime.fromtimestamp(ts / 1000, ICT).date().isoformat()
    r = d.get("results") if isinstance(d.get("results"), dict) else {}
    deck = str(it.get("deck") or d.get("deck") or r.get("deck") or app)
    if deck == "mix": deck = "mix-" + str((r.get("mix") or {}).get("id") or ts)
    key = (day, agent, app, deck)
    if key in seen: continue
    seen.add(key)
    partial = bool(r.get("partial") or d.get("partial"))
    days.setdefault(day, []).append({"deck": deck, "name": names.get(deck, deck), "agent": agent, "app": app, "partial": partial, "ts": ts})
now = dt.datetime.now(ICT); today = now.date()
last7 = [(today - dt.timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
tl = sorted(days.get(today.isoformat(), []), key=lambda x: x["ts"])
out = {"updated": now.isoformat(timespec="seconds"), "tz": "Asia/Bangkok", "today": today.isoformat(), "count": len(tl),
       "partial": sum(1 for x in tl if x["partial"]), "decks": [{k: x[k] for k in ("deck", "name", "agent", "partial")} for x in tl],
       "week": [{"date": d, "count": len(days.get(d, []))} for d in last7]}
p = os.path.join(ROOT, "decks", "today.json"); old = open(p).read() if os.path.exists(p) else ""
new = json.dumps(out, indent=1, ensure_ascii=False)
def strip(s):
    try: j = json.loads(s); j.pop("updated", None); return j
    except Exception: return None
changed = strip(old) != strip(new)
open(p, "w").write(new); print(f"today {out['today']}: {out['count']} decks ({out['partial']} partial); week {[w['count'] for w in out['week']]}; changed={changed}")
if "--push" in sys.argv and changed:
    g = lambda *a: subprocess.run(["git", "-C", ROOT, *a], check=True)
    g("add", "decks/today.json"); g("commit", "-qm", f"Decks today: {out['count']} finished ({out['today']} ICT)")
    g("pull", "-q", "--rebase", "--autostash", "origin", "main"); g("push", "-q", "origin", "HEAD:main")
