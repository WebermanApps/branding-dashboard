#!/usr/bin/env python3
"""Requested Decks (Max Oct 16 2026 12:36 ICT, rulebook R77). Decks Max specifically asks for live in shelf.json "requested"
and show in the board's Requested Decks section, never in the header Ready To Swipe shelf (header = Team Improvement + regular decks, max 10 per R86, Oct 17 2026).
  requested.py add --id ID --name NAME --url URL [--total 10] [--note TEXT] [--requested-at ISO] [--shelf shelf.json]
      requested_at = when Max asked (default now, ICT); give --requested-at when the ask was earlier than the add.
  requested.py done ID --answered N [--skipped 05,14] [--shelf shelf.json]   (Deck Results Handler: after results are applied)
  requested.py clear ID [--shelf shelf.json]                                  (Max cleared it)
  requested.py sort [--shelf shelf.json]                                      (re-sort only)
  requested.py list [--shelf shelf.json]
Order (R90, Max Oct 17 2026 10:59 ICT): newest request first (requested_at, newest at top); open decks first, done after
(R77), each newest-asked first. Every write re-sorts, so new requests land at the top. No partly-finished-first here."""
import json, sys, os, datetime as dt
a = sys.argv[1:]
def opt(k, d=None):
    if k in a: i = a.index(k); v = a[i + 1]; del a[i:i + 2]; return v
    return d
P = opt("--shelf", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shelf.json"))
now = dt.datetime.now().astimezone().isoformat(timespec="seconds")
s = json.load(open(P)); R = s.setdefault("requested", [])
if not a: sys.exit(__doc__)
cmd = a[0]
def find(i):
    d = next((d for d in R if d.get("id") == i), None)
    if not d: sys.exit(f"{i} not in requested")
    return d
if cmd == "add":
    i = opt("--id"); n = opt("--name"); u = opt("--url")
    if not (i and n and u): sys.exit(__doc__)
    if any(d.get("id") == i for d in R): sys.exit(f"{i} already requested")
    for k in ("decks", "pinned", "queued"): s[k] = [d for d in s.get(k, []) if d.get("id") != i or d.get("permanent")]
    R.insert(0, {"id": i, "name": n, "url": u, "total": int(opt("--total", 10)), "answered": 0, "tag": "Max Asked", "status": "open", "requested_at": opt("--requested-at", now), "added": now, "note": opt("--note", "Requested by Max")})
elif cmd == "done":
    d = find(a[1]); d.update(status="done", done_at=now, answered=int(opt("--answered", d.get("total", 10))))
    sk = opt("--skipped"); d.update(skipped=sk.split(",")) if sk else None
elif cmd == "clear": d = find(a[1]); d.update(status="cleared", cleared_at=now); s["requested"] = [x for x in R if x is not d]; s.setdefault("requested_cleared", []).append(d)
elif cmd == "sort": pass
elif cmd == "list": print(json.dumps(R, indent=1)); sys.exit()
else: sys.exit(__doc__)
def ts(d):
    try: return dt.datetime.fromisoformat(d.get("requested_at") or d.get("added") or "1970-01-01T00:00:00+07:00").timestamp()
    except ValueError: return 0
def order(L):  # R90: newest request first; done after open (R77); stable for ties
    return sorted(L, key=lambda d: (d.get("status") == "done", -ts(d)))
s["requested"] = order(s.get("requested", []))
s["updated"] = now; json.dump(s, open(P, "w"), indent=1, ensure_ascii=False); print(cmd, "ok")
