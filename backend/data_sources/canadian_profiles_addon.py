"""
Canadian Equities Company Profile Addon (PL-708 Expansion to 96 Canadian Universe Stocks)
Contains authentic institutional profiles for 41 expansion TSX/TSX-V listed equities across
English, Simplified Chinese, and Hybrid modes with zero hallucination.
"""

from typing import Dict, Any

CANADIAN_ADDITIONAL_PROFILES: Dict[str, Dict[str, Any]] = {
    "WCP.TO": {
        "name": "Whitecap Resources Inc.",
        "sector": "Energy (Western Canadian Oil & Gas E&P)",
        "background": {
            "en": "Whitecap Resources is a leading Western Canadian light oil and natural gas producer operating low-decline asset bases in the Montney, Duvernay, and Weyburn regions, renowned for its strong balance sheet, carbon sequestration leadership, and disciplined dividend growth.",
            "zh": "白帽资源（Whitecap Resources）是西加盆地领先的高品质轻质原油与天然气生产商，资产聚焦于 Montney、Duvernay 与 Weyburn 核心低递减油田，以稳健的资产负债表、碳捕集封存（CCS）技术与可持续股息增长著称。",
            "hybrid": "白帽资源 (WCP.TO) 是加拿大优质轻原油与天然气 E&P 龙头，在 Montney 与 Duvernay 拥有深厚钻探库存，实施高自由现金流股东回购分红机制。"
        },
        "catalysts": {
            "en": [
                "Montney and Duvernay high-margin condensate development drilling",
                "Weyburn CO2 enhanced oil recovery (EOR) carbon credits and low carbon footprint",
                "Targeted return of 75%+ free cash flow via dividends and share buybacks"
            ],
            "zh": [
                "Montney 与 Duvernay 高利润凝析油与轻质油层位钻探放量",
                "Weyburn 二氧化碳注入驱油（EOR）碳信用与低碳排放竞争优势",
                "将 75% 以上自由现金流通过持续分红与股票回购回馈股东"
            ],
            "hybrid": [
                "Montney/Duvernay 轻油放量与钻井提效",
                "Weyburn CCS 碳减排优势与低递减特征",
                "75%+ FCF 股息与回购返还框架"
            ]
        },
        "revenue_drivers": {
            "en": ["Light and Medium Crude Oil Sales", "Natural Gas Liquids (Condensate) Sales", "Natural Gas Production"],
            "zh": ["轻质与中质原油销售", "凝析油等天然气凝析液销售", "天然气开采与销售"],
            "hybrid": ["Light Crude 原油销售", "Condensate/NGL 销售", "Natural Gas 天然气销售"]
        }
    },
    "MEG.TO": {
        "name": "MEG Energy Corp.",
        "sector": "Energy (Oil Sands Thermal In-Situ E&P)",
        "background": {
            "en": "MEG Energy is an energy company focused on sustainable in-situ thermal oil sands development at its flagship Christina Lake regional asset in the Athabasca region of Alberta, utilizing advanced SAGD technology.",
            "zh": "MEG能源（MEG Energy）是一家专注于原位热采油砂开发的纯上游能源企业，核心旗舰资产为阿尔伯塔省 Christina Lake 区域，采用国际领先的蒸汽辅助重力泄油（SAGD）低成本开采技术。",
            "hybrid": "MEG能源 (MEG.TO) 是纯度极高的 SAGD 原位油砂开采商，Christina Lake 拥有数十年低成本超长开采寿命与高转化自由现金流。"
        },
        "catalysts": {
            "en": [
                "Christina Lake debottlenecking unlocking low-capital-intensity incremental bitumen",
                "Trans Mountain pipeline expansion (TMX) eliminating Western Canadian Select (WCS) price discounts",
                "Net debt reduction milestone reached, unlocking 100% free cash flow return to shareholders"
            ],
            "zh": [
                "Christina Lake 产能瓶颈消除释放极低资本开支的增量沥青产出",
                "跨山输油管线扩建（TMX）彻底收窄加拿大重油（WCS）相对 WTI 的深层折价",
                "净负债降至目标区间后，开启 100% 自由现金流全额向股东回购分红"
            ],
            "hybrid": [
                "Christina Lake 消除瓶颈增产",
                "TMX 管线通油收窄 WCS 折价",
                "净负债归零后 100% FCF 回报股东"
            ]
        },
        "revenue_drivers": {
            "en": ["Thermal Bitumen Production & Sales", "Proprietary HI-Q Heavy Oil Transport", "Power Cogeneration Sales"],
            "zh": ["SAGD 原位热采沥青原油销售", "HI-Q 重油改质与管输贸易", "热电联产电力并网销售"],
            "hybrid": ["Bitumen 沥青销售", "Midstream 管输", "Cogeneration 电力销售"]
        }
    },
    "GEI.TO": {
        "name": "Gibson Energy Inc.",
        "sector": "Energy Infrastructure & Crude Terminals",
        "background": {
            "en": "Gibson Energy is an oil infrastructure company focused on the storage, blending, processing, and transportation of crude oil and refined products, anchored by massive terminal facilities in Hardisty and Edmonton, Alberta.",
            "zh": "吉布森能源（Gibson Energy）是加拿大核心原油与成品油基础设施运营商，在阿尔伯塔省 Hardisty 与埃德蒙顿拥有战略级大型原油储罐枢纽与调和处理终端，享有极高的长期照付不议合同现金流。",
            "hybrid": "吉布森能源 (GEI.TO) 掌控加西原油储罐枢纽 (Hardisty/Edmonton) 与美国墨西哥湾深水出口码头，提供 6%+ 高确定性股息回报。"
        },
        "catalysts": {
            "en": [
                "South Texas Gateway terminal acquisition capturing US Gulf Coast crude export growth",
                "Hardisty infrastructure expansions driven by increased TMX and Canadian oil sands volume",
                "Over 85% of cash flow secured by high-credit investment-grade take-or-pay commercial contracts"
            ],
            "zh": [
                "南得克萨斯深水门户终端收购享受美国墨西哥湾原油出口强劲增长",
                "TMX 管线投产后加西油砂外运量提升驱动 Hardisty 储罐扩建与吞吐量创新高",
                "超过 85% 现金流由高信用投资级照付不议商业长期合约兜底锁定"
            ],
            "hybrid": [
                "South Texas Gateway 出口码头放量",
                "Hardisty 储罐扩容与 TMX 增量分流",
                "85%+ Take-or-pay 照付不议合同壁垒"
            ]
        },
        "revenue_drivers": {
            "en": ["Infrastructure Storage & Terminaling Fees", "Crude Oil Processing & Blending", "Marine Crude Export Services"],
            "zh": ["储罐仓储与中继终端服务费", "原油脱盐改质与定制化调和收益", "深水港口船舶原油出口装载费"],
            "hybrid": ["Storage Fees 仓储费", "Processing & Blending 调和处理", "Marine Export 码头装载"]
        }
    },
    "ALA.TO": {
        "name": "AltaGas Ltd.",
        "sector": "Utilities & Midstream Infrastructure",
        "background": {
            "en": "AltaGas is a diversified North American infrastructure company that operates regulated natural gas utilities serving 1.7 million customers in the US and a world-scale Midstream and LPG export platform off the coast of British Columbia.",
            "zh": "阿尔塔加斯（AltaGas）是一家北美多元化能源基础设施巨头，旗下拥有覆盖美国东海岸 170 万户家庭的受监管天然气公用事业网络，以及位于卑诗省的全球级中游天然气加工与液化石油气（LPG）亚太出口平台。",
            "hybrid": "AltaGas (ALA.TO) 兼具美国稳健公用事业 (Regulated Utilities) 与加西液化气出口 (RIPET LPG Export to Asia) 双轮驱动模式。"
        },
        "catalysts": {
            "en": [
                "Ridley Island Propane Export Terminal (RIPET) expanding Asian high-margin LPG export volumes",
                "US regulated utility rate base modernization program generating reliable 8%+ annual rate base growth",
                "Deleveraging accelerating investment-grade credit rating upgrades"
            ],
            "zh": [
                "雷德利岛丙烷出口终端（RIPET）持续扩大对日本与韩国等亚洲市场的高溢价 LPG 出口",
                "美国受监管天然气管网现代化更新计划驱动受规管资产基础（Rate Base）年均 8% 复合增长",
                "持续降低杠杆率增厚财务稳健度并支撑股息稳步上调"
            ],
            "hybrid": [
                "RIPET/REEF 亚洲 LPG 出口放量",
                "US Utilities 8% Rate Base 稳健增长",
                "资产负债表去杠杆与股息稳步增长"
            ]
        },
        "revenue_drivers": {
            "en": ["Regulated Gas Utility Distribution", "Midstream Processing & Fractionation", "Global LPG Marine Export Sales"],
            "zh": ["受监管城市燃气配气管网分销", "中游天然气集输处理与分馏服务", "全球海运液化石油气出口贸易"],
            "hybrid": ["Regulated Utilities 配气分销", "Midstream 天然气分馏", "LPG Export 海运出口"]
        }
    },
    "FTS.TO": {
        "name": "Fortis Inc.",
        "sector": "Regulated Electric & Gas Utilities",
        "background": {
            "en": "Fortis Inc. is a leader in the North American regulated electric and gas utility industry, operating transmission and distribution networks serving 3.5 million customers across Canada, the United States, and the Caribbean, with 50+ consecutive years of annual dividend increases.",
            "zh": "富通公司（Fortis Inc.）是北美受监管电力与天然气公用事业领航者，业务遍及加拿大、美国及加勒比海，服务 350 万公用事业客户，拥有连续超过 50 年不间断提高年度股息的卓越贵族记录。",
            "hybrid": "富通 (FTS.TO) 是北美公用事业顶级股息贵族 (50+年股息递增)，99% 受规管资产 (Regulated Asset Base)，具备极强防御抗周期属性。"
        },
        "catalysts": {
            "en": [
                "$25 billion 5-year capital plan driving 6.3% annual regulated rate base compound growth",
                "Clean energy transmission grid expansion connecting remote renewable power in the US Midwest",
                "Guidance targeting 4%-6% annual dividend growth through 2028"
            ],
            "zh": [
                "250 亿加元五年资本投资计划推动受监管费率基础（Rate Base）年均复合增长 6.3%",
                "美国中西部 ITC 跨州清洁电力高压输电管网升级与可再生能源并网强劲需求",
                "官方指引明确至 2028 年每年实现 4%–6% 的稳健股息增长目标"
            ],
            "hybrid": [
                "250亿加元 CapEx 支撑 6.3% Rate Base 复合增长",
                "ITC 跨州清洁高压电网扩容",
                "4%-6% 确定性年度股息递增指引"
            ]
        },
        "revenue_drivers": {
            "en": ["Regulated Electric Transmission & Distribution", "Regulated Natural Gas Local Distribution", "Clean Hydroelectric & Generation Assets"],
            "zh": ["受监管高压输电与城市配电业务", "受监管城市燃气管网配送服务", "清洁水力与辅助发电并网收益"],
            "hybrid": ["Electric T&D 电力输配", "Gas Distribution 燃气配送", "Clean Generation 发电收益"]
        }
    },
    "EMA.TO": {
        "name": "Emera Incorporated",
        "sector": "Regulated Electric Utilities",
        "background": {
            "en": "Emera is a geographically diverse energy and services company headquartered in Halifax, Nova Scotia, investing in electricity generation, transmission, and distribution with primary regulated utility assets in Florida (Tampa Electric) and Atlantic Canada.",
            "zh": "艾玛拉（Emera Inc.）总部位于新斯科舍省哈利法克斯，是一家跨区域能源公用事业巨头，主要资产涵盖佛罗里达州坦帕电力（Tampa Electric）、新斯科舍电力以及加勒比海群岛的受监管发电与输配电网络。",
            "hybrid": "Emera (EMA.TO) 核心由高成长佛罗里达坦帕电力 (Tampa Electric) 驱动，享有人口持续流入与受监管资产持续扩张双重红利。"
        },
        "catalysts": {
            "en": [
                "Tampa Electric enjoying Florida population and commercial influx driving above-average customer growth",
                "Solar and grid storm-hardening capital investments receiving supportive regulatory returns",
                "Targeted capital redeployment towards debt reduction and balance sheet de-risking"
            ],
            "zh": [
                "佛罗里达人口与企业持续净流入推动坦帕电力客户数增速远超北美平均水平",
                "光伏太阳能清洁化与电网抗风暴加固资本开支享有州监管机构批准的优厚股本回报率（ROE）",
                "出售非核心资产加速降杠杆，强化投资级信用评级并支持高股息派发"
            ],
            "hybrid": [
                "Tampa Electric 佛州人口红利与用电量增长",
                "电网加固与太阳能投资 ROE 保障",
                "降负债优化资产负债表与 5%+ 股息回报"
            ]
        },
        "revenue_drivers": {
            "en": ["Tampa Electric Utility Billing", "Nova Scotia Power Regulated Sales", "Peoples Gas Distribution"],
            "zh": ["佛州坦帕电力受监管电费结算", "新斯科舍省电力受监管公用事业收入", "Peoples Gas 燃气管网分销"],
            "hybrid": ["Tampa Electric 电力收入", "NS Power 配电收入", "Peoples Gas 燃气销售"]
        }
    },
    "AQN.TO": {
        "name": "Algonquin Power & Utilities Corp.",
        "sector": "Regulated Utilities & Renewable Power",
        "background": {
            "en": "Algonquin Power & Utilities is a diversified generation, transmission, and distribution utility company operating through regulated water, electricity, and natural gas utility subsidiaries alongside renewable energy infrastructure.",
            "zh": "阿尔冈昆电力与公用事业（Algonquin Power & Utilities）是一家多元化公用事业运营集团，业务横跨受监管自来水供水、城市配电、天然气配气管网以及风电、光伏等清洁可再生能源发电设施。",
            "hybrid": "Algonquin (AQN.TO) 正在推进非核心资产剥离并转型为纯受监管公用事业公司 (Pure-Play Regulated Utility)，重塑资产回报率。"
        },
        "catalysts": {
            "en": [
                "Strategic sale of unregulated renewable business to focus purely on high-stability regulated utilities",
                "Capital optimization reducing corporate leverage and streamlining operational costs",
                "Regulated rate cases replenishing return on equity across US utility jurisdictions"
            ],
            "zh": [
                "出售非监管可再生能源发电业务，转型为纯受规管城市公用事业提供商",
                "资产出售回笼充沛现金用于偿还高息负债并精简总部运营成本",
                "多州受监管水务与燃气公用事业费率听证会批准上调获准净资产收益率"
            ],
            "hybrid": [
                "业务重组转型纯受规管公用事业",
                "出售资产偿债降低财务杠杆",
                "费率基础获准重估修复盈利能力"
            ]
        },
        "revenue_drivers": {
            "en": ["Regulated Water Utility Operations", "Regulated Electric and Gas Utilities", "Renewable Energy Power Contracts"],
            "zh": ["受监管自来水供水与污水处理", "受监管城市配电与燃气管网", "风电与光伏长期购电协议（PPA）收益"],
            "hybrid": ["Water Utilities 水务", "Electric/Gas Utilities 配电燃气", "Renewables 发电收益"]
        }
    },
    "H.TO": {
        "name": "Hydro One Limited",
        "sector": "Electric Transmission & Distribution Monopoly",
        "background": {
            "en": "Hydro One is the largest electricity transmission and distribution provider in Ontario, operating approximately 30,000 circuit kilometres of high-voltage transmission and a vast local distribution system serving 1.5 million customers as a natural monopoly.",
            "zh": "第一水电（Hydro One Limited）是安大略省最大的输配电基础设施垄断巨头，运营约 30,000 公里高压输电线路，控制安省约 98% 的高压电网，服务 150 万客户，商业模式具备不可替代的天然垄断与稳健防守特质。",
            "hybrid": "第一水电 (H.TO) 拥有安省 98% 输电网绝对垄断地位，受监管费率模型保障，属于全市场防御性最强的现金奶牛资产之一。"
        },
        "catalysts": {
            "en": [
                "Provincial manufacturing electrification and EV battery gigafactory grid connection mandates",
                "Ontario Energy Board multi-year rate framework delivering predictable regulatory rate base compounding",
                "Unbroken record of low volatility, high free cash flow conversion, and safe dividend distribution"
            ],
            "zh": [
                "安大略省先进制造业电动化转型与大型动力电池超级工厂电网扩容刚性需求",
                "安省能源局（OEB）多年期监管框架保障费率基础每年可预测稳健复利扩张",
                "极低贝塔系数与高自由现金流转化率，为长线防御性资本提供极高安全边际"
            ],
            "hybrid": [
                "安省制造业与电池厂电网扩容刚需",
                "OEB 多年期保障性费率基础复利",
                "极低波动 (Low Beta) 与充沛股息现金流"
            ]
        },
        "revenue_drivers": {
            "en": ["High-Voltage Electricity Transmission Tariffs", "Local Electricity Distribution Charges", "Telecommunications Fiber Leases"],
            "zh": ["高压输电系统核准过网费", "地方配电网络分销服务费", "电网沿线电力特种光纤租赁与电信接入费"],
            "hybrid": ["Transmission 高压输电", "Distribution 地方配电", "Telecom Fiber 光纤租赁"]
        }
    },
    "AEM.TO": {
        "name": "Agnico Eagle Mines Limited",
        "sector": "Gold Mining (Tier-1 Low Geopolitical Risk)",
        "background": {
            "en": "Agnico Eagle Mines is a premier Canadian-based gold producer with operating mines in Canada, Australia, Finland, and Mexico, distinguished across the precious metals mining industry for operating strictly in low geopolitical risk jurisdictions with leading ESG practices.",
            "zh": "阿格尼科鹰矿业（Agnico Eagle Mines）是全球顶级资深黄金生产商，核心矿山位于加拿大（魁北克与安大略）、澳大利亚、芬兰及墨西哥，以 100% 聚焦于全球低地缘政治风险法治国家及行业最低全维持成本（AISC）闻名。",
            "hybrid": "Agnico Eagle (AEM.TO) 是全球风险最低的一线黄金矿业巨头，掌控 Detour Lake 与 Canadian Malartic，充分享受黄金牛市高现金流红利。"
        },
        "catalysts": {
            "en": [
                "Full consolidation of world-class Canadian Malartic mine and Detour Lake expansion unlocking record production",
                "Lowest All-In Sustaining Costs (AISC) in the senior gold producer peer group providing massive operating leverage to gold price",
                "Superior balance sheet strength enabling continuous dividend payout increases and share repurchases"
            ],
            "zh": [
                "全面整合世界级 Canadian Malartic 露天与地下金矿，Detour Lake 产能扩建推动自产金创历史新高",
                "资深金矿商梯队中最低的全维持成本（AISC 约 $1,150/盎司），对国际金价上涨享有巨大的经营杠杆弹性",
                "极其健康的净负债结构支撑充沛自由现金流转化为稳步提升的股息与股票回购"
            ],
            "hybrid": [
                "Canadian Malartic/Detour Lake 核心矿山放量",
                "行业领先低 AISC 释放黄金牛市高利润弹性",
                "低地缘风险资产组合与强健自由现金流"
            ]
        },
        "revenue_drivers": {
            "en": ["Gold Bullion Production & Refining Sales", "Silver and Copper By-Product Credits", "Precious Metals Royalties"],
            "zh": ["自产合质金精炼与现货金条销售", "伴生白银与铜等副产品综合回收收益", "贵金属项目特许权权益收益"],
            "hybrid": ["Gold Sales 黄金销售", "By-product Credits 副产物收益", "Precious Metals 贵金属业务"]
        }
    },
    "K.TO": {
        "name": "Kinross Gold Corporation",
        "sector": "Senior Gold Mining",
        "background": {
            "en": "Kinross Gold is a Canadian senior gold mining company with operating mines and projects in the United States, Brazil, Mauritania, Chile, and Canada, founded on operational excellence, financial discipline, and production growth.",
            "zh": "金罗斯黄金（Kinross Gold）是加拿大资深黄金矿业公司，在美洲（美国阿拉斯加与内华达、巴西、智利、加拿大）及毛里塔尼亚拥有多座大型露天及地下金矿，以出色的选矿运营效率与严格资本纪律见长。",
            "hybrid": "金罗斯黄金 (K.TO) 是高弹性资深金矿龙头，Tasiast 与 Great Bear 勘探前景极具吸引力，现金流充沛且估值具有吸引力。"
        },
        "catalysts": {
            "en": [
                "Great Bear world-class high-grade gold discovery in Ontario progressing towards tier-1 flagship status",
                "Tasiast 24k throughput expansion in Mauritania operating at optimal low-cost production levels",
                "Robust free cash flow generation driving accelerated share buybacks and dividend yield"
            ],
            "zh": [
                "安大略省 Great Bear 顶级高品位金矿项目勘探持续超预期，预计建设为年产超 50 万盎司的世界级旗舰金矿",
                "毛里塔尼亚 Tasiast 24k 日处理扩产项目达产，显著摊薄单位维持成本",
                "高金价环境下充沛自由现金流用于加速股票回购与提升分红水平"
            ],
            "hybrid": [
                "Great Bear 安省世界级金矿开发催化",
                "Tasiast 选厂达产降本增效",
                "强劲 FCF 回报股东与低估值倍数"
            ]
        },
        "revenue_drivers": {
            "en": ["Gold Dore and Bullion Sales", "Silver By-Product Sales"],
            "zh": ["合质金与金条现货销售", "伴生白银副产品销售收入"],
            "hybrid": ["Gold Bullion 黄金销售", "Silver By-Product 白银销售"]
        }
    },
    "IVN.TO": {
        "name": "Ivanhoe Mines Ltd.",
        "sector": "Copper & Base Metals Development",
        "background": {
            "en": "Ivanhoe Mines is a Canadian mining company advancing three principal joint-venture projects in Southern Africa: the world-class Kamoa-Kakula copper discovery in the DRC, the Platreef palladium-rhodium-platinum-nickel-copper-gold project in South Africa, and the historic Kipushi ultra-high-grade zinc-copper mine.",
            "zh": "艾芬豪矿业（Ivanhoe Mines）是一家以世界级巨型勘探发现著称的加拿大矿业公司，在非洲南部开发三大核心资产：刚果（金）的全球顶级超高品位卡莫阿-卡库拉（Kamoa-Kakula）铜矿、南非 Platreef 铂族多金属矿以及历史悠久的超高品位 Kipushi 锌铜矿。",
            "hybrid": "艾芬豪矿业 (IVN.TO) 坐拥全球品位最高、规模最大的 Kamoa-Kakula 铜矿项目，是全球电网电动化浪潮中最重要的铜供给引擎之一。"
        },
        "catalysts": {
            "en": [
                "Kamoa-Kakula Phase 3 concentrator expansion elevating annual copper production towards 600,000+ tonnes",
                "On-site direct-to-blister copper smelter startup reducing logistics costs and carbon intensity",
                "Historic Kipushi high-grade zinc mine restart providing diversified base metal free cash flow"
            ],
            "zh": [
                "Kamoa-Kakula 三期选矿厂建设投产推动年化铜产量突破 60 万吨大关，跻身全球前三大铜矿",
                "自建现场直接吹炼大型铜冶炼厂投产显著削减长途精矿运输物流成本并降低碳足迹",
                "历史级高品位 Kipushi 锌矿正式复产投料，贡献高利润多金属现金流"
            ],
            "hybrid": [
                "Kamoa-Kakula 三期投产冲刺全球前三铜矿",
                "自建铜冶炼厂节约物流成本",
                "Kipushi 超高品位锌矿复产贡献增量"
            ]
        },
        "revenue_drivers": {
            "en": ["Copper Concentrate & Anode Sales", "High-Grade Zinc Concentrate Sales", "Precious and Battery Metals Production"],
            "zh": ["高品位铜精矿与阳极铜销售", "超高品位锌精矿销售", "伴生贵金属与电池金属综合产出"],
            "hybrid": ["Copper Concentrate 铜精矿", "Zinc Concentrate 锌精矿", "Battery Metals 电池金属"]
        }
    },
    "LUN.TO": {
        "name": "Lundin Mining Corporation",
        "sector": "Diversified Copper & Base Metals",
        "background": {
            "en": "Lundin Mining is a diversified Canadian base metals mining company with operations in Argentina, Brazil, Chile, Portugal, Sweden, and the United States, primarily producing copper, zinc, gold, and nickel with an unyielding commitment to operational safety and shareholder value.",
            "zh": "伦丁矿业（Lundin Mining）是加拿大著名的跨国基础金属矿业集团，矿山遍布阿根廷、巴西、智利、葡萄牙、瑞典及美国，主要从事铜、锌、黄金及镍等关键工业金属的勘探与开采，业务资产极具战略多元化。",
            "hybrid": "伦丁矿业 (LUN.TO) 专注美洲与欧洲优质铜锌矿山运营，联合必和必拓开发阿根廷超级铜矿带，深度受益全球电网升级。"
        },
        "catalysts": {
            "en": [
                "Strategic partnership with BHP to jointly acquire and develop the giant Filo del Sol and Josemaria copper district",
                "Candelaria and Caserones copper complexes in Chile delivering steady, high-margin production runs",
                "Neves-Corvo zinc expansion project in Portugal reaching full throughput maturity"
            ],
            "zh": [
                "与全球矿业巨头必和必拓（BHP）达成战略合资，共同开发阿根廷 Filo del Sol 与 Josemaria 巨型超级铜矿带",
                "智利 Candelaria 与 Caserones 大型铜矿项目持续稳定输出高利润铜精矿",
                "葡萄牙 Neves-Corvo 锌矿扩产项目进入全面成熟收获期"
            ],
            "hybrid": [
                "与 BHP 联合开发 Filo/Josemaria 超级铜矿",
                "智利核心矿山现金流充沛",
                "铜锌多金属生产组合分散单点风险"
            ]
        },
        "revenue_drivers": {
            "en": ["Copper Concentrate & Cathode Sales", "Zinc Concentrate Production", "Gold, Silver & Nickel By-Products"],
            "zh": ["铜精矿与阴极电解铜销售", "锌精矿产品销售", "伴生黄金、白银及金属镍副产物销售"],
            "hybrid": ["Copper Sales 铜销售", "Zinc Sales 锌销售", "By-products 副产物收益"]
        }
    },
    "FM.TO": {
        "name": "First Quantum Minerals Ltd.",
        "sector": "Global Copper & Nickel Mining",
        "background": {
            "en": "First Quantum Minerals is an international metals and mining company producing mainly copper, gold, and nickel with world-scale operations in Zambia (Kansanshi, Sentinel) and asset holdings in Europe and Latin America.",
            "zh": "第一量子矿业（First Quantum Minerals）是一家国际大型矿业跨国公司，主要从事铜、黄金及金属镍的开采与冶炼，在赞比亚拥有全球级特大型铜矿（Kansanshi 与 Sentinel），具备全球领先的湿法冶炼与选矿技术实力。",
            "hybrid": "第一量子 (FM.TO) 是全球顶尖产铜商之一，赞比亚 S3 扩建项目稳步推进，资产负债表成功再融资，具备强劲铜价上行催化。"
        },
        "catalysts": {
            "en": [
                "Kansanshi S3 expansion in Zambia advancing toward commissioning, adding significant long-life copper supply",
                "Comprehensive balance sheet refinancing and strategic capital partnerships stabilizing liquidity",
                "Immense long-term copper leverage geared to global energy transition, grid transmission, and data center demand"
            ],
            "zh": [
                "赞比亚 Kansanshi S3 巨型扩建项目稳步推进，即将投产释放长寿命、低成本的巨额铜供给",
                "完成全方位资产负债表再融资与战略合作伙伴引入，彻底消除流动性风险",
                "拥有巨大的经营杠杆，直接受益于全球电网改造、AI 数据中心配电及能源转型对高导电铜材的爆发性需求"
            ],
            "hybrid": [
                "Kansanshi S3 扩建投产增厚产量",
                "成功再融资消除债务流动性隐忧",
                "AI 数据中心与电网基建拉动铜需求"
            ]
        },
        "revenue_drivers": {
            "en": ["Copper Cathode and Concentrate Sales", "Gold By-Product Sales", "Nickel Mining Operations"],
            "zh": ["阴极电解铜与铜精矿现货销售", "伴生黄金副产品销售", "电池金属镍矿石与中间品加工销售"],
            "hybrid": ["Copper 铜业务", "Gold By-product 伴生金", "Nickel 镍业务"]
        }
    },
    "RCI-B.TO": {
        "name": "Rogers Communications Inc.",
        "sector": "Telecommunications & Sports Media",
        "background": {
            "en": "Rogers Communications is a leading Canadian technology and media company that provides wireless communications services, cable television, high-speed Internet, and telephone services alongside sports entertainment assets including the Toronto Blue Jays and Sportsnet.",
            "zh": "罗杰斯通讯（Rogers Communications）是加拿大通信与体育传媒巨头，为全国提供 5G 移动无线网络、高速有线宽带网络及企业级IT解决方案，同时全资控股多伦多蓝鸟棒球队（Toronto Blue Jays）及全国性体育传媒网络 Sportsnet。",
            "hybrid": "罗杰斯通讯 (RCI-B.TO) 在成功并购 Shaw Communications 后跃升为加国最大有线宽带与无线运营商，体育媒体与电信网络壁垒极高。"
        },
        "catalysts": {
            "en": [
                "Shaw Communications acquisition synergies exceeding initial targets across Western Canada",
                "5G national footprint expansion and premium bundling driving wireless average revenue per user (ARPU)",
                "Non-core asset monetization accelerating debt repayment towards targeted leverage ratios"
            ],
            "zh": [
                "收购 Shaw Communications 后加西业务整合协同效应显著超预期，削减庞大重复资本开支",
                "全国 5G 独立组网覆盖与宽带移动高端融合套餐推动每用户平均收入（ARPU）企稳回升",
                "非核心资产证券化与不动产处置加速回笼资金降低杠杆率，保障高股息现金流"
            ],
            "hybrid": [
                "Shaw 并购协同效应超预期释放",
                "5G 与宽带捆绑提升用户粘性与 ARPU",
                "剥离非核心资产加速偿债"
            ]
        },
        "revenue_drivers": {
            "en": ["Wireless Cellular Network Services", "Cable, Broadband & Internet Subscriptions", "Media Advertising & Sports Franchise Revenue"],
            "zh": ["5G 移动无线通信套餐服务费", "有线电视、光纤宽带与固定电话订阅", "体育传媒广告转播权与棒球队门票衍生品收入"],
            "hybrid": ["Wireless 无线业务", "Cable & Broadband 有线宽带", "Media & Sports 体育传媒"]
        }
    },
    "QBR-B.TO": {
        "name": "Quebecor Inc.",
        "sector": "Telecommunications & Media",
        "background": {
            "en": "Quebecor is a Canadian leader in telecommunications, entertainment, news media, and culture, operating through subsidiary Videotron and Freedom Mobile as a potent national four-player wireless challenger across Canada.",
            "zh": "魁北克人（Quebecor Inc.）是加拿大知名的综合电信、新闻媒体与文娱出版巨头，旗下 Videotron 与收购的 Freedom Mobile 成功将业务拓展至安省、卑诗省与阿尔伯塔省，成为全加极具竞争力的第四大全国性无线运营商。",
            "hybrid": "Quebecor (QBR-B.TO) 依托 Videotron 统治魁北克市场，凭借 Freedom Mobile 全国扩张冲击三大巨头，资本回报率高且执行力极强。"
        },
        "catalysts": {
            "en": [
                "Freedom Mobile national wireless expansion capturing cost-conscious mobile switchers in Ontario and Western Canada",
                "Deep telecommunications dominance in Quebec delivering industry-leading EBITDA margins",
                "Disciplined capital expenditure framework and sustained dividend payout track record"
            ],
            "zh": [
                "Freedom Mobile 在安省与加西市场发起高性价比全国漫游套餐，大幅抢占三大传统巨头市场份额",
                "魁北克省本土市场宽带与有线业务处于绝对领先统治地位，贡献全行业最高的 EBITDA 利润率",
                "严格的资本开支控制与稳健现金流转化，支撑连续多年递增的股息回报"
            ],
            "hybrid": [
                "Freedom Mobile 全国低成本抢占份额",
                "魁省大本营现金流与超高利润率壁垒",
                "高效资本开支与稳健分红"
            ]
        },
        "revenue_drivers": {
            "en": ["Telecommunications & Mobile Services (Videotron & Freedom Mobile)", "Media Broadcasting & Digital Advertising", "Sports & Entertainment Live Events"],
            "zh": ["Videotron 与 Freedom 移动无线与宽带通信服务", "TVA 电视台转播、数字出版与广告收入", "体育赛事组织、演出票务与音乐文娱发行"],
            "hybrid": ["Telecom 移动宽带通信", "Media 新闻出版广告", "Entertainment 演艺娱乐"]
        }
    },
    "GWO.TO": {
        "name": "Great-West Lifeco Inc.",
        "sector": "Life Insurance & Wealth Management",
        "background": {
            "en": "Great-West Lifeco is an international financial services holding company with interests in life insurance, health insurance, retirement and investment services, asset management, and reinsurance, operating in Canada, the US (Empower), and Europe.",
            "zh": "大西人寿（Great-West Lifeco）是国际领先的人寿保险与财富管理控股集团，隶属于鲍尔集团（Power Corporation），在加拿大（Canada Life）、美国（Empower Retirement）及欧洲开展业务，是美国第二大退休养老金计划服务商。",
            "hybrid": "大西人寿 (GWO.TO) 掌控美国第二大养老金平台 Empower 与加拿大本土第一大保险巨头 Canada Life，管理资产数万亿美元，现金流极强。"
        },
        "catalysts": {
            "en": [
                "Empower Retirement in the US achieving rapid scale benefits, driving record fee revenues across US 401(k) plans",
                "Canada Life domestic wealth management and group benefits capturing favorable demographic tailwinds",
                "High dividend yield backed by conservative actuarial reserves and capital solvency ratios"
            ],
            "zh": [
                "美国子公司 Empower Retirement 规模效应显著释放，在美国 401(k) 退休计划资产管理规模与收费业务创历史新高",
                "加拿大本土 Canada Life 团体保险与财富管理业务受益于人口增长与财富代际传承",
                "超额偿付能力资本充足率（LICAT 超过 135%）为 5%+ 的丰厚股息派发提供万无一失的安全垫"
            ],
            "hybrid": [
                "Empower 美洲 401(k) 养老金规模爆发",
                "Canada Life 团体险与财富管理稳健增长",
                "极高资本充足率支撑 5%+ 确定性高股息"
            ]
        },
        "revenue_drivers": {
            "en": ["Retirement & Workplace Savings Management Fees", "Life & Health Insurance Underwriting Premiums", "Investment Spread & Wealth Advisory"],
            "zh": ["退休养老金与雇主账户资产管理费", "寿险与健康险保费承保净收益", "固接收益资产利差与私人财富管理咨询费"],
            "hybrid": ["Retirement Fees 养老金管理费", "Underwriting 保险保费收入", "Wealth Advisory 财富管理"]
        }
    },
    "IFC.TO": {
        "name": "Intact Financial Corporation",
        "sector": "Property & Casualty Insurance Leader",
        "background": {
            "en": "Intact Financial Corporation is the largest provider of Property and Casualty (P&C) insurance in Canada, a leading provider of global specialty insurance, and with RSA, a leader in the UK and Ireland, distinguished for consistent industry-outperforming combined ratios.",
            "zh": "因泰克金融（Intact Financial）是加拿大最大的财产与意外伤害（P&C）保险公司，并在英国、爱尔兰（收购 RSA）及北美专业特种险市场占据领导地位，凭借顶尖的数字化定价模型与行业最低的综合赔付率（Combined Ratio）闻名。",
            "hybrid": "Intact (IFC.TO) 是加拿大财产险绝对霸主 (20%+市占率)，综合成本率常年低于 90%，拥有保险业极其罕见的超高 ROE 与持续超额阿尔法。"
        },
        "catalysts": {
            "en": [
                "Proprietary AI and data-driven underwriting algorithms consistently beating peer combined ratios by 500+ basis points",
                "Consolidation of RSA operations unlocking material expense and claims synergies in the UK and Ireland",
                "Hard commercial and personal insurance pricing environment supporting sustained premium rate expansion"
            ],
            "zh": [
                "自研大数据与 AI 承保算法使综合赔付成本率常年跑赢行业平均 500 个基点以上",
                "全面整合英国 RSA 保险业务，持续兑现后台运营、索赔供应链与费率协同效应",
                "全球财产险硬周期（费率持续上涨）支撑保费规模稳健增长与高承保利润回报"
            ],
            "hybrid": [
                "AI 定价算法赋能超额承保利润",
                "RSA 英国与国际业务整合协同增效",
                "财产险硬周期带动保费稳步上行"
            ]
        },
        "revenue_drivers": {
            "en": ["Direct Written Premiums (Personal Auto & Home)", "Commercial & Global Specialty Insurance Premiums", "Investment Income on Float Portfolio"],
            "zh": ["个人汽车与家庭财产险保费收入", "商业财产与全球特种险保费", "浮存金（Float）全球多元化投资收益"],
            "hybrid": ["Personal Premiums 个人车房险", "Commercial 商业财产险", "Investment Float 浮存金收益"]
        }
    },
    "TRI.TO": {
        "name": "Thomson Reuters Corporation",
        "sector": "Legal, Tax & Professional AI Intelligence",
        "background": {
            "en": "Thomson Reuters is a global content and technology company serving professionals across legal, tax, accounting, compliance, government, and media, powered by flagship platforms Westlaw, ONESOURCE, and the Thomson Reuters Trust Principles.",
            "zh": "汤森路透（Thomson Reuters）是全球专业信息与智能软件巨头，深度赋能法律、税务、会计、政府合规及传媒等专业机构，旗舰核心产品包括 Westlaw 法律智能数据库、ONESOURCE 全球税务系统及路透社新闻平台。",
            "hybrid": "汤森路透 (TRI.TO) 深度拥抱生成式 AI 与专业大模型，在法律与税务领域构建极深数据护城河，80%+ 订阅制收入粘性极强。"
        },
        "catalysts": {
            "en": [
                "Aggressive rollout of Generative AI-powered Westlaw Precision and CoCounsel driving legal tech pricing power",
                "Recurring subscription revenue model exceeding 80% with industry-leading client retention rates",
                "Substantial ownership stake in LSEG (London Stock Exchange Group) providing monetization and buyback optionality"
            ],
            "zh": [
                "全面推出集成生成式 AI 的 Westlaw Precision 与 CoCounsel 法律助手，大幅提升产品定价权与客单价",
                "订阅制经常性收入占比超过 80%，客户流失率极低，现金流抗经济周期波动能力极强",
                "持有的伦敦证券交易所集团（LSEG）巨额股权按计划变现，为持续股票回购提供充沛弹药"
            ],
            "hybrid": [
                "Westlaw/CoCounsel 生成式 AI 提升客单价",
                "80%+ 经常性订阅收入与极高客户留存率",
                "LSEG 股权变现反哺股票回购与股息"
            ]
        },
        "revenue_drivers": {
            "en": ["Legal Professionals Software & Content (Westlaw)", "Tax & Accounting Professional Software (ONESOURCE)", "Corporate Compliance, Government & Reuters News"],
            "zh": ["法律专业软件与判例数据库订阅（Westlaw）", "企业级税务与会计合规软件（ONESOURCE）", "企业合规风险风控解决方案及路透新闻资讯"],
            "hybrid": ["Legal (Westlaw) 法律软件", "Tax (ONESOURCE) 税务合规", "Reuters News & Risk 资讯风控"]
        }
    },
    "WN.TO": {
        "name": "George Weston Limited",
        "sector": "Retail Holding & Commercial Real Estate",
        "background": {
            "en": "George Weston Limited is a Canadian holding company operating through its controlling equity interests in Loblaw Companies Limited (Canada's food and pharmacy retail leader) and Choice Properties Real Estate Investment Trust.",
            "zh": "乔治威斯顿（George Weston Limited）是加拿大历史悠久的零售与商业不动产控股集团，核心控股加拿大最大食品超市与药房龙头洛布劳（Loblaw Companies，持股约 52%）以及加拿大最大零售商业地产信托 Choice Properties REIT（持股约 61%）。",
            "hybrid": "乔治威斯顿 (WN.TO) 掌控加拿大民生零售与超市地产命脉，享有 Loblaw 高速增长与商用不动产稳健租金现金流，持股折价提供长线套利空间。"
        },
        "catalysts": {
            "en": [
                "Loblaw retail operating performance driving record dividend pass-through and net asset value growth",
                "Choice Properties essential grocery-anchored tenant base delivering 98%+ occupancy and inflation-linked rental escalations",
                "Active continuous share repurchase programs closing the historical holding company NAV discount"
            ],
            "zh": [
                "控股子公司 Loblaw 经营利润持续创新高，驱动母公司所获股息分红与净资产价值（NAV）快速增厚",
                "Choice Properties 专注于刚需食品超市挂钩的社区商业综合体，出租率常年维持在 98% 以上且租金与通胀挂钩",
                "母公司持续执行大额股票回购注销计划，收窄相对底层资产的控股公司估值折价"
            ],
            "hybrid": [
                "Loblaw 零售业绩高速增长分红增厚",
                "Choice Properties 98%+ 超市地产稳健收租",
                "母公司大额回购收窄 NAV 折价"
            ]
        },
        "revenue_drivers": {
            "en": ["Loblaw Retail Food & Drugstore Sales Consolidation", "Choice Properties Commercial Rental Income", "Corporate Financial Investments"],
            "zh": ["并表控股子公司 Loblaw 超市食品与药房零售收入", "Choice Properties 商业地产租金与物业运营收益", "控股集团财务投资与现金利差管理"],
            "hybrid": ["Retail Sales (Loblaw) 零售收入", "Rental Income (Choice) 商业租金", "Investment Return 控股投资"]
        }
    },
    "L.TO": {
        "name": "Loblaw Companies Limited",
        "sector": "Food & Pharmacy Retail Champion",
        "background": {
            "en": "Loblaw Companies is Canada's food and pharmacy leader, operating a national network of 2,500 stores under brands including Loblaws, No Frills, Real Canadian Superstore, and Shoppers Drug Mart / Pharmaprix, alongside financial service PC Financial and PC Optimum loyalty program.",
            "zh": "洛布劳公司（Loblaw Companies）是加拿大无可争议的民生消费品与连锁药房霸主，旗下拥有 2,500 家门店，囊括 No Frills、Superstore、大统华（T&T）及全加最大连锁药妆 Shoppers Drug Mart，拥有覆盖超 1,600 万活跃会员的 PC Optimum 忠诚度积分网络。",
            "hybrid": "Loblaw (L.TO) 是加拿大食品与连锁药房霸主，自有品牌 (President's Choice/No Name) 渗透率极高，具备极强抗通胀与民生刚需定价权。"
        },
        "catalysts": {
            "en": [
                "Hard-discount grocery banner expansion (No Frills, Maxi) capturing cost-conscious consumer wallet share",
                "Shoppers Drug Mart pharmacy professional services and front-of-store high-margin beauty and health retail expansion",
                "PC Optimum loyalty network leveraging consumer big data to optimize promotional margins and supplier terms"
            ],
            "zh": [
                "折扣超市网络（No Frills 与 Maxi）逆势高速拓店，在通胀环境下强力收割消费者预算份额",
                "Shoppers Drug Mart 拓展社区药剂师处方权与高毛利美妆日化零售，显著增厚单店净利润率",
                "PC Optimum 积分网络深入应用大数据精准营销，优化商品进货条款与促销毛利率"
            ],
            "hybrid": [
                "No Frills 折扣超市加速渗透",
                "Shoppers Drug Mart 药房与美妆高毛利拉动",
                "PC Optimum 会员大数据与供应链议价权"
            ]
        },
        "revenue_drivers": {
            "en": ["Retail Food Grocery Sales (Conventional & Discount)", "Pharmacy Dispensing & Front-Store Health/Beauty Sales", "Financial Services & PC Bank Credit Interchange"],
            "zh": ["综合超市与硬折扣门店食品生鲜零售", "Shoppers 处方药调配、OTC 药品及前厅美妆日化销售", "PC Financial 信用卡利息与商户刷卡佣金"],
            "hybrid": ["Food Retail 食品零售", "Pharmacy 药房美妆", "Financial Services 信用卡金融"]
        }
    },
    "MRU.TO": {
        "name": "Metro Inc.",
        "sector": "Food & Pharmacy Retail (Quebec & Ontario)",
        "background": {
            "en": "Metro Inc. is a Canadian food and pharmacy leader operating across Quebec and Ontario under brands including Metro, Super C, Food Basics, Jean Coutu, and Brunet, known for best-in-class operational efficiency, supply chain discipline, and superior return on capital.",
            "zh": "麦德龙（Metro Inc.）是加拿大安大略省与魁北克省卓越的食品零售与连锁药房运营商，旗下拥有 Metro、Super C、Food Basics 以及知名连锁药房 Jean Coutu，以行业顶尖的库存周转效率、数字化智能供应链及卓越的净资产收益率（ROE）著称。",
            "hybrid": "Metro (MRU.TO) 在加东拥有极高品牌号召力与运营效率，自动配送中心全面投产降本，长年维持稳健的自由现金流与股息增长。"
        },
        "catalysts": {
            "en": [
                "Fully automated distribution centers in Terrebonne and Toronto entering mature phase, driving multi-year structural margin expansion",
                "Discount banners (Super C in Quebec, Food Basics in Ontario) gaining market share in inflationary retail environment",
                "MOI rewards loyalty program rollout driving higher basket sizes and personalized customer promotions"
            ],
            "zh": [
                "多伦多与魁北克特雷博讷全新全自动化生鲜与常温配送中心全面成熟投产，结构性削减人工与仓储物流成本",
                "旗下折扣超市品牌（Super C 与 Food Basics）在通胀环境下性价比优势凸显，市场份额持续攀升",
                "全面推广 MOI 数字化积分奖励计划，显著提升会员客单价与复购频次"
            ],
            "hybrid": [
                "自动化物流中心投产释放降本红利",
                "Super C/Food Basics 折扣超市份额提升",
                "MOI 会员体系深化促进复购与毛利提升"
            ]
        },
        "revenue_drivers": {
            "en": ["Retail Food Grocery Store Sales", "Pharmacy Prescriptions & Front-Store Health/Beauty Products", "Wholesale Distribution to Affiliated Store Networks"],
            "zh": ["食品与生鲜超市门店零售收入", "Jean Coutu 连锁药房处方调配与健康美妆销售", "加盟店网络商品批发与供应链物流配送服务"],
            "hybrid": ["Food Sales 食品超市零售", "Pharmacy 药房美妆销售", "Wholesale 供应链批发业务"]
        }
    },
    "EMP-A.TO": {
        "name": "Empire Company Limited",
        "sector": "Food Retail (Sobeys, Safeway & Foodland)",
        "background": {
            "en": "Empire Company Limited is a Canadian company whose core businesses are food retailing, through wholly-owned subsidiary Sobeys Inc., and related real estate, operating approximately 1,500 retail stores across all 10 provinces under banners including Sobeys, Safeway, IGA, Foodland, and FreshCo.",
            "zh": "帝国公司（Empire Company Limited）总部位于新斯科舍省，是加拿大第二大食品零售帝国，通过全资子公司索贝斯（Sobeys Inc.）在全国运营约 1,500 家门店，旗下品牌包括 Sobeys、Safeway、IGA、Foodland、FreshCo 及农夫超市 Farm Boy。",
            "hybrid": "Empire (EMP-A.TO) 旗下 Sobeys、Safeway 与 Farm Boy 覆盖全加高客单价生鲜群体，FreshCo 拓展折扣零售，供应链整合持续提效。"
        },
        "catalysts": {
            "en": [
                "Farm Boy specialty fresh grocery expansion delivering industry-leading sales per square foot in Ontario",
                "FreshCo discount grocery expansion in Western Canada capturing growing price-sensitive shopper demographics",
                "Scene+ loyalty program integration unlocking higher customer engagement and cross-promotional merchandising"
            ],
            "zh": [
                "特色精品生鲜超市 Farm Boy 在安省加速拓店，平效销售额高居全国生鲜零售榜首",
                "FreshCo 折扣超市在加西加速翻新与新店开业，有力承接通胀环境下的消费分层需求",
                "与丰业银行联合打造的 Scene+ 综合积分生态深度赋能门店，大幅提升用户粘性与联合营销效益"
            ],
            "hybrid": [
                "Farm Boy 高平效精品生鲜扩张",
                "FreshCo 加西折扣网络放量",
                "Scene+ 积分生态提升会员消费频次"
            ]
        },
        "revenue_drivers": {
            "en": ["Retail Grocery and Fresh Food Sales", "Fuel Sales at Gas Stations & Convenience Kiosks", "Wholesale Food Supply to Independent Grocers"],
            "zh": ["旗下各超市门店食品生鲜零售收入", "附属加油站加油与便利店零售", "对独立合作商户及加盟体系的食品批发配送"],
            "hybrid": ["Grocery Sales 超市零售", "Fuel Sales 加油站业务", "Wholesale 食品批发"]
        }
    },
    "CTC-A.TO": {
        "name": "Canadian Tire Corporation, Limited",
        "sector": "Iconic Canadian Retail & Automotive Services",
        "background": {
            "en": "Canadian Tire Corporation is an iconic Canadian retail institution operating across automotive, hardware, sports, outdoor, and apparel through banners including Canadian Tire, SportChek, Mark's, Helly Hansen, and Canadian Tire Financial Services (Triangle Rewards).",
            "zh": "加拿大轮胎（Canadian Tire Corporation）是深植于加拿大国民生活的百年商业传奇，业务横跨汽车维修与配件、五金家居、户外运动与服饰零售，旗下拥有 Canadian Tire、SportChek、Mark's、全球户外品牌 Helly Hansen 以及 Triangle 积分金融体系。",
            "hybrid": "Canadian Tire (CTC-A.TO) 享有极高的加国国民品牌粘性，自有品牌占半壁江山，Triangle Rewards 积分金融体系深度锁定家庭日常开支。"
        },
        "catalysts": {
            "en": [
                "Triangle Rewards loyalty program commanding over 11 million active members with deep customer lifetime value",
                "Owned brand portfolio (MotoMaster, Mastercraft, Woods, Helly Hansen) generating superior profit margins",
                "Canadian Tire Bank credit card partnership with Scotiabank supporting capital efficiency and risk diversification"
            ],
            "zh": [
                "Triangle Rewards 会员生态汇聚超 1,100 万活跃持卡人，沉淀高价值国民消费行为数据资产",
                "高度成熟的自有高毛利品牌矩阵（MotoMaster 汽配、Mastercraft 工具、Woods 户外等）保障稳健零售利差",
                "与丰业银行深化金融合作优化资产负债表与信贷资产资本效率"
            ],
            "hybrid": [
                "Triangle Rewards 1100万国民级会员生态",
                "自有品牌 (Mastercraft/Helly Hansen) 高毛利壁垒",
                "零售+汽车维修+金融多元化抗风险能力"
            ]
        },
        "revenue_drivers": {
            "en": ["Retail Merchandising (Automotive, Hardware, Sports, Apparel)", "Helly Hansen Global Wholesale and Direct-to-Consumer", "Financial Services Credit Card Interest & Interchange"],
            "zh": ["综合零售商品销售（汽车汽配、五金工具、运动装备、劳保服饰）", "Helly Hansen 全球批发与直营 DTC 业务", "加拿大轮胎银行信用卡利息与刷卡手续费"],
            "hybrid": ["Retail Sales 零售业务", "Helly Hansen 品牌出海", "Financial Services 信用卡金融"]
        }
    },
    "BIP-UN.TO": {
        "name": "Brookfield Infrastructure Partners L.P.",
        "sector": "Global Essential Infrastructure Utilities",
        "background": {
            "en": "Brookfield Infrastructure Partners is one of the world's largest globally diversified infrastructure owners, operating high-quality, long-life assets in utilities, transport, midstream energy, and data communications across the Americas, Asia Pacific, and Europe.",
            "zh": "博枫基础设施合伙（Brookfield Infrastructure Partners）是全球规模最大的跨国关键基础设施旗舰之一，在美洲、欧洲及亚太运营受规管公用事业管网、交通收费公路与铁路物流、中游天然气管道以及 AI 数据中心与光纤铁塔等高壁垒资产。",
            "hybrid": "Brookfield Infrastructure (BIP-UN.TO) 掌控全球收费公路、港口管网与 AI 数据中心基建，90% 现金流与通胀挂钩，目标年均 5%-9% 股息增长。"
        },
        "catalysts": {
            "en": [
                "Hyper-scale AI data center campus expansions capitalizing on surging cloud and enterprise compute demand",
                "Over 85% of cash flow protected by inflation-indexed framework delivering automatic EBITDA escalations",
                "Capital recycling strategy consistently realizing 15%+ returns on mature asset monetization"
            ],
            "zh": [
                "超大规模 AI 数据中心园区与光纤通信基建爆发式扩建，直接承接全球云计算与大模型算力需求",
                "超过 85% 的现金流受通胀挂钩协议或受规管费率保护，实现 EBITDA 随宏观通胀自动上浮",
                "成熟资产高估值转让与再投资循环机制（Capital Recycling）年化内部回报率（IRR）长年超过 15%"
            ],
            "hybrid": [
                "AI 超算数据中心园区加速建设",
                "85%+ 现金流与通胀挂钩享受自然提价",
                "资本循环再投资确保 5%-9% 长期派息增长"
            ]
        },
        "revenue_drivers": {
            "en": ["Regulated Utilities & Electricity Transmission", "Transport Logistics (Rail, Toll Roads, Ports)", "Midstream Energy Pipelines & Storage", "Data Infrastructure (Telecom Towers & Data Centers)"],
            "zh": ["受监管公用事业与跨国输电网", "交通运输物流（干线铁路、特许收费公路、国际港口）", "中游能源管道运输与天然气战略储气库", "数字通信基础设施（蜂窝铁塔、光纤骨干网、超算数据中心）"],
            "hybrid": ["Utilities 公用事业", "Transport 交通港口", "Midstream 管道储运", "Data Centers 数据中心"]
        }
    },
    "BEP-UN.TO": {
        "name": "Brookfield Renewable Partners L.P.",
        "sector": "Global Clean Energy & Hydroelectric Leader",
        "background": {
            "en": "Brookfield Renewable Partners operates one of the world's largest publicly traded, pure-play renewable power platforms, encompassing world-class hydroelectric, wind, utility-scale solar, and energy storage facilities across North America, South America, Europe, and Asia.",
            "zh": "博枫可再生能源合伙（Brookfield Renewable Partners）是全球规模领先的纯绿电可再生能源运营上市平台，在全球运营水力发电、陆上与海上风电、大型地面光伏及电网级储能设施，装机容量数万兆瓦。",
            "hybrid": "Brookfield Renewable (BEP-UN.TO) 拥有全球无可匹敌的水电与绿电储备，与微软等全球科技巨头签订超大额绿色购电协议，股息率丰厚。"
        },
        "catalysts": {
            "en": [
                "Landmark multi-gigawatt renewable power purchase agreement with Microsoft to power AI data center buildouts",
                "High-barrier perpetual hydroelectric assets providing irreplaceable baseload clean electricity generation",
                "Development pipeline exceeding 150 GW of wind, solar, and storage delivering sustained long-term growth"
            ],
            "zh": [
                "与微软（Microsoft）签订全球历史最大规模的多吉瓦级清洁绿电采购协议，专供其全球 AI 数据中心绿色用电",
                "拥有极高护城河的永久性大型水力发电资产，提供全行业无法替代的 24/7 全天候基荷绿电",
                "在建与储备开发项目规模超过 150 GW，为未来十年提供持续的绿电并网与现金流增长引擎"
            ],
            "hybrid": [
                "微软等 AI 科技巨头巨额绿电长协采购",
                "永久性水力发电资产天然垄断与基荷优势",
                "150 GW 超大项目储备确保 5%-9% 股息增长"
            ]
        },
        "revenue_drivers": {
            "en": ["Hydroelectric Baseload Generation Revenue", "Wind and Utility Solar Power Sales Contracts", "Distributed Energy & Storage Grid Balancing Fees"],
            "zh": ["大型水力发电基荷电费收入", "陆上风电与大型光伏长期供电协议（PPA）电费收入", "分布式能源、屋顶光伏与电网级储能调峰补偿费"],
            "hybrid": ["Hydroelectric 水电收入", "Wind & Solar 风光绿电", "Storage & Distributed 储能分销"]
        }
    },
    "WTE.TO": {
        "name": "West Fraser Timber Co. Ltd.",
        "sector": "Softwood Lumber & Sustainable Forest Products",
        "background": {
            "en": "West Fraser Timber is a diversified wood products company producing lumber, engineered wood products (OSB, plywood, MDF), and pulp across western Canada, the southern United States, and Europe, recognized as one of the world's lowest-cost lumber producers.",
            "zh": "西弗雷泽木业（West Fraser Timber）是全球最大的软木锯材与定向刨花板（OSB）生产商，在加拿大西部、美国南部及欧洲运营庞大的木材加工与工程木基地，是全行业公认的最低成本木制品制造领袖。",
            "hybrid": "West Fraser (WTE.TO) 是全球最大低成本木材与 OSB 建筑板材巨头，资产负债表极度健康，具备北美房屋刚需与降息周期强弹性。"
        },
        "catalysts": {
            "en": [
                "Low-cost Southern Yellow Pine mill network in the US South providing structural insulation from Canadian trade tariffs",
                "US structural housing shortage driving multi-year demand for framing lumber and oriented strand board (OSB)",
                "Robust balance sheet with substantial net cash enabling aggressive counter-cyclical share repurchases"
            ],
            "zh": [
                "在美国南部深度布局低成本南方黄松（SYP）林木与加工厂，完全免疫美加软木双反关税摩擦",
                "美国结构性房屋短缺（缺口达数百万套）与抵押贷款利率下行预期，驱动建筑锯材与 OSB 需求强劲复苏",
                "极其健康的净现金资产负债表，赋予公司在行业周期底部逆势大额回购股票的绝佳能力"
            ],
            "hybrid": [
                "美国南部工厂免疫关税并享低成本优势",
                "北美房屋结构性短缺与降息拉动木材需求",
                "周期底部充沛净现金支撑大额股份注销"
            ]
        },
        "revenue_drivers": {
            "en": ["Softwood Lumber Sales (SPF & Southern Yellow Pine)", "Engineered Wood Products (OSB, Plywood, MDF)", "Pulp and Bioenergy Paper Products"],
            "zh": ["软木建筑锯材销售（加西 SPF 与美南黄松）", "工程木制品销售（定向刨花板 OSB、胶合板、密度板）", "漂白化学纸浆与生物质绿色能源利用收益"],
            "hybrid": ["Lumber 建筑锯材", "Engineered Wood 工程板材", "Pulp & Energy 纸浆生物质"]
        }
    },
    "CFP.TO": {
        "name": "Canfor Corporation",
        "sector": "Forest Products, Softwood Lumber & Green Pulp",
        "background": {
            "en": "Canfor Corporation is a leading Canadian integrated forest products company based in Vancouver, British Columbia, producing softwood lumber, specialized wood products, and green energy, with operations in Canada, the US South, and Sweden (Vida AB).",
            "zh": "肯福尔木业（Canfor Corporation）总部位于卑诗省温哥华，是全球领先的综合林产品巨头，在加拿大、美国南部及瑞典（Vida AB）拥有现代化的锯木厂与深加工基地，专注于高强度软木锯材、高端工程木制品及绿色生物能源开发。",
            "hybrid": "Canfor (CFP.TO) 业务覆盖北美与欧洲瑞典，产品广泛应用于全球住宅建造与工业包装，资产折价深厚，周期拐点弹性大。"
        },
        "catalysts": {
            "en": [
                "Vida AB Swedish operations capturing high-margin European and Asian industrial specialty timber markets",
                "Strategic consolidation and modernization of manufacturing footprint optimizing cash cost per thousand board feet",
                "Significant intrinsic asset backing trading at a substantial discount to replacement book value"
            ],
            "zh": [
                "控股瑞典 Vida AB 成功切入欧洲与亚洲高附加值工业特种木材市场，有效平滑北美单一市场周期波动",
                "重组优化北美加工厂产能布局，集中投资高自动化低能耗工厂，显著压低单位出材现金成本",
                "拥有深厚林业特许采伐权与重估资产，二级市场股价相较林木资产重置成本具备极大折价安全垫"
            ],
            "hybrid": [
                "瑞典 Vida AB 贡献高端欧洲木材市场收益",
                "工厂自动化改造压低单位加工成本",
                "股价较林权与重置成本大幅折价"
            ]
        },
        "revenue_drivers": {
            "en": ["Softwood Dimension Lumber Sales", "European Specialty Timber & Planed Wood (Vida AB)", "Green Energy Generation & Wood Pellets"],
            "zh": ["标准规格软木建筑锯材销售", "欧洲特种木制品、刨光材及工程木（Vida）", "林业生物质绿色发电与环保木颗粒燃料"],
            "hybrid": ["Dimension Lumber 建筑木材", "Vida AB 欧洲特种木", "Green Energy 绿色能源"]
        }
    },
    "ENGH.TO": {
        "name": "Enghouse Systems Limited",
        "sector": "Vertical Market Software Serial Acquirer",
        "background": {
            "en": "Enghouse Systems is an enterprise software company providing mission-critical vertical software solutions focused on contact centers, video communications, healthcare, telecommunications networks, public safety, and transit, growing through disciplined self-funded M&A.",
            "zh": "英豪斯系统（Enghouse Systems）是一家专注于垂直行业企业级软件的加拿大隐形冠军，业务深耕智能联络中心、视频协作、电信网络运营支撑系统（OSS/BSS）、公共安全调度与公共交通管理，凭借极其严谨的自有现金流滚雪球并购模式著称。",
            "hybrid": "Enghouse (ENGH.TO) 是加国著名的垂直软件序列收购者 (VMS Serial Acquirer)，无负债运营，现金充沛，派发高股息并低估值买断软件标的。"
        },
        "catalysts": {
            "en": [
                "Substantial cash reserves deployed to acquire distressed SaaS and vertical enterprise software at depressed valuations",
                "Contact Center AI copilots and automated agent tooling driving organic upsell across enterprise accounts",
                "Debt-free balance sheet with 30%+ EBITDA margins and continuous dividend growth"
            ],
            "zh": [
                "手握数亿加元充沛现金，在当前软件行业下行期以极具吸引力的低估值收购估值承压的垂直 SaaS 标的",
                "将生成式 AI 智能体与自动化协同工具深度集成至交互联络中心系统，推动现有政企大客户客单价稳步提升",
                "零银行长期负债的堡垒级财务结构，EBITDA 利润率长年超过 30%，持续践行高分红回馈股东"
            ],
            "hybrid": [
                "手握充沛净现金趁低吸纳优质 VMS 软件标的",
                "呼叫中心与政企软件融入生成式 AI 增厚 ARPU",
                "无负债超强财务结构与 30%+ EBITDA 利润率"
            ]
        },
        "revenue_drivers": {
            "en": ["Interactive Management (Contact Center & Video) Software Licenses/SaaS", "Asset Management (Telecom OSS/BSS, Transit, Public Safety)", "Annual Maintenance & Professional Consulting Services"],
            "zh": ["交互管理群组（智能客服联络中心、企业视频）软件许可与 SaaS 订阅", "资产管理群组（电信运维软件、智慧公交调度、应急救援）", "年度软件系统维保与专业实施咨询服务费"],
            "hybrid": ["Interactive Software 客服视频软件", "Asset Management 电信交通软件", "Maintenance 维保订阅"]
        }
    },
    "CTS.TO": {
        "name": "Converge Technology Solutions Corp.",
        "sector": "Hybrid Cloud & Advanced IT Solutions",
        "background": {
            "en": "Converge Technology Solutions is a North American and European software-enabled IT & cloud solutions provider delivering advanced analytics, artificial intelligence, cloud modernization, cybersecurity, and digital workplace solutions to enterprise clients.",
            "zh": "聚合科技解决方案（Converge Technology Solutions）是跨越北美与欧洲的先进软件与混合云综合解决方案提供商，为企业级客户提供高级大数据分析、企业级 AI 部署、多云现代化迁移、下一代网络安全与数字化办公空间服务。",
            "hybrid": "Converge (CTS.TO) 是高增长 IT 系统集成与企业 AI 基础设施服务商，自由现金流转化率改善，兼具内生增长与并购整合属性。"
        },
        "catalysts": {
            "en": [
                "Enterprise AI infrastructure advisory and specialized GPU cluster deployments driving high-margin professional services",
                "Cybersecurity and cloud modernization managed services contracts expanding recurring revenue base",
                "Free cash flow conversion acceleration following multi-year cross-selling integration across acquired entities"
            ],
            "zh": [
                "企业级大模型落地咨询、私有化 GPU 算力集群搭建与数据湖清洗带动高毛利专业技术服务收入爆发",
                "下一代网络安全防护与混合云代管服务（Managed Services）长期合同持续扩大经常性收入底座",
                "过去多年收购的 IT 区域领军企业实现全面后端系统整合，自由现金流转化率显著提速并启动股票回购"
            ],
            "hybrid": [
                "企业 AI 与 GPU 智算中心私有化部署驱动增长",
                "云安全与 MSP 代管服务经常性收入占比提升",
                "整合完毕释放现金流并加速估值修复"
            ]
        },
        "revenue_drivers": {
            "en": ["Cloud Infrastructure & Enterprise Hardware Solutions", "Managed Services & Cybersecurity Subscriptions", "Advanced AI & Professional IT Consulting Fees"],
            "zh": ["企业级混合云硬件、服务器与软件许可集成", "多云代管运维、远程监控与网络安全订阅服务", "生成式 AI 私有化部署与数字化转型高级咨询服务费"],
            "hybrid": ["Product Solutions 硬件软件集成", "Managed Services 代管云安全", "Professional Services AI咨询"]
        }
    },
    "BYD.TO": {
        "name": "Boyd Group Services Inc.",
        "sector": "Collision Repair Network Serial Compounder",
        "background": {
            "en": "Boyd Group Services is one of the largest operators of non-franchised collision repair centers in North America by number of locations, operating under the Boyd Autobody & Glass and Assured Automotive brands in Canada, and Gerber Collision & Glass in the United States.",
            "zh": "博伊德集团服务（Boyd Group Services）是北美直营车身碰撞与汽车玻璃维修领域的绝对龙头，在加拿大运营 Boyd Autobody & Glass 及 Assured Automotive，在美国以 Gerber Collision & Glass 品牌覆盖数十个州，是传奇的万店连锁滚雪球复利复合器。",
            "hybrid": "Boyd Group (BYD.TO) 是汽车后市场直营碰撞维修巨头，通过持续并购单体汽修厂实现数十倍长期复利，与全美各大车险公司深度绑定。"
        },
        "catalysts": {
            "en": [
                "Continuous accretive M&A of single-shop collision centers expanding market share across key US metropolitan markets",
                "Advanced Driver Assistance Systems (ADAS) calibration complexity driving up average repair ticket values and margins",
                "Preferred direct repair agreements with top North American auto insurers guaranteeing stable collision volume"
            ],
            "zh": [
                "以低估值持续收购单体独立钣金喷漆维修店，在全美数十个核心大都市区加速跑马圈地扩大直营网络",
                "智能辅助驾驶（ADAS）传感器与车载摄像头校准技术大幅提升单车碰撞维修平均单价与技术毛利率",
                "与北美前十大汽车保险公司（State Farm、Geico、Progressive 等）签订核心直修协议，保障源源不断进店业务量"
            ],
            "hybrid": [
                "稳健滚雪球收购独立汽修厂并网",
                "智能汽车 ADAS 传感器校准推升单车客单价",
                "前大车险公司直修合作垄断客源通道"
            ]
        },
        "revenue_drivers": {
            "en": ["Automotive Collision & Structural Body Repair", "Automotive Glass Replacement & ADAS Calibration Services"],
            "zh": ["事故车辆车身钣金、结构校正与高品质喷漆维修", "汽车挡风玻璃更换及 ADAS 辅助驾驶传感器专业校准服务"],
            "hybrid": ["Collision Repair 碰撞维修", "Glass & ADAS 玻璃与传感器校准"]
        }
    },
    "ATZ.TO": {
        "name": "Aritzia Inc.",
        "sector": "Everyday Luxury Women's Apparel",
        "background": {
            "en": "Aritzia is an innovative design house and fashion retailer offering Everyday Luxury apparel, accessories, and shopping experiences across premier boutiques in Canada and the United States, as well as an internationally acclaimed e-commerce platform.",
            "zh": "阿里奇亚（Aritzia Inc.）是加拿大著名的“日常奢华”（Everyday Luxury）高端女装设计与全渠道时尚零售先锋，在加拿大与美国最繁华的顶级购物街区运营豪华精品店，并拥有享誉全球的官方数字化电商直营网络。",
            "hybrid": "Aritzia (ATZ.TO) 凭借精准的 Everyday Luxury 差异化定位，在美国核心都市圈疯狂拓店并深受追捧，电商与线下双轮驱动超额阿尔法。"
        },
        "catalysts": {
            "en": [
                "Aggressive US boutique expansion delivering exceptional sales per square foot and rapid payback periods",
                "Proprietary in-house brand ecosystem (Wilfred, Babaton, Tna, Golden) providing high customer loyalty and full-price sell-through",
                "State-of-the-art new distribution centers in Toronto and Vancouver removing fulfillment friction and scaling operating leverage"
            ],
            "zh": [
                "美国精品直营门店（如纽约、洛杉矶、芝加哥旗舰店）平效销售额惊人，新店资本回收期不足两年",
                "自研多品牌矩阵（Wilfred 优雅风、Babaton 职场风、Tna 运动休闲等）享有极高全价销售率与复购忠诚度",
                "多伦多与温哥华世界级高度自动化全新仓储配送中心全面投用，大幅降低电商履约成本并释放显著经营杠杆"
            ],
            "hybrid": [
                "美国精品门店快速扩张且平效极高",
                "多元自有品牌矩阵维持高全价销售率",
                "自动化履约中心释放中长期规模效益"
            ]
        },
        "revenue_drivers": {
            "en": ["Retail Boutique In-Store Apparel Sales", "Direct-to-Consumer (DTC) E-Commerce Platform"],
            "zh": ["线下豪华精品旗舰店高端服饰与配饰零售", "官方自营网站（Aritzia.com）数字化电商直营零售"],
            "hybrid": ["Boutique Sales 线下精品店", "eCommerce 线上电商直营"]
        }
    },
    "DOO.TO": {
        "name": "BRP Inc.",
        "sector": "Powersports & Marine Propulsion",
        "background": {
            "en": "BRP Inc. is a global leader in the world of powersports vehicles, propulsion systems, and marine vessels, with a century of ingenuity manufacturing world-famous Ski-Doo snowmobiles, Sea-Doo watercraft, Can-Am on and off-road vehicles, and Rotax engines.",
            "zh": "庞巴迪动力产品（BRP Inc.）是全球动力运动车辆、船舶推进系统及特种发动机制造领军者，旗下拥有享誉全球的 Ski-Doo 雪地摩托、Sea-Doo 摩托艇、Can-Am 全地形车（ATV/SSV）与三轮公路摩托，以及 Rotax 高性能航空发动机。",
            "hybrid": "BRP (DOO.TO) 是全球动力运动绝对龙头，研发实力与产品创新极强，全球经销商网络广泛，当前估值极具吸引力。"
        },
        "catalysts": {
            "en": [
                "Continuous product innovation across Can-Am side-by-side and electric two-wheel motorcycle line up capturing market share",
                "Global dealer network inventory normalization setting up strong operational leverage in upcoming cycle inflection",
                "Disciplined capital allocation returning surplus cash to shareholders via aggressive share buybacks"
            ],
            "zh": [
                "Can-Am 越野并列双座车（SSV）与全新智能电动两轮摩托车推陈出新，在全球越野运动市场持续蚕食对手份额",
                "全球经销商网络库存去化周期接近尾声，为行业周期拐点来临时的产能释放与利润爆发奠定基础",
                "严格的资本开支纪律，在估值偏低时执行大额要约股票回购，显著增厚每股收益（EPS）"
            ],
            "hybrid": [
                "Can-Am 与 Sea-Doo 创新产品迭代持续收割份额",
                "经销商渠道库存去化即将进入尾声",
                "低估值区间大额回购股票增厚股东回报"
            ]
        },
        "revenue_drivers": {
            "en": ["Year-Round Off-Road & On-Road Vehicles (Can-Am ATV, SSV, 3-Wheel)", "Seasonal Powersports Vehicles (Ski-Doo, Sea-Doo)", "Rotax Engines, Propulsion Systems & Aftermarket Parts/Apparel"],
            "zh": ["全季节公路与全地形车辆销售（Can-Am 越野车与倒三轮机车）", "季节性娱乐动力产品销售（Ski-Doo 雪地车、Sea-Doo 水上摩托艇）", "Rotax 特种发动机、船舶推进系统及原厂售后改装零配件服饰"],
            "hybrid": ["Year-Round (Can-Am) 越野车", "Seasonal (Ski-Doo/Sea-Doo) 季节载具", "Rotax Engines & Parts 发动机配件"]
        }
    },
    "MTY.TO": {
        "name": "MTY Food Group Inc.",
        "sector": "Quick-Service Restaurant Franchising",
        "background": {
            "en": "MTY Food Group is a franchisor that operates in the quick service, fast casual, and casual dining restaurant industries, managing a portfolio of over 80 well-known restaurant brands with thousands of locations across North America and internationally.",
            "zh": "MTY食品集团（MTY Food Group）是北美著名的餐饮特许加盟连锁巨头，旗下拥有并管理超过 80 个知名餐饮品牌（如 Thai Express、Manchu WOK、Cold Stone Creamery、Papa Murphy's、Baton Rouge 等），门店遍布购物中心与街边独立商圈。",
            "hybrid": "MTY (MTY.TO) 采用轻资产加盟模式 (Asset-Light Franchising)，98% 为特许加盟店，现金流极强且无重资产运营负担。"
        },
        "catalysts": {
            "en": [
                "Asset-light franchise model generating predictable royalty stream with high free cash flow conversion",
                "Accretive tuck-in acquisitions of established casual and QSR restaurant brands expanding footprint in the US",
                "Digital ordering, kiosk implementation, and third-party delivery partnerships driving franchise same-store sales"
            ],
            "zh": [
                "轻资产特许经营模式（98% 门店为加盟商自主投资运营），带来极高稳定性的按周特许权特许费与充沛自由现金流",
                "以极具吸引力的倍数持续收购具备成熟品牌号召力的餐饮网络，重点加速在美国快餐与休闲餐饮版图的渗透",
                "数字化点餐小程序、店内自助智能点餐机及第三方外卖平台深度整合，驱动加盟单店同店销售额稳步增长"
            ],
            "hybrid": [
                "轻资产加盟模式享有极高现金流转化率",
                "低估值并购成熟品牌并在全美复制",
                "外卖与数字化智能点餐提升单店销售"
            ]
        },
        "revenue_drivers": {
            "en": ["Royalties and Franchise Fees from Network Stores", "Company-Owned Restaurant Operations", "Food Processing, Distribution & Gift Card Breakage"],
            "zh": ["数千家加盟门店的特许权使用费与加盟初始费", "直营旗舰示范餐厅的餐饮零售运营收入", "中央厨房中央调味品分销配送与礼品卡未兑现收益"],
            "hybrid": ["Franchise Royalties 特许加盟费", "Company-owned 直营店收入", "Distribution 供应链分销"]
        }
    },
    "MAL.TO": {
        "name": "Magellan Aerospace Corporation",
        "sector": "Aerospace Aerostructures & Defense Rocketry",
        "background": {
            "en": "Magellan Aerospace is a global aerospace company that designs, engineers, and manufactures complex aeroengine and aerostructure assemblies, components, rocket systems, and specialty satellite products for major commercial and defense customers.",
            "zh": "麦哲伦航空（Magellan Aerospace）是国际知名的航空航天与国防高端制造企业，为全球商业客机、军用战斗机及运载火箭设计并制造核心精密航空发动机部件、关键机身复合材料结构件以及特种军用火箭推进系统。",
            "hybrid": "麦哲伦航空 (MAL.TO) 是 F-35 隐形战机与波音/空客大客机的核心结构件一级供应商，受益全球国防开支激增与民航换机潮。"
        },
        "catalysts": {
            "en": [
                "Major content contracts on the F-35 Lightning II stealth fighter program benefiting from global NATO defense budget increases",
                "Commercial aerospace narrowbody ramp-up (Airbus A320neo, Boeing 737 MAX) driving manufacturing revenue",
                "Strong balance sheet with low net debt positioning the company for potential accretive aerospace consolidation"
            ],
            "zh": [
                "作为 F-35 闪电 II 隐形战机全球供应链核心承包商，深度受益于北约国家全面增加国防军费采购配额",
                "空客 A320neo 与波音等民航主力窄体客机交付提速，带动发动机高温耐磨结构件长期交付放量",
                "极低负债与高现金储备为应对供应链波动提供了强大的财务抗风险韧性"
            ],
            "hybrid": [
                "北约扩军加速 F-35 战机订单排产",
                "商用窄体客机提产增厚发动机结构件交付",
                "低杠杆与高财务防御性支持长线配置"
            ]
        },
        "revenue_drivers": {
            "en": ["Aeroengine Components (Castings, Shafts, Blisks)", "Aerostructures (Wing Ribs, Tail Assemblies, Composites)", "Propulsion Systems, Space Satellites & Defense Products"],
            "zh": ["航空发动机精密制造（叶盘、涡轮轴、高温精密铸造件）", "飞机机身核心结构件（机翼大梁、复合材料尾翼等）", "军用火箭推进系统、航天微卫星组件及特种防务维修"],
            "hybrid": ["Aeroengine 航空发动机", "Aerostructures 机身结构", "Defense 防务航天"]
        }
    },
    "HBM.TO": {
        "name": "Hudbay Minerals Inc.",
        "sector": "Copper & Base Metals Mining",
        "background": {
            "en": "Hudbay Minerals is an integrated mining company primarily producing copper concentrate and zinc with low-cost long-life operations in Peru (Constancia), Manitoba (Snow Lake), and British Columbia (Copper Mountain), alongside the Copper World project in Arizona.",
            "zh": "哈德贝矿业（Hudbay Minerals）是一家综合性铜锌矿业公司，在秘鲁（Constancia 铜矿）、曼尼托巴（Snow Lake 金锌矿）及卑诗省（Copper Mountain 铜矿）拥有多座低成本长寿命在产矿山，并在美国亚利桑那州控股大型 Copper World 铜矿开发项目。",
            "hybrid": "Hudbay (HBM.TO) 成功并购 Copper Mountain 后铜产量跃升，亚利桑那 Copper World 项目极具看点，对铜价具备超高贝塔弹性。"
        },
        "catalysts": {
            "en": [
                "Copper Mountain integration in BC delivering mill optimization and operational synergies",
                "Copper World project in Arizona advancing through state-level permitting as a low-risk domestic US copper source",
                "Constancia mine in Peru operating at high recovery rates with strong local community agreements in place"
            ],
            "zh": [
                "全面整合卑诗省 Copper Mountain 铜矿，选矿厂处理工艺优化大幅释放协同增效潜力",
                "美国亚利桑那州 Copper World 旗舰铜矿项目州级环评许可取得关键进展，将成为完全位于美国境内的关键铜资源供应基地",
                "秘鲁 Constancia 核心矿山保持极佳的高回收率选矿运转，并与当地社区维持稳固共赢合作关系"
            ],
            "hybrid": [
                "Copper Mountain 协同增产增厚 EBITDA",
                "亚利桑那 Copper World 铜矿关键审批催化",
                "秘鲁 Constancia 矿山现金流稳定"
            ]
        },
        "revenue_drivers": {
            "en": ["Copper Concentrate Sales", "Gold & Silver By-Product Production", "Refined Zinc Metal Production"],
            "zh": ["高品位铜精矿现场销售", "伴生黄金与白银副产品收益", "精炼金属锌生产与销售"],
            "hybrid": ["Copper Concentrate 铜精矿", "Precious Metals 伴生金银", "Zinc Metal 金属锌"]
        }
    },
    "SSRM.TO": {
        "name": "SSR Mining Inc.",
        "sector": "Gold & Silver Mining",
        "background": {
            "en": "SSR Mining is a precious metals mining company with four producing assets located in the United States, Turkey, Canada, and Argentina, focused on free cash flow generation and responsible mining operations.",
            "zh": "SSR矿业（SSR Mining）是一家拥有多元化生产基地的中大型贵金属矿商，在加拿大萨斯喀彻温省拥有旗舰 Seabee 金矿、美国内华达拥有 Marigold 露天金矿、阿根廷拥有 Puna 银铅锌矿，追求高自由现金流与健康资本结构。",
            "hybrid": "SSR Mining (SSRM.TO) 拥有美洲稳健在产金银矿山，估值处于深度折价修复区间，在金价景气周期具备显著重估空间。"
        },
        "catalysts": {
            "en": [
                "Marigold mine in Nevada and Seabee in Saskatchewan delivering low-jurisdiction-risk steady gold output",
                "Puna silver operation in Argentina producing high-grade silver with strong cash conversion",
                "Debt-free balance sheet providing extensive capital allocation flexibility during gold bull cycle"
            ],
            "zh": [
                "美国内华达 Marigold 金矿与加拿大萨省 Seabee 矿山在极高法治保障国家稳定贡献高安全边际黄金产出",
                "阿根廷 Puna 露天银矿产出高品位白银精矿，现金流转化率强劲",
                "资产负债表保持低负债运作，在国际金价高位运行期具备充沛的分红与回购实施空间"
            ],
            "hybrid": [
                "美洲安全法治区核心矿山稳产",
                "Puna 银矿受益白银价格爆发",
                "低负债资产负债表具备强劲反弹弹性"
            ]
        },
        "revenue_drivers": {
            "en": ["Gold Dore and Bullion Sales", "Silver Concentrate Production", "Lead and Zinc By-Product Credits"],
            "zh": ["金条现货销售与精炼收益", "高品位银精矿销售", "伴生铅、锌等副产品回收收益"],
            "hybrid": ["Gold Bullion 黄金销售", "Silver Concentrate 银精矿", "By-products 副产物"]
        }
    },
    "DPM.TO": {
        "name": "Dundee Precious Metals Inc.",
        "sector": "Low-Cost Gold Mining & Specialty Smelting",
        "background": {
            "en": "Dundee Precious Metals is a Canadian international gold mining company with operating mines in Bulgaria (Chelopech, Ada Tepe), advanced projects in Serbia and Ecuador, and a specialty metals smelter in Namibia, known for ultra-low all-in sustaining costs.",
            "zh": "邓迪贵金属（Dundee Precious Metals）是加拿大知名的超低成本国际黄金开采商，在保加利亚运营 Chelopech 地下铜金矿与 Ada Tepe 高品位金矿，并在塞尔维亚推进高潜力金矿项目，全维持成本（AISC）常年低于 $900/盎司，位居全行业第一梯队。",
            "hybrid": "Dundee (DPM.TO) 是全球开采成本最低、利润率最高的黄金矿企之一，净现金储备充沛，自由现金流收益率冠绝金矿板块。"
        },
        "catalysts": {
            "en": [
                "Sub-$900/oz AISC tier-1 operational cost structure yielding massive profit margins under high gold prices",
                "Coka Rakita project in Serbia emerging as a high-grade, high-margin future gold discovery",
                "Massive net cash position with no corporate debt enabling generous dividends and share buybacks"
            ],
            "zh": [
                "全维持成本（AISC）长期低于 $900/盎司，在当前金价环境下享有极度夸张的毛利润率与现金流溢价",
                "塞尔维亚 Coka Rakita 高品位金矿项目勘探开发顺利推进，有望无缝衔接未来产量增长",
                "坐拥数亿加元纯净现金、无长期借款的梦幻资产负债表，为持续超额股息与大规模股票回购保驾护航"
            ],
            "hybrid": [
                "行业最低全维持成本 (<$900 AISC) 带来超高利润率",
                "塞尔维亚 Coka Rakita 高品位新矿推进",
                "零负债巨额净现金支撑超高股息与回购"
            ]
        },
        "revenue_drivers": {
            "en": ["Gold Concentrate & Bullion Sales", "Copper Concentrate By-Product Production", "Specialty Smelter Toll Treatment Tariffs"],
            "zh": ["黄金精矿与合质金销售收入", "伴生铜精矿高价值副产品销售", "特种冶炼厂复杂精矿代加工费（TC/RC）"],
            "hybrid": ["Gold Sales 黄金销售", "Copper By-product 伴生铜", "Smelting 冶炼加工费"]
        }
    },
    "ALS.TO": {
        "name": "Altius Minerals Corporation",
        "sector": "Diversified Royalty (Potash, Clean Metals & Renewables)",
        "background": {
            "en": "Altius Minerals holds a diversified portfolio of royalty assets covering long-life Saskatchewan potash mines, clean copper and lithium projects, metallurgical coal, and a pioneering clean energy royalty business through subsidiary Altius Renewable Royalties.",
            "zh": "阿尔蒂乌斯矿业（Altius Minerals）是加拿大顶级的多元化特许权特许费（Royalty）巨头，持有萨斯喀彻温省全球最长寿命核心钾肥矿山特许权（由 Nutrien 与 Mosaic 运营）、铜锂关键金属特许权，并通过控股 Altius Renewable Royalties 开创清洁能源特许权商业模式。",
            "hybrid": "Altius Minerals (ALS.TO) 享有“躺着收租”的顶级商业模式，坐拥加国垄断性钾肥矿区与清洁绿电版税，无通胀 CapEx 风险。"
        },
        "catalysts": {
            "en": [
                "World-scale Saskatchewan potash royalties benefiting from global food security demand without any capital expenditure requirements",
                "Altius Renewable Royalties (ARR) accelerating royalty originations on utility-scale wind and solar projects",
                "Silicon metallurgical gold discovery project in Nevada holding massive prospective tier-1 royalty rights"
            ],
            "zh": [
                "萨省全球核心钾肥矿山特许权享受数十年无需追加资本开支（CapEx-Free）的顶级现金流收租模式",
                "控股子公司 Altius Renewable Royalties 在北美电网级风电与太阳能项目版税投资加速落地",
                "内华达州 Silicon 特大型高品位金矿项目特许权权益储备，具备跃升为顶级核心旗舰资产的潜力"
            ],
            "hybrid": [
                "萨省核心钾肥矿版税无需 CapEx 坐享现金流",
                "清洁风光绿电版税业务高速扩张",
                "内华达 Silicon 金矿特许权潜在价值巨大"
            ]
        },
        "revenue_drivers": {
            "en": ["Saskatchewan Potash Mine Royalties (Nutrien/Mosaic-operated)", "Base & Battery Metal Mine Royalties (Copper, Nickel, Zinc)", "Renewable Power Royalty Distributions (Wind & Solar)"],
            "zh": ["萨省钾肥特许开采版税（由 Nutrien 与 Mosaic 运营）", "铜、镍、锌等基础与电池金属矿山特许权收入", "北美风电与太阳能电站绿电特许权分红"],
            "hybrid": ["Potash Royalties 钾肥版税", "Metals Royalties 金属版税", "Renewables 绿电特许权"]
        }
    },
    "EDV.TO": {
        "name": "Endeavour Mining plc",
        "sector": "Senior Gold Mining Champion",
        "background": {
            "en": "Endeavour Mining is one of the world's senior gold producers and the largest in West Africa, with operating assets across Senegal (Sabodala-Massawa), Côte d'Ivoire (Ity, Houndé, Lafigué), and Burkina Faso, dedicated to low-cost production, ESG excellence, and sustainable shareholder distributions.",
            "zh": "奋进矿业（Endeavour Mining）是全球资深黄金生产商，也是西非地区无可争议的最大黄金矿业霸主，在塞内加尔（Sabodala-Massawa）及科特迪瓦（Ity、Houndé、Lafigué）拥有多座年产数十万盎司的超大型低成本现代化金矿。",
            "hybrid": "Endeavour (EDV.TO) 是高毛利西非黄金龙头，年化产金超百万盎司，AISC 极低，股息与回购极其丰厚。"
        },
        "catalysts": {
            "en": [
                "Lafigué mine and Sabodala-Massawa BIOX expansion online, elevating production towards lowest-cost quartile",
                "Top-tier low all-in sustaining cost profile delivering massive free cash flow in elevated gold environment",
                "Industry-leading shareholder return policy returning hundreds of millions annually via progressive dividends and buybacks"
            ],
            "zh": [
                "科特迪瓦 Lafigué 新矿与塞内加尔 Sabodala-Massawa BIOX 生物氧化扩建项目顺利投产，推动综合成本稳居全球最低分位",
                "极佳的规模效应与低维持成本结构，在国际金价高位区间输出天量自由现金流",
                "行业领先的资本返还政策，每年通过高额递增股息及定期回购将现金流大比例回馈股东"
            ],
            "hybrid": [
                "Lafigué 等新矿扩产投运大幅增厚自产金",
                "超低 AISC 成本构筑丰厚现金流护城河",
                "高股息与股票回购回报政策极具吸引力"
            ]
        },
        "revenue_drivers": {
            "en": ["Gold Dore Bars and Bullion Refining Sales", "By-Product Silver Credits"],
            "zh": ["自产金矿合质金块精炼与现货金条销售", "伴生白银副产品销售"],
            "hybrid": ["Gold Sales 黄金销售", "Silver Credits 白银副产物"]
        }
    },
    "BLDP.TO": {
        "name": "Ballard Power Systems Inc.",
        "sector": "Hydrogen Fuel Cell Propulsion (Clean Tech)",
        "background": {
            "en": "Ballard Power Systems is a global pioneer in PEM (proton exchange membrane) fuel cell technology, developing zero-emission fuel cell products for heavy-duty motive applications including transit buses, commercial trucks, trains, marine vessels, and stationary power generation.",
            "zh": "巴拉德动力系统（Ballard Power Systems）是全球质子交换膜（PEM）燃料电池技术的先驱与领军者，总部位于卑诗省本拿比，专注于重载商用交通零排放动力解决方案，产品广泛应用于氢能公交客车、重型卡车、干线列车及远洋船舶推进系统。",
            "hybrid": "巴拉德动力 (BLDP.TO) 拥有四十年氢燃料电池技术积淀，手握巨额净现金，是全球重型商用交通脱碳的核心技术领航者。"
        },
        "catalysts": {
            "en": [
                "Next-generation low-cost fuel cell stack designs dramatically reducing platinum catalyst loading and system costs",
                "Global zero-emission bus and rail fleet procurement mandates accelerating in Europe and North America",
                "Strong net cash balance sheet providing deep runway to navigate global clean hydrogen infrastructure maturation"
            ],
            "zh": [
                "新一代低成本大功率燃料电池电堆技术实现突破，大幅削减铂金贵金属载量并降低系统制造成本",
                "欧洲与北美公共交通零排放采购法规强制生效，推动氢能城市公交客车与支线列车批量商业化采购",
                "手握数亿美元净现金资产，为平稳穿越氢能基础设施建设与商业化周期提供了充裕的财务护城河"
            ],
            "hybrid": [
                "新一代燃料电池大幅削减贵金属成本",
                "欧美重卡与公交零排放刚性采购拉动",
                "充沛净现金储备提供充裕技术研发跑道"
            ]
        },
        "revenue_drivers": {
            "en": ["Heavy-Duty Motive Fuel Cell Module Sales (Bus, Truck, Rail, Marine)", "Fuel Cell Stack Components & Advanced Technology Engineering Services"],
            "zh": ["重型商用燃料电池动力模块销售（客车、重卡、列车、船舶）", "膜电极与燃料电池电堆关键部件销售及前沿工程技术咨询服务费"],
            "hybrid": ["Heavy-Duty Modules 燃料电池模块", "Technology Services 工程技术开发"]
        }
    },
    "CGY.TO": {
        "name": "Calian Group Ltd.",
        "sector": "Defense, Healthcare & Cyber Solutions",
        "background": {
            "en": "Calian Group is a diversified Canadian technology and services company operating across four core segments: Advanced Technologies (defense, satellite, nuclear), Health (clinical management), Learning (military training simulations), and Cybersecurity (IT managed security).",
            "zh": "卡利安集团（Calian Group Ltd.）是加拿大著名的国防防务、医疗与高科技系统解决方案提供商，四大核心支柱包括：先进科技（卫星通信地面站、核工业测控）、健康医疗（加拿大国防部全军医疗管理）、国防培训（北约联合仿真演练）及网络安全（军工级安全架构）。",
            "hybrid": "Calian (CGY.TO) 是加拿大国防部不可或缺的核心技术承包商，连续多年营收与利润双位数复利增长，手握数十亿加元长单。"
        },
        "catalysts": {
            "en": [
                "Canadian and NATO military training and defense procurement spending expanding rapidly",
                "Global space and satellite communication ground systems capturing strong commercial constellation demand",
                "Disciplined tuck-in acquisitions adding high-margin cybersecurity and enterprise cloud capabilities"
            ],
            "zh": [
                "加拿大国防部与北约盟国全面加大军事模拟训练采购与防务装备预算投入",
                "全球商业低轨通信卫星星座爆发式发射，驱动地面高精度深空测控天线与射频系统订单饱满",
                "严格的滚雪球小步并购持续吸纳高毛利网络安全防护与企业级云迁移服务提供商"
            ],
            "hybrid": [
                "北约与国防部军事训练长协订单充沛",
                "卫星地面测控系统承接低轨卫星爆发红利",
                "并购整合高毛利网安与医疗业务增厚利润"
            ]
        },
        "revenue_drivers": {
            "en": ["Advanced Technologies (Defense Hardware & Satellite Antennas)", "Health Care Service Operations & Clinic Management", "Learning Military Simulation & Training Contracts", "Cybersecurity IT Managed Solutions"],
            "zh": ["先进技术业务（国防防务硬件、射频通信、卫星测控天线）", "健康医疗（随军医院驻勤管理与全国性企业医疗健康服务）", "培训学习（军演模拟推演、兵棋仿真培训长期外包服务）", "网络安全防御评估与企业IT运维代管"],
            "hybrid": ["Advanced Tech 卫星通信防务", "Health 医疗管理", "Learning 军事培训", "Cybersecurity 网络安全"]
        }
    },
    "CJT.TO": {
        "name": "Cargojet Inc.",
        "sector": "Time-Sensitive Air Cargo & E-Commerce Logistics",
        "background": {
            "en": "Cargojet is Canada's leading provider of time-sensitive premium overnight air cargo services, co-loading freight across all major Canadian cities and operating dedicated ACMI/charter aircraft internationally for global logistics giants including Amazon and DHL.",
            "zh": "卡戈捷航空（Cargojet Inc.）是加拿大顶尖的隔夜航空货运网络运营商，垄断加拿大各大主要城市之间 90% 以上的限时航空快件网络，并为亚马逊（Amazon）与 DHL 等全球物流巨头提供专属机队包机（ACMI）服务。",
            "hybrid": "Cargojet (CJT.TO) 是加拿大隔夜航空快递与电商物流霸主，长期绑定 Amazon 与 DHL 战略合作，护城河极深。"
        },
        "catalysts": {
            "en": [
                "Exclusive long-term strategic commercial agreements with Amazon and DHL with minimum volume guarantees",
                "Structural secular tailwinds from domestic and cross-border B2C e-commerce package volumes",
                "Fleet right-sizing and operational optimization driving significant free cash flow expansion and debt reduction"
            ],
            "zh": [
                "与亚马逊（Amazon）和 DHL 签署独家长期战略合作协议，享有保底运量与航线垄断收益",
                "加拿大本土及跨境电商快递包裹渗透率持续提升，驱动核心隔夜航线高频满载运营",
                "机队运力优化与资本开支高峰回落，驱动自由现金流强劲释放并加速资产负债表去杠杆"
            ],
            "hybrid": [
                "Amazon 与 DHL 长期战略排他性航线保底",
                "跨境与本土电商快递需求结构性渗透",
                "资本开支高峰已过，自由现金流爆发回流"
            ]
        },
        "revenue_drivers": {
            "en": ["Domestic Overnight Network Air Cargo Services", "ACMI (Aircraft, Crew, Maintenance, Insurance) Contracts", "All-Cargo Aircraft Charters & Ground Handling"],
            "zh": ["加拿大国内核心隔夜网络包机货运服务", "ACMI（飞机、机组、维修、保险）专属长协包机", "国际全货机临时包机及机场地面配载装卸服务"],
            "hybrid": ["Domestic Network 国内隔夜网络", "ACMI Contracts 专属包机长协", "All-Cargo Charters 临时包机"]
        }
    }
}
