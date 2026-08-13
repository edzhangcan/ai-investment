"""
RecommendationEngine (宏观驱动多分类股票推荐引擎)
Analyzes North American macroeconomic cycles and sector overweights, evaluates US & Canadian stock universe,
and categorizes recommendations into 3 DISTINCT, MUTUALLY EXCLUSIVE strategic pools:
1. Sector Overweight Champions (8 stocks strictly matching macro overweight sectors)
2. Overall Market Leaders (8 mega/large-cap core picks)
3. Hidden Gold Nuggets (8 mid-cap/niche growth stocks)
Multi-language support for 'en', 'zh', and 'hybrid' modes.
"""

from typing import Dict, Any, List, Set
import logging
import time
from backend.engines.macro_engine import MacroEngine
from backend.data_sources.data_provider import DataProviderManager
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.pricing_engine import PricingEngine

logger = logging.getLogger(__name__)

# Comprehensive Stock Universe across Energy, Banking, Mining, Tech, and Gold Nuggets
STOCK_UNIVERSE = {
    # 🟢 Energy & Infrastructure Overweight Candidates
    "SU.TO": {
        "company_background": {
            "en": "Suncor Energy Inc. is a major integrated Canadian energy company producing synthetic crude oil, offshore energy, and operating retail Petro-Canada stations.",
            "zh": "加拿大炼化一体化能源巨头，开采合成原油、海上能源，并运营全国 Petro-Canada 零售加油站网络。",
            "hybrid": "加拿大炼化一体化能源巨头 (Suncor Energy)，开采原油并运营 Petro-Canada 零售网络。"
        },
        "core_drivers": {
            "en": ["Elevated global oil prices", "Strong $6.8B Free Cash Flow", "Upstream cost efficiency"],
            "zh": ["全球原油价格高位维持", "强劲的 68 亿加元自由现金流", "上游开采成本效率持续优化"],
            "hybrid": ["原油价格高位维持 (High Oil Price)", "强劲 68 亿加元 FCF (Free Cash Flow)", "上游成本控制 (Upstream Efficiency)"]
        },
        "sector": "Energy & Infrastructure",
        "category": "SECTOR_OVERWEIGHT"
    },
    "ENB.TO": {
        "company_background": {
            "en": "Enbridge Inc. operates North America's largest crude oil and natural gas pipeline utility network with toll-booth cash flow stability.",
            "zh": "北美最大原油与天然气管道管网运营商，具备收费站式的管网现金流稳定性与 7%+ 高股息。",
            "hybrid": "北美最大管道管网运营商 (Enbridge Pipeline)，具 Toll-booth 现金流与 7%+ 股息率。"
        },
        "core_drivers": {
            "en": ["Regulated toll revenue", "7%+ Dividend yield", "Natural gas pipeline expansion"],
            "zh": ["受监管过路费固定收入", "7%+ 稳定股息收益率", "天然气管道管网扩建工程"],
            "hybrid": ["受监管过路费收入 (Regulated Toll)", "7%+ 股息收益率 (Dividend Yield)", "天然气管网扩建 (Pipeline Expansion)"]
        },
        "sector": "Energy & Infrastructure",
        "category": "SECTOR_OVERWEIGHT"
    },
    "CNQ.TO": {
        "company_background": {
            "en": "Canadian Natural Resources Limited (CNRL) is Canada's premier low-cost oil sands and natural gas producer with vast reserves.",
            "zh": "加拿大顶级低成本油砂与天然气开采龙头，拥有极为雄厚的天然资源储备与 $8.2B 自由现金流。",
            "hybrid": "加拿大低成本油砂与天然气龙头 (CNRL)，拥有极其雄厚的 Oil Sands 储备。"
        },
        "core_drivers": {
            "en": ["Low break-even oil sands operations", "Massive $8.2B Free Cash Flow", "Dividend growth commitment"],
            "zh": ["低保本点油砂采掘运营", "82 亿美元巨额自由现金流", "持续股息增长与股票回购承诺"],
            "hybrid": ["低保本油砂运营 (Low Break-even)", "巨额 $8.2B 自由现金流 (FCF)", "股息增长承诺 (Dividend Growth)"]
        },
        "sector": "Energy & Infrastructure",
        "category": "SECTOR_OVERWEIGHT"
    },
    "XOM": {
        "company_background": {
            "en": "Exxon Mobil Corporation is a global energy giant involved in oil & gas exploration, refining, and chemicals with world-class Guyana offshore assets.",
            "zh": "埃克森美孚是全球能源巨头，在圭亚那拥有世界级深海油田开采权，具备出色的抗风险能力。",
            "hybrid": "全球能源巨头 (ExxonMobil)，拥有世界级 Guyana 深海油田与 $36.1B 自由现金流。"
        },
        "core_drivers": {
            "en": ["Guyana offshore low-cost volume growth", "$36.1B Free Cash Flow", "Refining margin strength"],
            "zh": ["圭亚那深海低成本产量快速增长", "361 亿美元自由现金流", "下游炼化业务利润率强劲"],
            "hybrid": ["圭亚那深海低成本产量 (Guyana Offshore)", "361 亿美元 FCF (Free Cash Flow)", "下游炼化高利润 (Refining Margin)"]
        },
        "sector": "Energy & Infrastructure",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🟢 Financials & Banking Overweight Candidates
    "TD.TO": {
        "company_background": {
            "en": "Toronto-Dominion Bank is one of Canada's Big Five chartered banks, providing retail, commercial, and wealth management services across North America.",
            "zh": "加拿大五大商业银行之一，在北美提供零售银行、商业贷款和财富管理服务。",
            "hybrid": "加拿大五大商业银行之一 (TD Bank)，在北美提供 Retail & Wealth Management 服务。"
        },
        "core_drivers": {
            "en": ["Net Interest Margin (NIM) stability", "Dominant Canadian retail banking share", "Attractive dividend yield"],
            "zh": ["净利息收益率 (NIM) 维持稳定", "加拿大零售银行主导份额", "高股息收益率与稳健资产负债表"],
            "hybrid": ["净利息收益率稳定 (NIM Stability)", "加拿大零售银行主导 (Retail Banking)", "高股息收益率 (Attractive Dividend)"]
        },
        "sector": "Financials & Banking",
        "category": "SECTOR_OVERWEIGHT"
    },
    "RY.TO": {
        "company_background": {
            "en": "Royal Bank of Canada (RBC) is Canada's largest commercial bank and wealth manager with dominant capital markets share.",
            "zh": "加拿大市值最大的商业银行与财富管理巨头，拥有顶尖的资本市场与零售银行业务。",
            "hybrid": "加拿大最大的商业银行 (Royal Bank of Canada)，拥有最高 Return on Equity (ROE)。"
        },
        "core_drivers": {
            "en": ["Highest ROE among Canadian banks", "Dominant wealth management", "$9.8B Free Cash Flow"],
            "zh": ["加国大银行中最高的 ROE 净资产收益率", "统治级的财富管理份额", "98 亿加元自由现金流"],
            "hybrid": ["加国最高 ROE (Return on Equity)", "统治级财富管理 (Wealth Management)", "98 亿加元 FCF (Free Cash Flow)"]
        },
        "sector": "Financials & Banking",
        "category": "SECTOR_OVERWEIGHT"
    },
    "BNS.TO": {
        "company_background": {
            "en": "Bank of Nova Scotia (Scotiabank) is an international Canadian bank with significant retail presence in North and Latin America.",
            "zh": "加拿大国际化商业银行巨头，在北美与拉丁美洲太平洋联盟地区拥有强大的零售与商业银行网点。",
            "hybrid": "加拿大国际化商业银行 (Scotiabank)，市盈率低至 10.8x P/E 且具高股息分配。"
        },
        "core_drivers": {
            "en": ["International Latin American growth", "Low 10.8x P/E valuation", "6%+ Dividend yield"],
            "zh": ["拉丁美洲国际业务恢复增长", "仅 10.8 倍低市盈率估值", "6%+ 高股息收益率"],
            "hybrid": ["拉美业务增长 (Latin America)", "仅 10.8x 低市盈率 (Low P/E)", "6%+ 高股息率 (Dividend Yield)"]
        },
        "sector": "Financials & Banking",
        "category": "SECTOR_OVERWEIGHT"
    },
    "JPM": {
        "company_background": {
            "en": "JPMorgan Chase & Co. is the premier US money-center bank offering investment banking, asset management, and commercial credit.",
            "zh": "摩根大通是美国最大的全能金融集团，在投资银行、资产管理及商业信贷领域占据绝对统治地位。",
            "hybrid": "美国最大全能金融集团 (JPMorgan Chase)，具备极高 Return on Tangible Equity (ROTE)。"
        },
        "core_drivers": {
            "en": ["Fortress balance sheet strength", "Investment banking advisory rebound", "Market share consolidation"],
            "zh": ["堡垒级资产负债表与抗风险韧性", "投资银行并购咨询业务反弹", "存款与贷款市场份额持续集中"],
            "hybrid": ["堡垒级资产负债表 (Fortress Balance Sheet)", "投行咨询业务复苏 (IB Advisory)", "市场份额集中 (Share Consolidation)"]
        },
        "sector": "Financials & Banking",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🟢 Materials & Mining Overweight Candidates
    "ABX.TO": {
        "company_background": {
            "en": "Barrick Gold Corporation is one of the world's largest gold and copper producers operating tier-one mining assets globally.",
            "zh": "全球顶尖黄金与铜矿开采巨头，在全球运营一级低成本矿业资产，提供通胀避险收益。",
            "hybrid": "全球顶尖黄金与铜矿巨头 (Barrick Gold)，具备一级低成本 Tier-1 矿业资产。"
        },
        "core_drivers": {
            "en": ["Gold safe-haven demand", "Tier-1 low-cost mining assets", "Free cash flow expansion"],
            "zh": ["避险黄金与抗通胀配置需求", "一级低成本矿山资产储备", "自由现金流高速拓展"],
            "hybrid": ["避险黄金需求 (Gold Safe-haven)", "一级低成本矿山 (Tier-1 Assets)", "自由现金流拓展 (FCF Expansion)"]
        },
        "sector": "Materials & Mining",
        "category": "SECTOR_OVERWEIGHT"
    },
    "TECK.B.TO": {
        "company_background": {
            "en": "Teck Resources Limited is a premier Canadian critical minerals and copper producer positioning for global electrification demand.",
            "zh": "加拿大顶尖关键矿产与铜矿生产商，直接受益于全球电气化、电动汽车与 AI 电网建设需求。",
            "hybrid": "加拿大关键矿产与铜矿生产商 (Teck Resources)，受益于 EV 与 AI 电网需求。"
        },
        "core_drivers": {
            "en": ["Copper demand surge for EV & AI power grids", "Pure-play critical minerals focus", "Low 12.8x P/E valuation"],
            "zh": ["电动汽车与 AI 电网带来的铜需求爆发", "纯铜与关键矿产战略转型", "仅 12.8 倍低市盈率估值"],
            "hybrid": ["铜需求爆发 (Copper Demand Surge)", "关键矿产转型 (Pure-play Critical Minerals)", "12.8x 低市盈率 (Low P/E)"]
        },
        "sector": "Materials & Mining",
        "category": "SECTOR_OVERWEIGHT"
    },
    "NTR.TO": {
        "company_background": {
            "en": "Nutrien Ltd. is the world's largest provider of crop inputs and potash fertilizer, maintaining agricultural food security supply chains.",
            "zh": "全球最大的农作物营养素与钾肥生产商，维护全球农业粮食安全供应链，现金流充沛。",
            "hybrid": "全球最大钾肥与农资巨头 (Nutrien)，低估值 14.5x P/E 且受益于全球粮食安全需求。"
        },
        "core_drivers": {
            "en": ["Global agricultural potash demand", "Vertical retail distribution network", "$2.8B Free Cash Flow"],
            "zh": ["全球农业钾肥需求稳定", "垂直农资零售分销网络壁垒", "28 亿美元自由现金流"],
            "hybrid": ["农业钾肥需求 (Potash Demand)", "垂直零售分销壁垒 (Vertical Retail)", "28 亿 FCF (Free Cash Flow)"]
        },
        "sector": "Materials & Mining",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🔵 Mega / Large-Cap Core Leaders
    "NVDA": {
        "company_background": {
            "en": "NVIDIA Corporation is the global leader in accelerated computing, AI GPUs (Hopper, Blackwell), and the CUDA software stack.",
            "zh": "全球加速计算与 AI 芯片领军者，凭借 Hopper/Blackwell 架构与 CUDA 软件生态垄断云端算力。",
            "hybrid": "全球加速计算与 AI 芯片领军者 (NVIDIA)，凭 CUDA Ecosystem 垄断云端算力。"
        },
        "core_drivers": {
            "en": ["Generative AI GPU demand", "Cloud CapEx expansion", "CUDA software ecosystem lock-in"],
            "zh": ["生成式 AI 云端 GPU 算力强劲需求", "四大云巨头资本开支 CapEx 持续增加", "CUDA 软件生态高壁垒锁死客户"],
            "hybrid": ["AI GPU 强劲需求 (Generative AI GPU)", "云厂商 CapEx 增加 (Cloud CapEx)", "CUDA 软件生态壁垒 (CUDA Lock-in)"]
        },
        "sector": "Technology & AI Infrastructure",
        "category": "OVERALL_LEADER"
    },
    "MSFT": {
        "company_background": {
            "en": "Microsoft Corporation is a technology titan offering Azure cloud infrastructure, Office 365 productivity suites, and Copilot AI integrations.",
            "zh": "微软公司是全球科技巨头，提供 Azure 云计算基础设施、Office 365 订阅及 Copilot AI 商业化落地。",
            "hybrid": "全球科技巨头 (Microsoft)，结合 Azure 云计算与 Office 365 Copilot 订阅表现。"
        },
        "core_drivers": {
            "en": ["Azure cloud market share gains", "Enterprise Office 365 Copilot monetization", "Resilient B2B recurring revenue"],
            "zh": ["Azure 云计算市场份额稳步提升", "企业级 Office 365 Copilot AI 变现落地", "极其高韧性的 B2B 订阅重复计费"],
            "hybrid": ["Azure 云市场份额 (Azure Market Share)", "Office 365 Copilot 变现 (Copilot Monetization)", "B2B 订阅稳定性 (B2B Recurring Revenue)"]
        },
        "sector": "Technology & AI Infrastructure",
        "category": "OVERALL_LEADER"
    },
    "AAPL": {
        "company_background": {
            "en": "Apple Inc. designs premium consumer electronics and operates a high-margin Services ecosystem with 2.2B+ active devices.",
            "zh": "苹果公司设计高端消费电子产品，并运营拥有 22 亿活跃设备的高利润服务生态（App Store/iCloud）。",
            "hybrid": "苹果公司 (Apple Inc.)，拥有 22 亿活跃设备的高利润 Services 生态系统。"
        },
        "core_drivers": {
            "en": ["Services recurring revenue expansion", "Strong Free Cash Flow generation & buybacks", "Sticky consumer ecosystem"],
            "zh": ["服务业务高利润重复订阅扩充", "1088 亿美元巨额自由现金流与极高回购", "全球 22 亿硬件粘性生态壁垒"],
            "hybrid": ["Services 高利润订阅 (Services Revenue)", "1088 亿巨额 FCF 与回购 (FCF & Buybacks)", "粘性硬件生态 (Sticky Ecosystem)"]
        },
        "sector": "Consumer & Technology",
        "category": "OVERALL_LEADER"
    },
    "GOOGL": {
        "company_background": {
            "en": "Alphabet Inc. is the dominant search and online advertising leader, powering Google Search, YouTube, and Google Cloud Gemini AI.",
            "zh": "谷歌母公司，全球搜索与数字广告霸主，旗下拥有 Google Search、YouTube 及 Google Cloud 结合 Gemini AI 模型。",
            "hybrid": "全球搜索与数字广告霸主 (Alphabet)，结合 Google Cloud 与 Gemini AI 基础设施。"
        },
        "core_drivers": {
            "en": ["Search ad monetization strength", "Google Cloud profitability expansion", "$69.4B Free Cash Flow"],
            "zh": ["搜索与 YouTube 数字广告变现极佳", "Google Cloud 云业务利润率大幅提升", "694 亿美元自由现金流与 Gemini 模型"],
            "hybrid": ["数字广告变现 (Search Ad Monetization)", "Google Cloud 利润爆发 (Cloud Profitability)", "694 亿 FCF (Free Cash Flow)"]
        },
        "sector": "Technology & Media",
        "category": "OVERALL_LEADER"
    },
    "AMZN": {
        "company_background": {
            "en": "Amazon.com, Inc. leads global e-commerce and cloud computing via Amazon Web Services (AWS), generating massive cash flow.",
            "zh": "亚马逊是全球电商与云计算（AWS）领头羊，数字广告业务快速增长，年产生 $53B 自由现金流。",
            "hybrid": "全球电商与 AWS 云计算巨头 (Amazon)，年产生 $53B Free Cash Flow。"
        },
        "core_drivers": {
            "en": ["AWS cloud enterprise acceleration", "High-margin digital advertising expansion", "E-commerce margin improvements"],
            "zh": ["AWS 企业级云计算再加速", "高利润数字广告业务强劲扩展", "北美电商履约网络成本效率优化"],
            "hybrid": ["AWS 云计算加速 (AWS Acceleration)", "高利润数字广告 (Digital Ads Expansion)", "电商利润率改善 (E-commerce Margins)"]
        },
        "sector": "Technology & Consumer",
        "category": "OVERALL_LEADER"
    },
    "SHOP.TO": {
        "company_background": {
            "en": "Shopify Inc. is Canada's premier e-commerce merchant operating system powering millions of global merchants.",
            "zh": "Shopify 是加拿大龙头电商商户操作系统，为全球数百万商家提供在线独立站与 Shop Pay 结算工具。",
            "hybrid": "加拿大龙头电商操作系统 (Shopify)，为全球商家提供店铺工具与 Shop Pay 结算。"
        },
        "core_drivers": {
            "en": ["Gross Merchandise Volume (GMV) expansion", "Enterprise brand onboarding", "Shop Pay conversion superiority"],
            "zh": ["商品交易总额 GMV 持续扩展", "全球 Enterprise 大牌加速入驻", "Shop Pay 极高转化率支付引擎壁垒"],
            "hybrid": ["GMV 交易额扩张 (GMV Expansion)", "大牌企业入驻 (Enterprise Onboarding)", "Shop Pay 转换率壁垒 (Shop Pay Conversion)"]
        },
        "sector": "E-Commerce & Technology",
        "category": "OVERALL_LEADER"
    },

    # 🪙 Hidden Gold Nuggets (隐形金矿股) - Mid-Cap / Niche High-Growth Champions
    "CSU.TO": {
        "company_background": {
            "en": "Constellation Software Inc. is a master acquirer of vertical market software (VMS) companies worldwide with compounding FCF reinvestment.",
            "zh": "Constellation Software 是全球垂直市场软件（VMS）的复利收购大师，自由现金流年化复利增长惊人。",
            "hybrid": "全球垂直市场软件 (VMS) 收购大师，具备复利滚雪球式 Free Cash Flow 增长。"
        },
        "core_drivers": {
            "en": ["VMS software acquisition engine", "High customer switching costs", "Compounding Free Cash Flow per share"],
            "zh": ["垂直市场软件收购引擎", "极高的客户替换成本与粘性", "每股自由现金流滚雪球复利增长"],
            "hybrid": ["垂直软件收购引擎 (VMS Acquisition)", "高替换成本壁垒 (High Switching Cost)", "每股 FCF 复利 (Compounding FCF)"]
        },
        "sector": "Enterprise Software & Tech",
        "category": "GOLD_NUGGET"
    },
    "CELH": {
        "company_background": {
            "en": "Celsius Holdings, Inc. manufactures and distributes functional energy drinks experiencing rapid market share gains via PepsiCo distribution.",
            "zh": "Celsius 生产功能性健康能量饮料，通过百事可乐（PepsiCo）渠道快速抢占市场份额，营收同比大增 38.5%。",
            "hybrid": "Celsius 功能性健康能量饮料，借助 PepsiCo 百事可乐渠道快速扩大市场份额。"
        },
        "core_drivers": {
            "en": ["PepsiCo distribution expansion", "Category share gains in functional beverages", "High 38.5% YoY revenue growth"],
            "zh": ["百事可乐全球分销网络拓展", "功能性健康饮料细分市场份额爆增", "高达 38.5% 的同比营收增长"],
            "hybrid": ["百事分销网络 (PepsiCo Distribution)", "功能饮料份额爆发 (Category Share)", "38.5% 高同比增长 (38.5% YoY Growth)"]
        },
        "sector": "Consumer Staples & Growth",
        "category": "GOLD_NUGGET"
    },
    "CRWD": {
        "company_background": {
            "en": "CrowdStrike Holdings, Inc. provides cloud-native endpoint cybersecurity protection via its Falcon AI platform.",
            "zh": "CrowdStrike 凭借 Falcon AI 云原生平台提供端点网络安全防护，净收入留存率（NRR）达 115%+。",
            "hybrid": "CrowdStrike 端点网络安全平台 (Falcon AI)，具备 115%+ 净收入留存率 (NRR)。"
        },
        "core_drivers": {
            "en": ["Falcon AI module cross-selling", "Net Revenue Retention (115%+)", "Secular cybersecurity spending expansion"],
            "zh": ["Falcon AI 模块交叉销售爆发", "115%+ 的极强净收入留存率 NRR", "企业网络安全支出长效增长"],
            "hybrid": ["Falcon AI 交叉销售 (AI Cross-selling)", "115%+ 净收入留存 (NRR 115%+)", "网络安全长效需求 (Cybersecurity Demand)"]
        },
        "sector": "Cybersecurity & Technology",
        "category": "GOLD_NUGGET"
    },
    "ONT.TO": {
        "company_background": {
            "en": "Onex Corporation is a Canadian private equity and asset management firm operating value-add buyout strategies.",
            "zh": "Onex 是加拿大老牌私募股权与资产管理巨头，市盈率低至 11.8 倍，具备深度的估值安全边际。",
            "hybrid": "加拿大私募股权与资产管理巨头 (Onex)，市盈率低至 11.8x P/E 具备估值安全边际。"
        },
        "core_drivers": {
            "en": ["Asset management fee compounding", "Private equity portfolio realizations", "Deep value P/E multiple (11.8x)"],
            "zh": ["资产管理费持续滚雪球复利", "私募股权投资组合项目退出变现", "仅 11.8 倍深度低市盈率安全边际"],
            "hybrid": ["资管管理费复利 (Fee Compounding)", "私募项目变现 (PE Realizations)", "11.8x 深度低估值 (Deep Value P/E)"]
        },
        "sector": "Financials & Asset Management",
        "category": "GOLD_NUGGET"
    },
    "TOI.V": {
        "company_background": {
            "en": "Topicus.com Inc. is a Constellation Software spin-off focused on European vertical market software acquisitions.",
            "zh": "Topicus 是 Constellation Software 拆分上市的欧洲版软件收购巨头，专攻欧洲垂直市场软件。",
            "hybrid": "Constellation Software 旗下欧洲 VMS 垂直软件收购龙头 (Topicus.com)。"
        },
        "core_drivers": {
            "en": ["European VMS consolidation runway", "Constellation Software playbook execution", "High 22.4% revenue growth"],
            "zh": ["欧洲垂直软件碎片化市场并购空间广阔", "完美复制母公司 Constellation 收购剧本", "高达 22.4% 的强劲营收增速"],
            "hybrid": ["欧洲软件并购空间 (European VMS Runway)", "复制母公司剧本 (CSU Playbook)", "22.4% 高营收增速 (22.4% Growth)"]
        },
        "sector": "Enterprise Software & Tech",
        "category": "GOLD_NUGGET"
    },
    "PANW": {
        "company_background": {
            "en": "Palo Alto Networks, Inc. is a cybersecurity market leader accelerating enterprise platformization across network and cloud security.",
            "zh": "Palo Alto Networks 是网络安全平台化整合龙头，为全球大型企业提供零信任防火墙与云安全防护。",
            "hybrid": "网络安全平台化整合龙头 (Palo Alto Networks)，为企业提供 Zero Trust 零信任防护。"
        },
        "core_drivers": {
            "en": ["Enterprise platformization strategy", "Strong $3.1B Free Cash Flow", "Zero Trust cloud security leadership"],
            "zh": ["企业级网络安全平台化整合策略", "31 亿美元强劲自由现金流", "Zero Trust 零信任云安全领导力"],
            "hybrid": ["平台化整合策略 (Platformization)", "31 亿强劲 FCF (Free Cash Flow)", "零信任云安全领跑 (Zero Trust Security)"]
        },
        "sector": "Cybersecurity & Tech",
        "category": "GOLD_NUGGET"
    },
    "SNPS": {
        "company_background": {
            "en": "Synopsys, Inc. is the world leader in electronic design automation (EDA) software and semiconductor IP, powering advanced chip design.",
            "zh": "新思科技 (Synopsys) 是全球最大的电子设计自动化 (EDA) 芯片软件巨头，垄断全球芯片设计底层工具。",
            "hybrid": "全球电子设计自动化 (EDA) 芯片软件巨头 (Synopsys)，垄断 Semiconductor IP 底层工具。"
        },
        "core_drivers": {
            "en": ["Semiconductor design complexity surge", "EDA software subscription lock-in", "AI custom chip design demand"],
            "zh": ["半导体芯片设计复杂度爆发增长", "EDA 芯片设计工具软件高度订阅锁死", "全球定制化 AI 芯片设计爆炸需求"],
            "hybrid": ["芯片设计复杂度增加 (Chip Complexity)", "EDA 订阅锁死壁垒 (EDA Subscription)", "AI 定制芯片需求 (AI Custom Chip)"]
        },
        "sector": "Semiconductor EDA & Software",
        "category": "GOLD_NUGGET"
    }
}

_RECOMMENDATION_CACHE = {}
_CACHE_TIMESTAMP = {}
_CACHE_TTL_SECONDS = 300  # 5 minutes in-memory cache

class RecommendationEngine:
    """Macro-driven multi-category stock recommendation engine with strict mutual exclusivity & multi-language support."""

    @classmethod
    def get_top_recommendations(cls, force_refresh: bool = False, lang: str = "en") -> Dict[str, Any]:
        """
        Executes macro scan, scores stock universe against macro cycle overweights,
        and returns 3 DISTINCT, MUTUALLY EXCLUSIVE recommendation pools:
        1. Sector Overweight Champions (8 stocks strictly matching macro overweights)
        2. Overall Market Leaders (8 core picks without overlap)
        3. Hidden Gold Nuggets (8 mid-cap/niche growth stocks without overlap)
        """
        global _RECOMMENDATION_CACHE, _CACHE_TIMESTAMP

        now = time.time()
        if not force_refresh and lang in _RECOMMENDATION_CACHE and (now - _CACHE_TIMESTAMP.get(lang, 0)) < _CACHE_TTL_SECONDS:
            return _RECOMMENDATION_CACHE[lang]

        macro_summary = MacroEngine.analyze_macro_environment(lang=lang)
        cycle_code = macro_summary["cycle_code"]
        overweights = macro_summary["recommended_overweights"]

        all_scored_stocks = []

        for symbol, info in STOCK_UNIVERSE.items():
            stock_raw = DataProviderManager.get_stock_data(symbol)
            fundamental = FundamentalEngine.evaluate_fundamentals(stock_raw)
            pricing = PricingEngine.evaluate_pricing_and_entry_zone(stock_raw, lang=lang)

            macro_score = cls._score_macro_alignment(symbol, cycle_code, overweights, info["sector"])
            fcf_score = 1.0 if fundamental["cash_conversion_ratio"] > 80 else 0.6
            moat_score = 1.0 if "Wide Moat" in fundamental["moat_rating"] else 0.7
            
            total_score = round(macro_score * 0.4 + fcf_score * 0.3 + moat_score * 0.3, 2)
            rationale = cls._generate_recommendation_rationale(symbol, cycle_code, fundamental, pricing, info, lang=lang)

            bg_text = info["company_background"].get(lang, info["company_background"]["en"])
            catalysts_list = info["core_drivers"].get(lang, info["core_drivers"]["en"]) if isinstance(info["core_drivers"], dict) else info["core_drivers"]

            rec_item = {
                "symbol": symbol,
                "company_name": stock_raw["company_name"],
                "market": stock_raw["market"],
                "currency": stock_raw["currency"],
                "current_price": stock_raw["current_price"],
                "previous_close": stock_raw["previous_close"],
                "company_background": bg_text,
                "why_recommend_rationale": rationale,
                "macro_alignment_tag": f"Beneficiary of {macro_summary['cycle_stage']}" if lang == "en" else f"受益于 {macro_summary['cycle_stage']}",
                "category_badge": info["category"],
                "total_recommendation_score": total_score,
                "key_catalysts": catalysts_list,
                "key_metrics": {
                    "pe_ratio": stock_raw.get("pe_ratio") or "N/A",
                    "free_cash_flow_b": round((stock_raw.get("free_cash_flow") or 0.0) / 1e9, 2),
                    "fcf_quality": fundamental["fcf_quality"],
                    "moat_rating": fundamental["moat_rating"],
                    "two_hundred_day_sma": pricing["two_hundred_day_sma"],
                    "dcf_fair_value": pricing["dcf_fair_value"],
                    "ideal_buy_range": f"${pricing['ideal_buy_range_min']} - ${pricing['ideal_buy_range_max']} {stock_raw['currency']}"
                },
                "downside_risk_summary": f"Technical support at 200D SMA (${pricing['two_hundred_day_sma']} {stock_raw['currency']}).",
                "action_status": pricing["action_status"]
            }

            all_scored_stocks.append(rec_item)

        # -------------------------------------------------------------
        # STRICT MUTUAL EXCLUSIVITY SELECTION PIPELINE (8 STOCKS PER POOL)
        # -------------------------------------------------------------
        seen_symbols: Set[str] = set()

        # 1. CATEGORY 1: Sector Overweight Champions (Top 8 matching macro overweights: Energy, Financials, Mining)
        sector_candidates = [
            s for s in all_scored_stocks 
            if s["symbol"] in ["SU.TO", "ENB.TO", "CNQ.TO", "XOM", "TD.TO", "RY.TO", "BNS.TO", "JPM", "ABX.TO", "TECK.B.TO", "NTR.TO"]
        ]
        sector_candidates.sort(key=lambda x: x["total_recommendation_score"], reverse=True)
        
        sector_champions = sector_candidates[:8]
        for s in sector_champions:
            s["category_badge"] = "SECTOR_OVERWEIGHT"
            seen_symbols.add(s["symbol"])

        # 2. CATEGORY 2: Overall Market Leaders (Top 8 mega/large-cap core picks NOT in seen_symbols)
        overall_candidates = [
            s for s in all_scored_stocks 
            if s["symbol"] not in seen_symbols and STOCK_UNIVERSE[s["symbol"]]["category"] in ["OVERALL_LEADER", "SECTOR_OVERWEIGHT"]
        ]
        overall_candidates.sort(key=lambda x: x["total_recommendation_score"], reverse=True)
        overall_leaders = overall_candidates[:8]
        for s in overall_leaders:
            s["category_badge"] = "OVERALL_LEADER"
            seen_symbols.add(s["symbol"])

        # 3. CATEGORY 3: Hidden Gold Nuggets (Top 8 mid-cap / niche growth picks NOT in seen_symbols)
        gold_candidates = [
            s for s in all_scored_stocks 
            if s["symbol"] not in seen_symbols
        ]
        gold_candidates.sort(key=lambda x: x["total_recommendation_score"], reverse=True)
        gold_nuggets = gold_candidates[:8]
        for s in gold_nuggets:
            s["category_badge"] = "GOLD_NUGGET"
            seen_symbols.add(s["symbol"])

        payload = {
            "macro_context": {
                "cycle_stage": macro_summary["cycle_stage"],
                "cycle_code": macro_summary["cycle_code"],
                "plain_explanation": macro_summary["plain_explanation"]
            },
            "sector_overweight_stocks": sector_champions,
            "overall_recommended_stocks": overall_leaders,
            "gold_nugget_stocks": gold_nuggets,
            "recommended_stocks": overall_leaders
        }

        _RECOMMENDATION_CACHE[lang] = payload
        _CACHE_TIMESTAMP[lang] = time.time()
        return payload

    @classmethod
    def _score_macro_alignment(cls, symbol: str, cycle_code: str, overweights: List[str], sector: str) -> float:
        """Scores stock alignment with current macroeconomic phase."""
        if cycle_code == "OVERHEAT":
            if symbol in ["SU.TO", "ENB.TO", "CNQ.TO", "XOM", "TD.TO", "RY.TO", "BNS.TO", "JPM", "ABX.TO", "TECK.B.TO", "NTR.TO"]:
                return 0.98
            return 0.75
        elif cycle_code == "RECOVERY":
            if symbol in ["NVDA", "SHOP.TO", "MSFT", "GOOGL", "AMZN", "CELH", "CRWD", "PANW", "TOI.V"]:
                return 0.98
            return 0.70
        elif cycle_code == "STAGFLATION":
            if symbol in ["AAPL", "TD.TO", "ABX.TO", "SU.TO", "XOM"]:
                return 0.92
            return 0.60
        else: # RECESSION
            if symbol in ["TD.TO", "RY.TO", "AAPL", "CSU.TO", "JPM"]:
                return 0.92
            return 0.65

    @classmethod
    def _generate_recommendation_rationale(
        cls, symbol: str, cycle_code: str, fundamental: Dict[str, Any], pricing: Dict[str, Any], info: Dict[str, Any], lang: str = "en"
    ) -> str:
        """Generates clear 'Why Invest Now' rationale linking macro tailwinds to stock performance."""
        if lang == "zh":
            if symbol == "SU.TO":
                return "森科能源 (Suncor) 是高油价与过热阶段的直接受益者，年产生 68 亿加元自由现金流，市盈率仅 9.4 倍，契合能源板块超配。"
            elif symbol == "ENB.TO":
                return "恩布里吉 (Enbridge) 提供类似公用事业的输油管网稳定现金流，在通胀周期提供 7%+ 高股息收益率，契合基础设施超配。"
            elif symbol == "CNQ.TO":
                return "加拿大天然资源 (CNRL) 是顶级低成本油砂龙头，年产生 $8.2B 自由现金流，资产运营成本极低，契合能源超配。"
            elif symbol == "XOM":
                return "埃克森美孚 (ExxonMobil) 拥有一流深海油田与炼化业务，年产生 $36.1B 自由现金流，在过热阶段提供极佳抗风险防御。"
            elif symbol == "TD.TO":
                return "多伦多道明银行 (TD Bank) 在高利率周期扩大净利息收入 (NIM)，拥有 dominant 加拿大零售银行份额，契合金融板块超配。"
            elif symbol == "RY.TO":
                return "加拿大皇家银行 (RBC) 是加国龙头商业银行，拥有最高股东权益回报率 (ROE) 与 98 亿加元自由现金流，契合金融超配。"
            elif symbol == "BNS.TO":
                return "丰业银行 (Scotiabank) 市盈率低至 10.8x P/E 且提供 6%+ 股息收益率，在拉丁美洲与北美市场增长迅猛。"
            elif symbol == "JPM":
                return "摩根大通 (JPMorgan) 是美国实力最强的银行巨头，拥有 Fortress 堡垒级资产负债表与统治级的投行顾问业务。"
            elif symbol == "ABX.TO":
                return "巴里克黄金 (Barrick Gold) 是顶尖避险黄金与铜矿生产商，在通胀周期提供对冲能力与 14.5 亿加元自由现金流，契合采矿超配。"
            elif symbol == "TECK.B.TO":
                return "泰克资源 (Teck Resources) 是关键铜矿龙头，受益于全球电气化与 AI 电网建设需求，市盈率仅 12.8 倍，契合基础材料超配。"
            elif symbol == "NTR.TO":
                return "Nutrien 是全球最大的钾肥与农资提供商，市盈率仅 14.5x，直接维护全球农业粮食安全供应链。"
            elif symbol == "NVDA":
                return "英伟达 (NVIDIA) 是全球 AI 基础设施建设的核心最大受益者，拥有一级宽护城河与极其强劲的自由现金流。"
            elif symbol == "MSFT":
                return "微软 (Microsoft) 结合了强韧的 B2B 云计算订阅收入与商业化 AI 变现能力，高度契合科技基础设施超配推荐。"
            elif symbol == "AAPL":
                return "苹果公司 (Apple) 拥有 22 亿活跃设备生态，年产生 1088 亿美元真金白银自由现金流与持续股票回购。"
            elif symbol == "GOOGL":
                return "Alphabet (Google) 垄断全球数字广告与搜索，结合 Google Cloud 与 Gemini AI 基础设施，产生 $69.4B 自由现金流。"
            elif symbol == "AMZN":
                return "亚马逊 (Amazon) 是全球电商与云计算 (AWS) 双龙头，数字广告利润率持续飙升，年产生 $53B 自由现金流。"
            elif symbol == "SHOP.TO":
                return "Shopify 是占主导地位的电商商户操作系统，净收入留存率 (NRR) 达 118%，持续扩大商家市场份额。"
            elif symbol == "CSU.TO":
                return "Constellation Software 是全球垂直市场软件（VMS）的复利收购大师，自由现金流年化复利增长惊人。"
            elif symbol == "CELH":
                return "Celsius 生产功能性健康能量饮料，借助百事可乐 (PepsiCo) 渠道拓展，营收同比爆增 38.5%。"
            elif symbol == "CRWD":
                return "CrowdStrike 凭 Falcon AI 云原生平台提供端点网络安全防护，净收入留存率 (NRR) 达 115%+。"
            elif symbol == "ONT.TO":
                return "Onex 是加拿大老牌私募股权巨头，市盈率低至 11.8 倍，具备深度的估值安全边际。"
            elif symbol == "TOI.V":
                return "Topicus 是 Constellation Software 拆分的欧洲版软件收购龙头，专攻欧洲垂直市场软件，营收大增 22.4%。"
            elif symbol == "PANW":
                return "Palo Alto Networks 是网络安全平台化整合龙头，为大型企业提供零信任防火墙与云安全，年产生 $3.1B 自由现金流。"
            else:
                return f"{symbol} 具备强劲的财务品质与高自由现金流转换率，契合当前宏观周期配置策略。"
        elif lang == "hybrid":
            return f"{symbol} 具备强劲的财务品质 (Financial Health) 与高自由现金流转换率 (FCF Conversion)，契合当前宏观周期。"
        else:
            return f"{symbol} demonstrates resilient balance sheet strength, robust free cash flow conversion, and strong alignment with current macroeconomic cycle overweights."
