import json, re, sys, collections
html = open(sys.argv[1]).read()
chunks = [json.loads('"' + m + '"') for m in re.findall(r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)', html)]
rsc = "".join(chunks)
print("rsc length", len(rsc))
keys = collections.Counter(re.findall(r'"([a-zA-Z]+)":', rsc))
print("keys", [k for k, _ in keys.most_common(200)])
for k in ("isSelectablePickup", "startDate", "endDate", "startsAt", "start\"", "freePulls"):
    i = rsc.find(k)
    print("===", k, i)
for m in list(re.finditer(r'isSelectablePickup', rsc))[:3]:
    print("---- context")
    print(rsc[max(0, m.start() - 2500):m.start() + 200])
print("==== dates")
print(sorted(set(re.findall(r'"[^"]{0,30}":"(20\d\d-\d\d-\d\d[^"]*)"', rsc)))[:40])
print(re.findall(r'"([a-zA-Z]+)":"20\d\d-\d\d-\d\dT', rsc)[:20])
