# 排盘工具落地路线图

基于 `E:\workspace\guangming` 资料与产品决策（2026-07-16）。

## 已定决策

| 项 | 决定 |
|----|------|
| 默认语言 | **英文**（`/en`），全站 `/{locale}/...` |
| 八字 | 易世家为准，参看问真；差异见后续 `diff-bazi-*.md` |
| 阴盘奇门 | 易世家为准，参看热卜；默认**拆补** |
| 大六壬 | 热卜金口诀逻辑；**UI 不提金口诀** |
| 算法位置 | **纯前端**（可懒加载字库/宜忌表） |
| 存盘 | **仅登录用户**；只存时间与选项，打开再算 |
| 上线顺序 | 万年历 → 八字 → 奇门 → 大六壬 → 起名 |

## SEO 路由

```text
/{locale}/tools
/{locale}/tools/almanac
/{locale}/tools/almanac/{yyyy-mm-dd}
/{locale}/tools/bazi
/{locale}/tools/qimen
/{locale}/tools/daliuren
/{locale}/tools/naming
/{locale}/tools/hanzi/{char}
```

`locale ∈ en | zh | ja | ko | ar`

## 默认排盘参数（可对照 App 后微调）

- 八字：公历、Asia/Shanghai、**晚子时**、关真太阳、立春换年、节换月
- 奇门：时家、阴盘、**拆补**、时盘
- 大六壬：地分必填、昼夜 auto、关真太阳

## 进度

- [x] P0 i18n SEO 路由骨架 + middleware 308
- [x] P0 万年历（老黄历）全日字段 + 日页 SEO
- [x] P1 八字重做 + 存盘表（`chart_saves` 迁移）
- [x] 差异文档：`docs/diff-bazi-yishijia-vs-wenzhen.md`
- [x] P2 阴盘奇门（拆补默认）+ `docs/diff-qimen-yishijia-vs-rebu.md`
- [x] P3 大六壬（热卜金口诀算法，UI 仅称大六壬）+ `docs/diff-daliuren-rebu.md`
- [x] P4 起名改名：查字五项 + 喜用智能取名（双字×3、复姓）
- [x] 历法单一源 `src/lib/paipan/calendar`（四柱/真太阳/节气/阴阳遁）
- [x] 奇门阴阳遁边界修复（year±1 合并节气，夏至后阴 / 冬至后阳）
- [x] 奇门 `calendarSource: lunar | yishijia`（四柱统一 lunar；旧 JD 锚点废弃）
- [x] 真太阳时专项 + 全模块 `npm run test:paipan`（P0 失败 exit 1）

## 排盘改完必跑

```bash
npm run test:paipan
```

硬验收：`1994-10-26` 日柱 **乙酉**；夏至后**阴遁**；冬至后**阳遁**；八字=奇门=六壬四柱。
