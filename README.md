# World Cup Intelligence

世界杯智能预测是一个中英双语的国际足球概率预测与预测市场研究平台。它使用 Next.js、TypeScript、FastAPI、PostgreSQL、Prisma 和 Redis，提供比赛 1X2 概率、比分分布、世界杯模拟、多模型比较、可解释性、AI 问答和 Polymarket 市场分歧研究。

本项目不会承诺比赛结果或持续盈利。市场页面默认只读并用于研究/纸面交易；候选优势会扣除成本和模型不确定性。

## Features

- `/en` 与 `/zh` 双语路由、深浅主题、响应式布局。
- Dashboard、比赛列表、比赛详情、球队、小组、淘汰赛和世界杯模拟器。
- Elo、Dixon-Coles/Poisson、市场共识和非负概率集成。
- 50,000 次以上赛事模拟接口和固定随机种子。
- Log Loss、Brier、RPS、ECE 和样本外回测设计。
- Polymarket 官方 API 只读 adapter，失败时透明降级至 Mock。
- 赔率去水位、可成交价格、成本缓冲和仓位上限工具。
- 基于当前预测数据的双语聊天 API 与无 LLM fallback。
- 完整 Prisma Schema、Provider Interface、健康检查、限流和 Docker。

## Architecture

详细设计见 [docs/architecture.md](docs/architecture.md)。

- `apps/web`: Next.js 用户界面、BFF 和公开 API。
- `apps/model-service`: FastAPI 纯计算模型服务。
- `apps/worker`: 定时更新和 Provider 健康任务。
- `packages/contracts`: 共享 TypeScript 领域契约。
- `packages/database`: Prisma Schema 和 Seed。
- `packages/providers`: football-data、Open-Meteo、Polymarket 和新闻占位适配器。

## Local Development

要求：

- Node.js 22+
- npm 10+
- Python 3.11+
- 可选：Docker Desktop

安装：

```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r apps/model-service/requirements.txt
cp .env.example .env
```

启动 Web：

```bash
npm run dev
```

启动模型服务：

```bash
MODEL_SERVICE_TOKEN=local-development-token \
  .venv/bin/uvicorn app.main:app --app-dir apps/model-service --reload --port 8000
```

打开：

- English: http://localhost:3000/en
- 中文: http://localhost:3000/zh
- Market Edge Lab: http://localhost:3000/en/markets
- Model health: http://localhost:8000/internal/v1/health

未配置第三方密钥时，产品使用清楚标注的 Mock 数据。不会因 Provider 暂时不可用而全站崩溃。

## Database

启动 PostgreSQL 和 Redis：

```bash
docker compose up -d postgres redis
npm run db:generate
npm run db:push
npm run db:seed
```

Prisma 是数据库迁移的唯一所有者。Python 服务不执行业务数据库迁移。

## Quality Gates

```bash
npm run lint
npm run typecheck
npm test
npm run build
PYTHONPATH=apps/model-service .venv/bin/python -m unittest discover -s apps/model-service/tests -p "test_*.py"
```

概率性质测试会确认：

- 1X2 概率和等于 1。
- Dixon-Coles 比分矩阵和等于 1。
- 市场成本缓冲不会产生负仓位。
- 模拟冠军概率和等于 1。

## Docker

完整启动：

```bash
docker compose up --build
```

服务：

- Web: http://localhost:3000
- FastAPI: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Provider Configuration

复制 `.env.example` 后按需设置：

- `FOOTBALL_DATA_API_KEY`
- `API_FOOTBALL_API_KEY`
- `SPORTMONKS_API_TOKEN`
- `POLYMARKET_API_BASE_URL`
- `KALSHI_API_KEY_ID`
- `KALSHI_PRIVATE_KEY`
- `MANIFOLD_API_KEY`
- `OPEN_METEO_BASE_URL`
- `LLM_API_KEY`

只使用官方、授权或公开许可的数据源。不提供违反服务条款的抓取实现。

## Polymarket

`/api/v1/markets/polymarket` 通过 Polymarket 官方 Gamma 市场 API 读取公开市场元数据。它：

- 不要求钱包私钥。
- 不自动下单。
- 使用 best ask 作为候选进入价格，而不是中间价。
- 展示流动性、买卖价差、原始优势和保守优势。
- 默认扣除 1% 成本及 1.5% 模型不确定性缓冲。
- 使用四分之一 Kelly，并将单一候选仓位封顶在资金的 2%。

这些规则降低风险，但不能保证盈利。启用真实交易需要另外完成身份、地区、合规、安全审计和明确的用户授权。

## Deployment

### Vercel + Railway

1. 将仓库导入 Vercel，Root Directory 保持仓库根目录，Build Command 使用 `npm run build`。
2. 将 `apps/model-service` 通过 `Dockerfile.model` 部署到 Railway、Fly.io 或 Render。
3. 创建托管 PostgreSQL 和 Redis。
4. 在 Vercel 设置 `DATABASE_URL`、`REDIS_URL`、`MODEL_SERVICE_URL` 和 `MODEL_SERVICE_TOKEN`。
5. 配置需要的 Provider key。
6. 部署后调用 `/api/v1/health` 和模型 `/internal/v1/health`。

### Single-container Platform

使用 `docker-compose.yml` 部署到支持 Compose 的主机。生产环境应替换默认密码、启用 TLS、使用托管密钥服务，并限制模型服务为内部网络。

## Scheduling

建议生产频率：

- 每日：球队评级和长期特征。
- 每小时：赔率和预测市场。
- 开赛前 24 小时：每 15 分钟。
- 开赛前 2 小时：每 5 分钟。
- 首发确认：事件触发立即重算。
- 赛后：写入赛果、指标和新评级。

`apps/worker/src/schedule.ts` 保存可移植的频率规则，可接入 Vercel Cron、GitHub Actions、Railway Cron 或 BullMQ。

## Data and Model Integrity

- 所有训练与回测使用 `available_at <= prediction_cutoff`。
- 每条发布预测绑定模型版本、特征快照和来源快照。
- 历史预测不可覆盖。
- 模型权重来自滚动样本外预测，不按直觉手调。
- 世界杯、洲际杯、预选赛和友谊赛分别报告指标。
- Mock 指标始终明确标注，不冒充真实历史表现。

## Compliance

- 所有输出仅为概率分析，不构成博彩、投资、金融或法律建议。
- 不保证准确或盈利。
- 用户必须满足所在地年龄要求并遵守当地法律。
- 市场、赔率、新闻和伤停数据可能延迟或错误。
- 本项目不是 FIFA 官方网站，也不使用未经许可的 FIFA 标志或媒体资产。
