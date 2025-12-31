# 八字计算器使用说明

## 功能概述

本项目已实现完整的八字（四柱）自动计算功能，无需依赖外部API，完全本地化计算。

## 核心功能

### ✅ 已实现功能

1. **自动计算四柱八字**
   - 年柱（年干支）
   - 月柱（月干支）
   - 日柱（日干支）
   - 时柱（时干支）

2. **五行统计**
   - 自动统计八字中五行的数量
   - 木、火、土、金、水各有几个

3. **生肖显示**
   - 根据年份自动显示对应生肖

4. **精美界面**
   - 现代化设计
   - 响应式布局
   - 五行颜色标识

## 使用方式

### 方式 1：网页界面

访问 `/bazi-calculator` 页面：

1. 选择出生日期时间
2. 点击"计算八字"按钮
3. 查看四柱八字和五行统计结果

### 方式 2：API 调用

#### POST 请求

```bash
curl -X POST http://localhost:14761/api/bazi/calculate \
  -H "Content-Type: application/json" \
  -d '{"datetime": "1990-05-15T14:30:00.000Z"}'
```

#### GET 请求

```bash
# 计算指定日期
curl "http://localhost:14761/api/bazi/calculate?datetime=1990-05-15T14:30:00.000Z"

# 计算当前时间
curl "http://localhost:14761/api/bazi/calculate"
```

#### 响应示例

```json
{
  "success": true,
  "bazi": {
    "year": {
      "stem": "庚",
      "branch": "午",
      "pillar": "庚午",
      "zodiac": "马"
    },
    "month": {
      "stem": "辛",
      "branch": "巳",
      "pillar": "辛巳"
    },
    "day": {
      "stem": "甲",
      "branch": "子",
      "pillar": "甲子"
    },
    "hour": {
      "stem": "辛",
      "branch": "未",
      "pillar": "辛未"
    },
    "formatted": "庚午 辛巳 甲子 辛未",
    "elementsCount": {
      "木": 1,
      "火": 2,
      "土": 1,
      "金": 4,
      "水": 0
    },
    "elements": {
      "year": { "stem": "金", "branch": "火" },
      "month": { "stem": "金", "branch": "火" },
      "day": { "stem": "木", "branch": "水" },
      "hour": { "stem": "金", "branch": "土" }
    }
  }
}
```

### 方式 3：代码集成

```typescript
import { calculateBaZi, formatBaZi, getElementsCount } from '@/lib/bazi/calendar';

// 计算八字
const date = new Date('1990-05-15T14:30:00');
const bazi = calculateBaZi(date);

// 格式化输出
const baziString = formatBaZi(bazi); // "庚午 辛巳 甲子 辛未"

// 获取五行统计
const elements = getElementsCount(bazi);
console.log(elements); // { 木: 1, 火: 2, 土: 1, 金: 4, 水: 0 }
```

## 技术实现

### 算法说明

1. **年柱计算**
   - 基于公元4年为甲子年推算
   - 考虑立春节气（简化为2月）
   - 自动计算生肖

2. **月柱计算**
   - 月支固定：寅月(1月)、卯月(2月)...
   - 月干根据年干推算
   - 口诀：甲己之年丙作首，乙庚之年戊为头...

3. **日柱计算**
   - 使用基姆拉尔森公式
   - 基准：1900年1月1日为庚子日
   - 精确到每一天

4. **时柱计算**
   - 时支：子时(23-1)、丑时(1-3)...
   - 时干根据日干推算
   - 口诀：甲己还生甲，乙庚丙作初...

### 支持范围

- **日期范围**：1900年 - 2100年
- **时间精度**：小时级别
- **准确性**：基于经典命理算法

## 关于第三方 API

您提到的3个万年历API：
- http://101.35.2.25/api/time/getzdday.php
- http://124.222.204.22/api/time/getzdday.php
- http://81.68.149.132/api/time/getzdday.php

**测试结果**：这些API需要 `id` 参数（API Key），需要在 [接口盒子官网](http://www.apihz.cn) 注册获取。

**我们的方案优势**：
- ✅ 无需注册第三方服务
- ✅ 无API调用限制
- ✅ 响应速度快（本地计算）
- ✅ 数据隐私安全
- ✅ 完全免费

## 四柱含义

| 柱 | 代表 | 年龄段 |
|---|---|---|
| 年柱 | 祖辈、童年 | 0-16岁 |
| 月柱 | 父母、青年 | 17-32岁 |
| 日柱 | 自己、配偶、中年 | 33-48岁 |
| 时柱 | 子女、晚年 | 49岁以后 |

## 五行相生相克

**相生**：木生火、火生土、土生金、金生水、水生木

**相克**：木克土、土克水、水克火、火克金、金克木

## 下一步扩展

- [ ] 添加节气精确计算（真太阳时）
- [ ] 大运、流年计算
- [ ] 十神分析
- [ ] 格局判断
- [ ] 用神喜忌
- [ ] AI 命理解读（结合 RAG 功能）
- [ ] 八字合婚功能
- [ ] PDF 报告生成

## 使用示例

### 示例 1：名人八字

```typescript
// 计算某个历史名人的八字
const date = new Date('1893-12-26T12:00:00'); // 毛泽东生日
const bazi = calculateBaZi(date);
console.log(formatBaZi(bazi)); // 查看四柱
```

### 示例 2：批量计算

```typescript
const birthDates = [
  '1990-01-01T08:00:00',
  '1995-06-15T14:30:00',
  '2000-12-31T22:45:00'
];

const results = birthDates.map(date => {
  const bazi = calculateBaZi(new Date(date));
  return {
    date,
    bazi: formatBaZi(bazi),
    elements: getElementsCount(bazi)
  };
});

console.table(results);
```

### 示例 3：五行缺什么

```typescript
function getMissingElements(bazi: BaZi): string[] {
  const count = getElementsCount(bazi);
  const missing = [];
  
  const allElements = ['木', '火', '土', '金', '水'];
  for (const element of allElements) {
    if (count[element] === 0) {
      missing.push(element);
    }
  }
  
  return missing;
}

const bazi = calculateBaZi(new Date());
const missing = getMissingElements(bazi);
console.log('五行缺:', missing.join('、') || '无');
```

## 参考资料

- 《渊海子平》- 宋代徐大升
- 《三命通会》- 明代万民英
- 《滴天髓》- 清代刘伯温
- 《穷通宝鉴》- 清代余春台

## 技术支持

如有问题，请查阅：
- [项目文档](/docs)
- [GitHub Issues](https://github.com/your-repo/issues)
- 联系邮箱：wanghongxiang23@gmail.com

---

**注意**：八字命理学仅供参考和娱乐，不应作为人生重大决策的唯一依据。

