# 足球预测文献研究备忘录

更新日期：2026-06-12

用途：作为本项目后续构建单场胜平负概率、世界杯晋级模拟和预测市场交易模型的长期研究上下文。

## 核心结论

1. 先预测完整比分分布，再聚合为胜平负概率。这样才能一致地处理小组积分、净胜球、进球数和淘汰赛路径。
2. 球队实力表征通常比更复杂的学习器更重要。Elo、动态攻防能力和市场共识应作为核心输入。
3. 世界杯样本很少，验证必须按时间推进或按整届赛事留出，不能随机拆分比赛。
4. 博彩或预测市场价格是强基准，也是可用特征。模型价值应定义为相对市场的增量信息，而不是脱离市场追求命中率。
5. 主指标应为 Log Loss、RPS、Brier Score 和校准误差；分类准确率仅作辅助。
6. 交易回测必须使用当时可获得的价格和信息，并计入手续费、滑点、流动性、限额及结算规则。

## 已核验论文

### 1. Groll et al. (2018), Random Forest + Team Abilities

题名：Prediction of the FIFA World Cup 2018 - A Random Forest Approach with an Emphasis on Estimated Team Ability Parameters

原文：https://arxiv.org/abs/1806.03208

方法和数据：

- 使用 2002-2014 四届世界杯，共 256 场比赛。
- 每场比赛拆成两个“球队进球数”观测。
- 比较随机森林、L1 正则化 Poisson 和 Poisson 排名模型。
- 特征包括 FIFA 排名、赛前冠军赔率、主办国/洲际因素、阵容年龄、欧冠球员数、旅外球员、教练信息及经济变量。
- 最终将独立训练的球队能力参数加入随机森林；2018 年能力参数来自 2010-06-13 至 2018-06-06 的 7,000 多场国家队比赛，并采用三年半衰期。
- 随机森林给出双方期望进球，再从条件独立 Poisson 分布采样比分，完整模拟赛事。

关键结果：

- 加入球队能力后，随机森林在历史世界杯上的分类率为 0.556，RPS 为 0.187；对应博彩公司为 0.524 和 0.188。
- 球队能力是随机森林中最重要的变量，明显高于 FIFA 排名和赛前冠军赔率。
- 这不是严格意义上的完全独立“真实未来”检验：论文是在同一批历史世界杯上比较模型表现，需警惕选择和重用数据带来的乐观偏差。

项目启示：

- 复现为“动态球队能力 + 非线性进球模型”的候选集成分支。
- 宏观、阵容和市场特征只应在严格滚动验证中保留。
- 不能把论文中略优于博彩公司的一组历史平均分数理解为稳定可交易优势。

### 2. Groll, Schauberger & Tutz (2015), Regularized Poisson

题名：Prediction of Major International Soccer Tournaments Based on Team-Specific Regularized Poisson Regression: An Application to the FIFA World Cup 2014

当前状态：题名和方法被后续 Groll 论文明确引用，精确出版页面和全文仍待补齐。

已确认方法：

- 双方进球数分别使用 Poisson 回归建模。
- 使用 L1/Lasso 正则化在较多候选变量中筛选特征并控制过拟合。
- 属于透明、易解释的世界杯基线模型。

项目启示：

- 应实现为首个可审计基线，并与不正则化 Poisson、Dixon-Coles 和 Elo-Poisson 同台滚动验证。

### 3. Gilch (2022), Nested Zero-Inflated Generalized Poisson

题名：Nested Zero-Inflated Generalized Poisson Regression for FIFA World Cup 2022

原文：https://arxiv.org/abs/2205.04173

方法：

- 使用零膨胀广义 Poisson，同时建模额外零值和离散程度。
- 强队进球取其进攻模型与弱队防守模型参数的平均。
- 弱队进球还条件依赖强队已模拟的进球数，形成嵌套依赖。
- 协变量包括对手 Elo、比赛地点、球队进攻/防守能力。
- 使用 2016 年以来比赛，并按日期和比赛重要性加权。

验证：

- 回测世界杯 2010、2014、2018，以及欧洲杯 2016、2020。
- 使用赛事阶段分布的 Brier Score 和 RPS。
- ZIGP 在世界杯 2010、2014 和欧洲杯 2016 明显优于标准 Poisson；世界杯 2018 不如标准模型；欧洲杯 2020 结果接近。

项目启示：

- “ZIGP 一定优于普通 Poisson”并不成立，应该作为候选模型而非默认赢家。
- 零膨胀、过度离散和双方进球依赖需要通过滚动样本检验，不能仅凭足球低比分直觉加入。

### 4. Gilch & Müller (2018), Elo-Poisson

题名：On Elo Based Prediction Models for the FIFA Worldcup 2018

原文：https://arxiv.org/abs/1806.01930

方法：

- 使用 Elo 和球队特定效应的 Poisson 模型。
- 2018 模型使用参赛队自 2010 年以来的中立场比赛。
- 赛事模拟中逐场更新 Elo；加时赛使用常规时间 Poisson 强度的三分之一。
- 每个模型运行 100,000 次赛事模拟。

验证：

- 对 2014 世界杯进行赛前式回测时，使用 2002-01-01 至开赛前的数据。
- 由于部分球队中立场样本不足，最长使用 12 年历史。
- 使用 Brier、RPS 及作者提出的阶段误差分数。

项目启示：

- 这是最适合首先落地的世界杯模拟基线之一。
- “只用中立场”减少场地混杂，但会严重减少样本；应与“所有比赛 + 主客场修正”方案比较。

### 5. Zeileis, Leitner & Hornik (2018), Bookmaker Consensus

题名：Probabilistic Forecasts for the 2018 FIFA World Cup Based on the Bookmaker Consensus Model

当前状态：后续 Groll 原文确认该方法汇总多家赛前冠军赔率，经概率化和逆向赛事模拟估计球队能力；精确原文页面仍待补齐。

已确认要点：

- 市场共识不是简单使用一家公司的赔率。
- 先去除利润率并汇总价格，再通过逆向赛事模拟使球队能力与冠军市场概率相匹配。
- 2018 赛前预测中，巴西、德国、西班牙为前三热门。

项目启示：

- 市场共识必须是所有模型的最低基准。
- 冠军市场价格不能直接当作单场实力，需要通过赛制和路径反演。
- 对 Polymarket，应保留盘口时间戳、买卖价差和可成交深度，不能用最终价格替代历史可交易价格。

### 6. Dixon & Coles (1997)

题名：Modelling Association Football Scores and Inefficiencies in the Football Betting Market

已确认要点：

- 在双 Poisson 框架中修正 0-0、1-0、0-1、1-1 等低比分概率。
- 对旧比赛进行时间衰减。
- 将模型概率与博彩市场比较。

项目启示：

- 应作为联赛和国家队比分模型的标准基线。
- 低比分修正参数必须在目标数据域重新估计；联赛参数不能直接搬到世界杯。

### 7. Egidi, Pauli & Torelli (2018), Historical Data + Odds

题名：Combining Historical Data and Bookmakers' Odds in Modelling Football Scores

原文：https://arxiv.org/abs/1802.08848

方法：

- 层级贝叶斯 Poisson 模型。
- 进球强度是历史攻防参数与博彩公司信息所隐含参数的凸组合。
- 使用欧洲主要联赛九个赛季训练，预测第十个赛季。
- 使用 WinBUGS 和 Stan 实现 MCMC，并进行后验预测检查。

重要认识：

- 市场信息与历史模型不是二选一，可以通过权重融合。
- 单个精确比分即使是众数，概率也可能只有约 0.08-0.10；评价应关注完整预测分布。

项目启示：

- 为市场融合建立 shrinkage/stacking 模型：数据弱时靠近市场，模型有稳定增量信号时再偏离市场。
- 融合权重应随联赛、时间、流动性或信息质量变化，不宜固定。

## 尚待严格核验的条目

以下条目目前无法用精确题名、作者、期刊和公开原文稳定对应。后续引用前必须再次核验，不能作为既定事实：

- “Forecasting the FIFA World Cup - Combining Result- and Goal-Based Team Ability Parameters”（Robberechts、Davis）。
- “Bayesian State-Space Models for the Modelling and Prediction of Association Football Match Outcomes”，以及“JRSS C, 2025”的书目信息。
- “Incorporating Domain Knowledge in Machine Learning for Soccer Outcome Prediction”及 216,743 场、206 场未来比赛的精确出处。
- “A Data- and Knowledge-Driven Framework for Developing Machine Learning Models to Predict Soccer Match Outcomes”及 30 万场、736 场未来比赛的精确出处。
- “A Deep Learning Framework for Football Match Prediction”在 SN Applied Sciences、世界杯 63.3% 准确率的精确出处。

这不代表相关研究一定不存在，只表示当前清单中的题名或元数据可能有翻译、改写、作者归属或数字误差。

## 世界杯与 Polymarket 推荐集成架构

这是一套候选架构，不表示所有层都应无条件进入最终模型。每个新增特征组和模型分支必须在严格的时间外消融实验中证明其增量价值。

### 1. 市场基准层

- 博彩公司共识赔率。
- 高流动性交易所的买卖价格和深度。
- Polymarket 的盘口概率、价差、成交量、订单簿和距离开赛时间。
- 对博彩公司赔率先去除水位；对交易市场使用可成交买价/卖价，而不是中间价或收盘价替代历史成交条件。

### 2. 球队实力层

- Elo 及其按比赛重要性、净胜球和时间衰减调整的变体。
- 动态进攻/防守 Rating。
- 球员级 Plus-Minus 或其他经过收缩的球员评级，再按预计出场时间聚合到球队。
- 球员级模型必须处理联赛强度、位置、队友/对手混杂、国家队样本少和跨联赛迁移。

### 3. 比分模型层

- Dixon-Coles 作为低比分相关修正基线。
- 动态 Poisson 追踪攻防能力变化。
- 零膨胀广义 Poisson作为候选分支，用于检验额外零值和离散程度。
- 必须输出联合比分分布，供 1X2、大小球、双方进球和赛事模拟共同使用。

### 4. 机器学习层

- LightGBM、CatBoost、Random Forest 或其他树模型。
- 优先预测进球强度、分布参数或相对市场残差，而不是只输出硬分类结果。
- 树模型应与统计比分模型保持独立性，以便通过 stacking 获得真正的模型多样性。

### 5. 人员信息层

- 已确认首发、预计首发、伤停、停赛和出场时间限制。
- 球员近期俱乐部表现、国家队适配度和阵容稳定度。
- 明确区分信息发布时间，避免把赛前最后一小时公布的首发泄漏到更早的交易回测中。

### 6. 比赛环境层

- 主办国/主场效应、旅行距离、时区变化、海拔、休息天数和赛程拥挤度。
- 温度、湿度、降水和风等天气因素。
- 环境特征是否保留由消融实验决定；很多变量直觉合理，但信号可能弱、非线性且高度依赖样本。

### 7. 概率融合与校准层

- 使用时间外预测训练 stacking 或 shrinkage 融合，而不是按样本内表现手工加权。
- Platt scaling 适合较平滑、参数化的校准；isotonic regression 更灵活但在世界杯小样本上容易过拟合。
- 可同时比较 beta calibration、temperature scaling 和分层贝叶斯校准。
- 校准集必须位于训练期之后，且早于最终测试期。
- 三分类校准需保持概率和为 1；不能对主胜、平局、客胜分别校准后直接使用。

### 8. 世界杯模拟层

- 至少运行 100,000 次完整赛事模拟，并检查 Monte Carlo 标准误是否足够小。
- 模拟双方比分、积分和所有排名规则，而不只是独立抽取胜平负。
- 淘汰赛分别处理 90 分钟、加时赛和点球大战。
- 比赛结束后更新球队状态时，应避免在同一次赛前概率快照中使用未来赛事信息。

## 推荐实施顺序

1. 市场无水位共识 + Elo-Poisson。
2. Dixon-Coles 和动态攻防能力。
3. 完整世界杯规则与蒙特卡洛模拟。
4. 市场融合及概率校准。
5. 树模型与严格时间外 stacking。
6. 首发、伤停和球员评级。
7. 环境变量及其他弱信号。
8. Polymarket 可成交价格、成本和容量回测。

这个顺序与“阅读顺序”不同：工程上应先建立可审计的端到端基线，再逐层证明复杂度值得加入。

## 推荐精读顺序

1. Dixon & Coles (1997)：低比分修正、时间衰减和市场比较。
2. Groll, Schauberger & Tutz (2015)：正则化 Poisson 世界杯基线。
3. Groll et al. (2018)：球队能力参数与随机森林结合。
4. Gilch (2022)：零膨胀广义 Poisson 和整届赛事模拟。
5. Egidi, Pauli & Torelli (2018)：历史模型与市场赔率的贝叶斯融合。
6. 挑战赛或真实未来比赛预测论文：仅在书目信息和原文核验后纳入。

原清单中的“Berrar 2024 挑战赛模型”暂未找到可稳定对应的权威记录，因此不能按该名称正式引用。

可确认的相邻研究是：

- Groll et al. (2024), *Modeling and Prediction of the UEFA EURO 2024 via Combined Statistical Learning Approaches*：组合 GLM、随机森林和 XGBoost，并加入历史比赛排名、博彩公司冠军赔率和球员评级，完整模拟赛事 100,000 次。
- 原文：https://arxiv.org/abs/2410.09068

这篇论文为“统计模型 + 树模型 + 市场信息 + 球员评级 + 蒙特卡洛”的架构提供直接支持，但它是欧洲杯预测研究，不是已确认的 Berrar 挑战赛论文。

## 原型模型清单

### 单场概率层

- 基线 A：Elo -> ordered logit / multinomial logistic。
- 基线 B：独立 Poisson，含 Elo 差、地点、比赛重要性和时间衰减。
- 基线 C：Dixon-Coles。
- 候选 D：动态贝叶斯攻防状态空间。
- 候选 E：ZIGP / bivariate Poisson，仅在时间外验证稳定改善时进入集成。
- 候选 F：随机森林或梯度提升预测进球分布，核心输入为滚动球队能力。

### 市场融合层

- 将无水位市场概率作为基准预测。
- 学习模型相对市场的残差或通过线性池、对数池、贝叶斯 shrinkage 融合。
- 对每个时间截面执行校准，避免把临近开赛价格泄漏到更早的回测决策。

### 世界杯模拟层

- 从联合比分分布采样，而不是独立抽取胜平负标签。
- 完整实现当届 FIFA 小组排名、同分规则、公平竞赛分、抽签和淘汰赛加时/点球规则。
- 输出单场 1X2、出线、各轮晋级、冠军及路径条件概率。
- 用足够多的模拟次数和固定随机种子报告 Monte Carlo 标准误。

### 评价与交易层

- 概率质量：Log Loss、RPS、Brier、校准曲线、ECE、分组可靠性。
- 比分质量：负对数似然、Dawid-Sebastiani 或适当的计数分布评分。
- 相对市场：模型与无水位共识的 score difference，并用 bootstrap 给出不确定性。
- 交易：期望收益、成交后收益、最大回撤、收益波动、Kelly 折扣、换手率和容量。
- 所有超参数、特征窗口及集成权重只可用当时之前的数据选择。

## 当前默认研究立场

- 不追求“最高准确率论文”，优先可信的时间外概率验证。
- 不假设复杂模型必胜；优先实现可解释基线，再增加复杂度。
- 不把市场当敌手；市场既是基准，也是信息源。
- 不将赛事级偶然结果误读为模型优劣，例如热门球队意外小组出局会显著影响单届世界杯的阶段评分。
- 所有论文结论在本项目中都视为待复现实证假设，而不是可直接移植的真理。
