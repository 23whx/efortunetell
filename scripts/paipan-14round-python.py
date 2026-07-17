# -*- coding: utf-8 -*-
"""14-round Python reference dumps for 易世家 / 问真 / 热卜"""
from __future__ import annotations
import json
import sys
from datetime import datetime
from pathlib import Path

# Load modules from separate packages without name clash
import importlib.util

def load(name: str, path: str):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod  # required for dataclasses
    spec.loader.exec_module(mod)
    return mod

ROOT = Path(r"E:/workspace/guangming")
yishi = load("yishi_core", str(ROOT / "apk_re/reference_impl/paipan_core.py"))
wenzhen = load("wenzhen_core", str(ROOT / "pcbz_iwzwh_re/reference_impl/paipan_core.py"))
rebu = load("rebu_core", str(ROOT / "rebu_re/reference_impl/paipan_core.py"))

CASES = [
    {"id": 1, "dt": "1990-01-15T10:30", "gender": "male", "ziMode": "late", "diFen": "子"},
    {"id": 2, "dt": "1990-01-15T23:30", "gender": "male", "ziMode": "late", "diFen": "丑"},
    {"id": 3, "dt": "1990-01-15T23:30", "gender": "male", "ziMode": "early", "diFen": "丑"},
    {"id": 4, "dt": "1990-02-04T09:00", "gender": "male", "ziMode": "late", "diFen": "寅"},
    {"id": 5, "dt": "1990-02-04T11:00", "gender": "male", "ziMode": "late", "diFen": "寅"},
    {"id": 6, "dt": "2000-06-21T12:00", "gender": "female", "ziMode": "late", "diFen": "午"},
    {"id": 7, "dt": "2010-12-22T08:00", "gender": "male", "ziMode": "late", "diFen": "子"},
    {"id": 8, "dt": "2024-06-01T09:00", "gender": "male", "ziMode": "late", "diFen": "子"},
    {"id": 9, "dt": "2026-07-14T09:24", "gender": "male", "ziMode": "late", "diFen": "子"},
    {"id": 10, "dt": "2026-07-14T09:27", "gender": "male", "ziMode": "late", "diFen": "子"},
    {"id": 11, "dt": "1984-02-05T10:00", "gender": "male", "ziMode": "late", "diFen": "辰"},
    {"id": 12, "dt": "2008-08-08T20:08", "gender": "female", "ziMode": "late", "diFen": "申"},
    {"id": 13, "dt": "2015-03-21T11:00", "gender": "male", "ziMode": "late", "diFen": "卯"},
    {"id": 14, "dt": "1992-11-11T23:45", "gender": "female", "ziMode": "late", "diFen": "亥"},
]

def parse(dt: str) -> datetime:
    return datetime.strptime(dt, "%Y-%m-%dT%H:%M")

out = []
for c in CASES:
    dt = parse(c["dt"])
    zi = c["ziMode"]
    gender = c["gender"]
    di = c["diFen"]
    row = {"id": c["id"], "dt": c["dt"]}

    try:
        yb = yishi.chart_bazi(dt, gender=gender, zi_mode=zi)
        row["yishijia_bazi"] = " ".join(
            yb["siZhu"][k]["ganZhi"] for k in ("year", "month", "day", "hour")
        )
    except Exception as e:
        row["yishijia_bazi"] = f"ERR {e}"

    try:
        wb = wenzhen.chart_bazi(dt, gender=gender, zwz=(zi == "late"))
        row["wenzhen_bazi"] = " ".join(
            wb["siZhu"][k]["ganZhi"] for k in ("year", "month", "day", "hour")
        )
    except Exception as e:
        row["wenzhen_bazi"] = f"ERR {e}"

    try:
        yq = yishi.chart_yinpan_qimen(dt, zi_mode=zi)
        row["yishijia_qimen"] = (
            f"{yq['meta']['dun']}{yq['meta']['juShu']} "
            f"符{yq['meta']['zhiFu']} 使{yq['meta']['zhiShi']} "
            f"旬{yq['meta']['xunShou']}"
        )
    except Exception as e:
        row["yishijia_qimen"] = f"ERR {e}"

    try:
        rq = rebu.chart_yinpan_qimen(dt)
        row["rebu_qimen"] = (
            f"{rq['meta']['dun']}{rq['meta']['juShu']} "
            f"符{rq['meta']['zhiFu']} 使{rq['meta']['zhiShi']}"
        )
        sz = rq["meta"]["siZhu"]
        row["rebu_qimen_sizhu"] = f"{sz['year']} {sz['month']} {sz['day']} {sz['hour']}"
    except Exception as e:
        row["rebu_qimen"] = f"ERR {e}"
        row["rebu_qimen_sizhu"] = ""

    try:
        rd = rebu.chart_daliuren(dt, di_fen=di)
        g = rd["siWei"]["guiShen"]
        j = rd["siWei"]["jiangShen"]
        row["rebu_daliuren"] = (
            f"元{rd['siWei']['renYuan']['gan']} "
            f"贵{g.get('ganZhi')}·{g.get('name')} "
            f"将{j.get('ganZhi')}·{j.get('name')} "
            f"月将{rd['meta']['yueJiangZhi']}"
        )
        sz = rd["meta"]["siZhu"]
        row["rebu_daliuren_sizhu"] = f"{sz['year']} {sz['month']} {sz['day']} {sz['hour']}"
    except Exception as e:
        row["rebu_daliuren"] = f"ERR {e}"
        row["rebu_daliuren_sizhu"] = ""

    out.append(row)

print(json.dumps(out, ensure_ascii=False, indent=2))
