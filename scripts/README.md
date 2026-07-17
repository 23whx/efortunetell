# Scripts

## 排盘验证（必跑）

改动 `src/lib/paipan/**` 后**必须**执行：

```bash
npm run test:paipan
```

等价：

```bash
npx tsx scripts/paipan-full-14round-test.ts
```

- 覆盖：万年历 · 八字 · 阴盘奇门 · 大六壬 · 起名 · 真太阳时 · 阴阳遁边界
- 硬点：`1994-10-26` 日柱 **乙酉**；夏至后阴遁 / 冬至后阳遁
- P0 失败时 **exit code = 1**
- 报告：`docs/PAIPAN_FULL_18ROUND_REPORT.md` / `.json`

## 其他

| 脚本 | 用途 |
|------|------|
| `dev.js` | 开发服 |
| `clean-port.js` | 清端口 |
| `build-hanzi-seed.js` | 起名字库 |
| `paipan-14round-test.ts` | 旧 14 轮 + Python 对照 |
| `paipan-14round-python.py` | 易世家/热卜 Python 参考 |
