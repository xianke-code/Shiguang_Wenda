import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = 'quiz_secret_key_2025'
const users = []
let duelRooms = {}
let submissions = []
let idCounter = 121

const questions = [
  { id: 1, question: '地球上现存最大的哺乳动物是什么？', options: ['非洲象', '蓝鲸', '长颈鹿', '河马'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '蓝鲸是地球上最大的动物，体长可达30米以上。' },
  { id: 2, question: '"但愿人长久，千里共婵娟"出自哪位词人之手？', options: ['李白', '辛弃疾', '苏轼', '杜甫'], answer: 2, category: '文学', difficulty: 1, type: 'choice', explanation: '出自苏轼《水调歌头·明月几时有》。' },
  { id: 3, question: '光在真空中的速度大约是多少？', options: ['每秒3万公里', '每秒30万公里', '每秒300万公里', '每秒3000公里'], answer: 1, category: '物理', difficulty: 1, type: 'choice', explanation: '光速约为30万千米/秒。' },
  { id: 4, question: '世界上最长的河流是哪一条？', options: ['亚马逊河', '长江', '密西西比河', '尼罗河'], answer: 3, category: '地理', difficulty: 1, type: 'choice', explanation: '尼罗河全长6670公里。' },
  { id: 5, question: '铁的化学符号是什么？', options: ['Fe', 'Fi', 'Fr', 'Fm'], answer: 0, category: '化学', difficulty: 1, type: 'choice', explanation: '铁的元素符号Fe来自拉丁文ferrum。' },
  { id: 6, question: '以下哪项不属于中国"四大发明"？', options: ['造纸术', '地动仪', '火药', '印刷术'], answer: 1, category: '历史', difficulty: 2, type: 'choice', explanation: '四大发明是造纸术、指南针、火药和印刷术，地动仪不在其中。' },
  { id: 7, question: '人体表面积最大的器官是？', options: ['肝脏', '大脑', '皮肤', '小肠'], answer: 2, category: '生物', difficulty: 1, type: 'choice', explanation: '成人皮肤总面积约1.5-2平方米。' },
  { id: 8, question: '《蒙娜丽莎》的作者是谁？', options: ['米开朗基罗', '拉斐尔', '达·芬奇', '梵高'], answer: 2, category: '艺术', difficulty: 1, type: 'choice', explanation: '达·芬奇在文艺复兴时期创作。' },
  { id: 9, question: '地球在一年中离太阳最近的时候是几月？', options: ['7月', '1月', '4月', '10月'], answer: 1, category: '天文', difficulty: 2, type: 'choice', explanation: '地球于1月初到达近日点。' },
  { id: 10, question: '咖啡的原产地是哪个国家？', options: ['巴西', '哥伦比亚', '埃塞俄比亚', '越南'], answer: 2, category: '生活', difficulty: 1, type: 'choice', explanation: '咖啡起源于埃塞俄比亚的咖法地区。' },
  { id: 11, question: '企鹅主要生活在哪个极地地区？', options: ['北极', '南极', '两者都有', '赤道附近'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '企鹅主要分布在南极及周边岛屿。' },
  { id: 12, question: '声音能在真空中传播吗？', options: ['能', '不能'], answer: 1, category: '物理', difficulty: 1, type: 'boolean', explanation: '声音需要介质，真空中不能传播。' },
  { id: 13, question: '人体正常体温大约是多少？', options: ['35℃', '36.5℃', '37.5℃', '38℃'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '正常腋窝温度约36.5℃。' },
  { id: 14, question: '圆周率π的前两位小数是？', options: ['3.12', '3.14', '3.16', '3.18'], answer: 1, category: '数学', difficulty: 1, type: 'choice', explanation: 'π约等于3.14。' },
  { id: 15, question: '英语中apple的复数形式是？', options: ['apples', 'apple', 'applis', 'appleses'], answer: 0, category: '语言', difficulty: 1, type: 'choice', explanation: '直接加s。' },
  { id: 16, question: '金的化学符号是什么？', options: ['Ag', 'Au', 'Pt', 'Cu'], answer: 1, category: '化学', difficulty: 1, type: 'choice', explanation: 'Au来自拉丁语aurum。' },
  { id: 17, question: '中国最大的岛屿是？', options: ['海南岛', '台湾岛', '崇明岛', '舟山岛'], answer: 1, category: '地理', difficulty: 1, type: 'choice', explanation: '台湾岛面积约3.6万平方公里。' },
  { id: 18, question: '蚊子靠什么找到人？', options: ['声音', '体温和气味', '光线', '颜色'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '蚊子感知CO₂和体温来定位。' },
  { id: 19, question: '《哈利·波特》的作者是？', options: ['托尔金', '罗琳', '刘易斯', '达尔'], answer: 1, category: '文学', difficulty: 1, type: 'choice', explanation: 'J.K.罗琳创作。' },
  { id: 20, question: '奥运会五环中黄色代表哪个洲？', options: ['亚洲', '非洲', '美洲', '欧洲'], answer: 0, category: '体育', difficulty: 1, type: 'choice', explanation: '黄环代表亚洲。' },
  { id: 21, question: '水的化学式是什么？', options: ['H₂O', 'CO₂', 'NaCl', 'O₂'], answer: 0, category: '化学', difficulty: 1, type: 'choice', explanation: '水分子由两个氢原子和一个氧原子组成。' },
  { id: 22, question: '中国最长的河流是？', options: ['黄河', '长江', '珠江', '淮河'], answer: 1, category: '地理', difficulty: 1, type: 'choice', explanation: '长江全长6300多公里。' },
  { id: 23, question: '太阳系中距离太阳最近的行星是？', options: ['金星', '地球', '水星', '火星'], answer: 2, category: '天文', difficulty: 1, type: 'choice', explanation: '水星离太阳最近。' },
  { id: 24, question: '《红楼梦》的作者是？', options: ['吴承恩', '曹雪芹', '施耐庵', '罗贯中'], answer: 1, category: '文学', difficulty: 1, type: 'choice', explanation: '曹雪芹著《红楼梦》。' },
  { id: 25, question: '人体最大的内脏器官是？', options: ['心脏', '肝脏', '肺', '胃'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '肝脏是最大的内脏器官。' },
  { id: 26, question: '空气中含量最多的气体是？', options: ['氧气', '氮气', '二氧化碳', '氢气'], answer: 1, category: '化学', difficulty: 1, type: 'choice', explanation: '氮气约占78%。' },
  { id: 27, question: '二战全面爆发的标志是？', options: ['珍珠港事件', '德国入侵波兰', '诺曼底登陆', '斯大林格勒战役'], answer: 1, category: '历史', difficulty: 2, type: 'choice', explanation: '1939年德国入侵波兰。' },
  { id: 28, question: '计算机的"大脑"是？', options: ['内存', '硬盘', 'CPU', '显卡'], answer: 2, category: '科技', difficulty: 1, type: 'choice', explanation: 'CPU是计算机的核心。' },
  { id: 29, question: '世界上最大的海洋是？', options: ['大西洋', '印度洋', '太平洋', '北冰洋'], answer: 2, category: '地理', difficulty: 1, type: 'choice', explanation: '太平洋面积最大。' },
  { id: 30, question: '中国第一部纪传体通史是？', options: ['《汉书》', '《史记》', '《资治通鉴》', '《三国志》'], answer: 1, category: '文学', difficulty: 1, type: 'choice', explanation: '司马迁所著《史记》。' },
  { id: 31, question: '蝙蝠是哪类动物？', options: ['鸟类', '哺乳动物', '爬行动物', '两栖动物'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '蝙蝠是能飞翔的哺乳动物。' },
  { id: 32, question: '"蓝牙"名称来源于？', options: ['矿石', '维京国王', '动物', '科幻小说'], answer: 1, category: '科技', difficulty: 2, type: 'choice', explanation: '以哈拉尔蓝牙王命名。' },
  { id: 33, question: '孙悟空的武器叫什么？', options: ['如意金箍棒', '方天画戟', '丈八蛇矛', '降妖宝杖'], answer: 0, category: '文学', difficulty: 1, type: 'choice', explanation: '重一万三千五百斤。' },
  { id: 34, question: '一年中哪个月份天数最少？', options: ['1月', '2月', '3月', '12月'], answer: 1, category: '生活', difficulty: 1, type: 'choice', explanation: '2月平年28天。' },
  { id: 35, question: '相对论的创立者是？', options: ['牛顿', '爱因斯坦', '伽利略', '霍金'], answer: 1, category: '物理', difficulty: 1, type: 'choice', explanation: '阿尔伯特·爱因斯坦。' },
  { id: 36, question: '蜜蜂采蜜主要用来？', options: ['玩耍', '筑巢', '喂养幼虫和储备', '送礼'], answer: 2, category: '生物', difficulty: 1, type: 'choice', explanation: '蜂蜜是食物储备。' },
  { id: 37, question: '世界音乐之都是？', options: ['巴黎', '维也纳', '伦敦', '罗马'], answer: 1, category: '艺术', difficulty: 1, type: 'choice', explanation: '维也纳。' },
  { id: 38, question: '翻车鱼的学名是？', options: ['海豚', '鲸鲨', '翻车鱼', '海豹'], answer: 2, category: '生物', difficulty: 1, type: 'choice', explanation: 'Mola mola。' },
  { id: 39, question: '玉米原产于哪个大洲？', options: ['亚洲', '非洲', '南美洲', '欧洲'], answer: 2, category: '生活', difficulty: 1, type: 'choice', explanation: '原产南美洲。' },
  { id: 40, question: '"Hello World"常用于？', options: ['告别', '编程入门', '问候', '测试网络'], answer: 1, category: '科技', difficulty: 1, type: 'choice', explanation: '编程初学第一行代码。' },
  { id: 41, question: '酸雨的主要成因是？', options: ['CO₂', 'SO₂', 'O₂', 'N₂'], answer: 1, category: '化学', difficulty: 2, type: 'choice', explanation: '二氧化硫和氮氧化物。' },
  { id: 42, question: '人体含量最多的物质是？', options: ['蛋白质', '脂肪', '水', '矿物质'], answer: 2, category: '生物', difficulty: 1, type: 'choice', explanation: '水占体重约60%。' },
  { id: 43, question: '最早使用纸币的国家是？', options: ['古希腊', '中国', '意大利', '印度'], answer: 1, category: '历史', difficulty: 1, type: 'choice', explanation: '宋代出现交子。' },
  { id: 44, question: 'DVD容量约多少？', options: ['700MB', '4.7GB', '8.5GB', '25GB'], answer: 1, category: '科技', difficulty: 1, type: 'choice', explanation: '单面4.7GB。' },
  { id: 45, question: '手机信号属于哪种电磁波？', options: ['红外线', '紫外线', '无线电波', '可见光'], answer: 2, category: '物理', difficulty: 1, type: 'choice', explanation: '无线电波。' },
  { id: 46, question: '抗战胜利纪念日是？', options: ['8.15', '9.3', '9.18', '7.7'], answer: 1, category: '历史', difficulty: 1, type: 'choice', explanation: '9月3日。' },
  { id: 47, question: '猫属于哪一类动物？', options: ['犬科', '猫科', '熊科', '鼬科'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '猫科动物。' },
  { id: 48, question: '世界上最小的国家是？', options: ['摩纳哥', '圣马力诺', '梵蒂冈', '列支敦士登'], answer: 2, category: '地理', difficulty: 1, type: 'choice', explanation: '梵蒂冈0.44平方公里。' },
  { id: 49, question: '太阳系最大的行星是？', options: ['地球', '木星', '土星', '天王星'], answer: 1, category: '天文', difficulty: 1, type: 'choice', explanation: '木星体积最大。' },
  { id: 50, question: '中国象棋每方几个棋子？', options: ['14', '15', '16', '17'], answer: 2, category: '体育', difficulty: 1, type: 'choice', explanation: '每方16个。' },
  { id: 51, question: '正常血压收缩压范围？', options: ['60-90', '90-120', '120-140', '140-160'], answer: 1, category: '生物', difficulty: 2, type: 'choice', explanation: '正常90-120mmHg。' },
  { id: 52, question: '最大的珊瑚礁群是？', options: ['大堡礁', '中美洲礁', '红海礁', '马尔代夫礁'], answer: 0, category: '地理', difficulty: 1, type: 'choice', explanation: '澳大利亚大堡礁。' },
  { id: 53, question: '"空城计"主角是？', options: ['曹操', '诸葛亮', '司马懿', '周瑜'], answer: 1, category: '文学', difficulty: 1, type: 'choice', explanation: '诸葛亮计退司马懿。' },
  { id: 54, question: '氧气占空气约？', options: ['78%', '21%', '1%', '0.03%'], answer: 1, category: '化学', difficulty: 1, type: 'choice', explanation: '约21%。' },
  { id: 55, question: '进化论的提出者是？', options: ['牛顿', '达尔文', '巴斯德', '孟德尔'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '查尔斯·达尔文。' },
  { id: 56, question: '最深的海沟是？', options: ['日本海沟', '马里亚纳海沟', '汤加海沟', '秘鲁海沟'], answer: 1, category: '地理', difficulty: 1, type: 'choice', explanation: '约11034米。' },
  { id: 57, question: '足球每队上场几人？', options: ['9', '10', '11', '12'], answer: 2, category: '体育', difficulty: 1, type: 'choice', explanation: '11人。' },
  { id: 58, question: '维C主要存在于？', options: ['肉类', '蔬果', '谷物', '奶制品'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '新鲜蔬果。' },
  { id: 59, question: '中国最大淡水湖是？', options: ['洞庭湖', '鄱阳湖', '太湖', '青海湖'], answer: 1, category: '地理', difficulty: 1, type: 'choice', explanation: '鄱阳湖。' },
  { id: 60, question: '电话的发明者是？', options: ['爱迪生', '贝尔', '特斯拉', '马可尼'], answer: 1, category: '科技', difficulty: 1, type: 'choice', explanation: '亚历山大·贝尔。' },
  { id: 61, question: '《孙子兵法》作者是？', options: ['孙膑', '孙武', '孙权', '孙思邈'], answer: 1, category: '历史', difficulty: 1, type: 'choice', explanation: '孙武。' },
  { id: 62, question: '地球自转一周约？', options: ['12h', '24h', '48h', '一周'], answer: 1, category: '天文', difficulty: 1, type: 'choice', explanation: '约24小时。' },
  { id: 63, question: '使用人数最多的语言是？', options: ['英语', '汉语', '西班牙语', '印地语'], answer: 1, category: '语言', difficulty: 1, type: 'choice', explanation: '汉语母语者最多。' },
  { id: 64, question: '计算机采用几进制？', options: ['二进制', '八进制', '十进制', '十六进制'], answer: 0, category: '科技', difficulty: 1, type: 'choice', explanation: '二进制。' },
  { id: 65, question: '成人体有多少块脊椎骨？', options: ['24', '26', '30', '33'], answer: 1, category: '生物', difficulty: 2, type: 'choice', explanation: '通常26块。' },
  { id: 66, question: '丝绸之路起点是？', options: ['北京', '西安', '洛阳', '杭州'], answer: 1, category: '历史', difficulty: 1, type: 'choice', explanation: '长安（今西安）。' },
  { id: 67, question: '煤气中毒指什么气体？', options: ['CO', 'CO₂', 'CH₄', 'N₂'], answer: 0, category: '化学', difficulty: 1, type: 'choice', explanation: '一氧化碳。' },
  { id: 68, question: '世界最大平原是？', options: ['华北', '亚马孙', '西西伯利亚', '东欧'], answer: 1, category: '地理', difficulty: 1, type: 'choice', explanation: '亚马孙平原。' },
  { id: 69, question: '五四运动在哪年？', options: ['1917', '1919', '1921', '1925'], answer: 1, category: '历史', difficulty: 1, type: 'choice', explanation: '1919年。' },
  { id: 70, question: '南极和北极哪个更冷？', options: ['南极', '北极', '一样', '分季节'], answer: 0, category: '地理', difficulty: 1, type: 'choice', explanation: '南极更冷。' },
  { id: 71, question: '"床前明月光"作者是？', options: ['杜甫', '白居易', '李白', '王维'], answer: 2, category: '文学', difficulty: 1, type: 'choice', explanation: '李白《静夜思》。' },
  { id: 72, question: '光年是什么单位？', options: ['时间', '距离', '速度', '亮度'], answer: 1, category: '天文', difficulty: 1, type: 'choice', explanation: '距离单位。' },
  { id: 73, question: '血红蛋白含什么金属？', options: ['钙', '铁', '锌', '镁'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '含铁。' },
  { id: 74, question: '互联网起源于哪国？', options: ['英国', '美国', '苏联', '法国'], answer: 1, category: '科技', difficulty: 1, type: 'choice', explanation: '美国ARPANET。' },
  { id: 75, question: 'C大调有几个升号？', options: ['0', '1', '2', '3'], answer: 0, category: '艺术', difficulty: 2, type: 'choice', explanation: '没有升降号。' },
  { id: 76, question: '马拉松距离约？', options: ['21km', '42km', '50km', '100km'], answer: 1, category: '体育', difficulty: 1, type: 'choice', explanation: '42.195公里。' },
  { id: 77, question: '四大高原不包括？', options: ['青藏', '内蒙古', '云贵', '东北'], answer: 3, category: '地理', difficulty: 2, type: 'choice', explanation: '黄土高原而非东北。' },
  { id: 78, question: 'GPS全称是？', options: ['全球定位', '地理信息', '通用处理', '全球通信'], answer: 0, category: '科技', difficulty: 1, type: 'choice', explanation: 'Global Positioning System。' },
  { id: 79, question: '植物靠什么释放氧气？', options: ['呼吸', '光合', '蒸腾', '消化'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '光合作用。' },
  { id: 80, question: '秦统一六国是哪年？', options: ['前221', '前206', '前202', '220'], answer: 0, category: '历史', difficulty: 1, type: 'choice', explanation: '公元前221年。' },
  { id: 81, question: '彩虹颜色从外到内是？', options: ['红橙黄绿青蓝紫', '紫蓝青绿黄橙红', '红黄蓝绿紫', '赤橙黄绿蓝靛紫'], answer: 0, category: '物理', difficulty: 1, type: 'choice', explanation: '红到紫。' },
  { id: 82, question: '人体最小的骨头在？', options: ['手指', '耳朵', '鼻子', '脚趾'], answer: 1, category: '生物', difficulty: 2, type: 'choice', explanation: '中耳镫骨约3mm。' },
  { id: 83, question: '温室效应主因气体是？', options: ['O₂', 'N₂', 'CO₂', 'H₂'], answer: 2, category: '化学', difficulty: 1, type: 'choice', explanation: '二氧化碳。' },
  { id: 84, question: '我国最长内陆河是？', options: ['长江', '黄河', '塔里木河', '雅鲁藏布江'], answer: 2, category: '地理', difficulty: 2, type: 'choice', explanation: '塔里木河2179km。' },
  { id: 85, question: '1GB等于多少MB？', options: ['100', '512', '1024', '1000'], answer: 2, category: '科技', difficulty: 1, type: 'choice', explanation: '1024MB。' },
  { id: 86, question: '文艺复兴源于哪国？', options: ['法国', '英国', '意大利', '德国'], answer: 2, category: '艺术', difficulty: 1, type: 'choice', explanation: '14世纪意大利。' },
  { id: 87, question: '企鹅是鸟类吗？', options: ['是', '否'], answer: 0, category: '生物', difficulty: 1, type: 'boolean', explanation: '属于鸟纲。' },
  { id: 88, question: '烟花主要成分是？', options: ['火药', '煤炭', '塑料', '金属'], answer: 0, category: '化学', difficulty: 1, type: 'choice', explanation: '黑火药和金属盐。' },
  { id: 89, question: '自由女神像是哪国送的？', options: ['英国', '法国', '西班牙', '荷兰'], answer: 1, category: '历史', difficulty: 1, type: 'choice', explanation: '法国赠送。' },
  { id: 90, question: '人类有多少对染色体？', options: ['22', '23', '24', '46'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '23对。' },
  { id: 91, question: '"及时雨"指《水浒》中谁？', options: ['林冲', '宋江', '卢俊义', '吴用'], answer: 1, category: '文学', difficulty: 1, type: 'choice', explanation: '宋江。' },
  { id: 92, question: '月球绕地球周期约？', options: ['1天', '1月', '1年', '24h'], answer: 1, category: '天文', difficulty: 1, type: 'choice', explanation: '约27.3天。' },
  { id: 93, question: 'WiFi使用什么技术？', options: ['蓝牙', '红外', '无线局域网', '移动数据'], answer: 2, category: '科技', difficulty: 1, type: 'choice', explanation: 'IEEE 802.11。' },
  { id: 94, question: '人体最大的肌肉是？', options: ['肱二头肌', '臀大肌', '股四头肌', '背阔肌'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '臀大肌。' },
  { id: 95, question: '阿拉伯数字由谁发明？', options: ['阿拉伯人', '印度人', '埃及人', '希腊人'], answer: 1, category: '数学', difficulty: 1, type: 'choice', explanation: '印度人发明。' },
  { id: 96, question: '地壳含量最多的元素是？', options: ['铁', '硅', '氧', '铝'], answer: 2, category: '化学', difficulty: 1, type: 'choice', explanation: '氧约46.6%。' },
  { id: 97, question: 'PAN指个人区域网络。', options: ['正确', '错误'], answer: 0, category: '科技', difficulty: 1, type: 'boolean', explanation: 'Personal Area Network。' },
  { id: 98, question: '五星红旗设计者是？', options: ['毛泽东', '周恩来', '曾联松', '刘少奇'], answer: 2, category: '历史', difficulty: 2, type: 'choice', explanation: '曾联松。' },
  { id: 99, question: '1光年约多少万亿公里？', options: ['9.46', '8.6', '10', '5'], answer: 0, category: '天文', difficulty: 1, type: 'choice', explanation: '约9.46万亿km。' },
  { id: 100, question: 'USB指通用串行总线。', options: ['正确', '错误'], answer: 0, category: '科技', difficulty: 1, type: 'boolean', explanation: 'Universal Serial Bus。' },
  { id: 101, question: '1英里约等于多少公里？', options: ['1.6', '2.0', '1.2', '1.8'], answer: 0, category: '数学', difficulty: 1, type: 'choice', explanation: '1英里≈1.609公里。' },
  { id: 102, question: '沸点是100℃的物质是？', options: ['酒精', '水', '油', '醋'], answer: 1, category: '化学', difficulty: 1, type: 'choice', explanation: '水在标准大气压下100℃沸腾。' },
  { id: 103, question: '《清明上河图》作者是？', options: ['张择端', '吴道子', '唐伯虎', '郑板桥'], answer: 0, category: '艺术', difficulty: 1, type: 'choice', explanation: '北宋张择端。' },
  { id: 104, question: '糖尿病与哪种激素有关？', options: ['甲状腺素', '胰岛素', '肾上腺素', '生长激素'], answer: 1, category: '生物', difficulty: 2, type: 'choice', explanation: '胰岛素分泌不足。' },
  { id: 105, question: '第一宇宙速度约？', options: ['7.9km/s', '11.2km/s', '16.7km/s', '3.0km/s'], answer: 0, category: '物理', difficulty: 2, type: 'choice', explanation: '约7.9千米/秒。' },
  { id: 106, question: 'NBA球队每场上场几人？', options: ['4', '5', '6', '7'], answer: 1, category: '体育', difficulty: 1, type: 'choice', explanation: '每队5人。' },
  { id: 107, question: '色盲中最常见的是？', options: ['红绿色盲', '蓝黄色盲', '全色盲', '黄绿色盲'], answer: 0, category: '生物', difficulty: 1, type: 'choice', explanation: '红绿色盲最常见。' },
  { id: 108, question: '闪电和雷声同时产生，为什么先见闪电？', options: ['光速更快', '眼睛比耳朵灵敏', '闪电更近', '耳朵反应慢'], answer: 0, category: '物理', difficulty: 1, type: 'choice', explanation: '光速远大于声速。' },
  { id: 109, question: '古埃及金字塔主要功能是？', options: ['宫殿', '陵墓', '神庙', '仓库'], answer: 1, category: '历史', difficulty: 1, type: 'choice', explanation: '法老陵墓。' },
  { id: 110, question: 'Python是什么类型的语言？', options: ['编译型', '解释型', '标记型', '机器语言'], answer: 1, category: '科技', difficulty: 1, type: 'choice', explanation: '解释型高级语言。' },
  { id: 111, question: '中国有多少个省级行政区？', options: ['30', '32', '34', '36'], answer: 2, category: '地理', difficulty: 1, type: 'choice', explanation: '34个（含港澳台）。' },
  { id: 112, question: '飞机起飞时为什么要逆风？', options: ['省油', '增加升力', '减少噪音', '习惯'], answer: 1, category: '物理', difficulty: 2, type: 'choice', explanation: '逆风增加相对气流速度，提升升力。' },
  { id: 113, question: '泰国首都是？', options: ['曼谷', '清迈', '普吉', '芭提雅'], answer: 0, category: '地理', difficulty: 1, type: 'choice', explanation: '曼谷。' },
  { id: 114, question: '人的血液是什么颜色？', options: ['蓝色', '红色', '无色', '绿色'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '含血红蛋白呈红色。' },
  { id: 115, question: 'pH值7表示？', options: ['酸性', '碱性', '中性', '强酸'], answer: 2, category: '化学', difficulty: 1, type: 'choice', explanation: 'pH=7为中性。' },
  { id: 116, question: '最大的陆生动物是？', options: ['犀牛', '非洲象', '河马', '长颈鹿'], answer: 1, category: '生物', difficulty: 1, type: 'choice', explanation: '非洲象。' },
  { id: 117, question: '一打等于多少个？', options: ['10', '11', '12', '13'], answer: 2, category: '生活', difficulty: 1, type: 'choice', explanation: '12个。' },
  { id: 118, question: '太阳主要成分是？', options: ['氧和氮', '氢和氦', '碳和氧', '铁和镍'], answer: 1, category: '天文', difficulty: 1, type: 'choice', explanation: '约75%氢，25%氦。' },
  { id: 119, question: '键盘上Ctrl+C的作用是？', options: ['粘贴', '复制', '剪切', '保存'], answer: 1, category: '科技', difficulty: 1, type: 'choice', explanation: '复制。' },
  { id: 120, question: '世界上最大的岛屿是？', options: ['台湾岛', '马达加斯加', '格陵兰岛', '新几内亚岛'], answer: 2, category: '地理', difficulty: 1, type: 'choice', explanation: '格陵兰岛约216万km²。' }
]

const achievementsList = [
  { key: 'first_quiz', name: '初次答题', desc: '完成一次答题', icon: '📝' },
  { key: 'perfect', name: '满分', desc: '获得一次满分', icon: '💯' },
  { key: 'ten_quizzes', name: '答题10次', desc: '累计完成10次答题', icon: '🔟' },
  { key: 'streak_7', name: '连续7天', desc: '连续签到7天', icon: '🔥' },
  { key: 'collector', name: '收藏家', desc: '收藏10道题', icon: '⭐' }
]

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: '未登录' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch(e) { res.status(401).json({ error: '登录过期' }) }
}

function findUser(id) {
  return users.find(u => u.id === id)
}

function initRank(user) {
  if (!user) return
  if (user.rankScore === undefined) user.rankScore = 1000
  if (user.rankLevel === undefined) user.rankLevel = '青铜III'
}

function getRank(score) {
  if (score < 1100) return '青铜III'
  if (score < 1200) return '青铜II'
  if (score < 1300) return '青铜I'
  if (score < 1400) return '白银III'
  if (score < 1500) return '白银II'
  if (score < 1600) return '白银I'
  if (score < 1700) return '黄金III'
  if (score < 1800) return '黄金II'
  if (score < 1900) return '黄金I'
  if (score < 1950) return '钻石IV'
  if (score < 2000) return '钻石III'
  if (score < 2050) return '钻石II'
  if (score < 2100) return '钻石I'
  if (score < 2200) return '精英星钻'
  if (score < 2300) return '大师星钻'
  if (score < 2400) return '顶级星钻'
  return '无双星钻'
}

function calcElo(oldRating, oppRating, score, total) {
  const expected = 1 / (1 + Math.pow(10, (oppRating - oldRating) / 400))
  const actual = score / total
  return Math.round(oldRating + 32 * (actual - expected))
}

function simAI(q, skill) {
  skill = skill || 0.7
  const correct = Math.random() < skill
  const time = Math.floor(Math.random() * 5000) + 2000
  if (correct) return { answer: q.answer, time }
  const wrongs = q.options.map((_, i) => i).filter(i => i !== q.answer)
  return { answer: wrongs[Math.floor(Math.random() * wrongs.length)], time }
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: '请输入用户名和密码' })
  if (users.find(u => u.username === username)) return res.status(400).json({ error: '用户名已存在' })
  const newUser = {
    id: users.length + 1, username, password: bcrypt.hashSync(password, 10),
    points: 0, streak: 0, lastSignDate: null, quizzesCompleted: 0,
    favorites: [], wrongList: [], achievements: [], rankScore: 1000, rankLevel: '青铜III'
  }
  users.push(newUser)
  res.json({ message: '注册成功' })
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username)
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: '用户名或密码错误' })
  initRank(user)
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, username: user.username, points: user.points, rankScore: user.rankScore, rankLevel: getRank(user.rankScore) } })
})

app.get('/api/user/profile', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  initRank(user)
  res.json({ id: user.id, username: user.username, points: user.points, streak: user.streak, quizzesCompleted: user.quizzesCompleted, favorites: user.favorites, wrongList: user.wrongList, achievements: user.achievements, rankScore: user.rankScore, rankLevel: getRank(user.rankScore) })
})

app.post('/api/sign', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  const today = new Date().toISOString().slice(0, 10)
  if (user.lastSignDate === today) return res.status(400).json({ error: '今日已签到' })
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  user.streak = (user.lastSignDate === yesterday) ? user.streak + 1 : 1
  user.lastSignDate = today
  const bonus = user.streak >= 7 ? 15 : 5
  user.points += bonus
  if (user.streak === 7 && !user.achievements.includes('streak_7')) user.achievements.push('streak_7')
  res.json({ streak: user.streak, points: user.points, bonus })
})

app.get('/api/questions', (req, res) => {
  let { category, difficulty, search, count } = req.query
  let filtered = [...questions]
  if (category) filtered = filtered.filter(q => q.category === category)
  if (difficulty) filtered = filtered.filter(q => q.difficulty == difficulty)
  if (search) filtered = filtered.filter(q => q.question.includes(search))
  if (count) {
    const cnt = parseInt(count)
    filtered.sort(() => Math.random() - 0.5)
    filtered = filtered.slice(0, Math.min(cnt, filtered.length))
  }
  const result = filtered.map(({ id, question, options, category, difficulty, type, answer }) => ({ id, question, options, category, difficulty, type, answer }))
  res.json(result)
})

app.post('/api/check-batch', authMiddleware, (req, res) => {
  const { answers } = req.body
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  const results = answers.map(a => {
    const q = questions.find(q => q.id === a.id)
    if (!q) return { id: a.id, correct: false }
    const correct = q.answer === a.answer
    return { id: a.id, correct, correctAnswer: q.answer, userAnswer: a.answer, question: q.question, options: q.options, category: q.category, explanation: q.explanation }
  })
  const score = results.filter(r => r.correct).length
  user.quizzesCompleted++
  user.points += score * 2
  if (score === results.length && !user.achievements.includes('perfect')) user.achievements.push('perfect')
  if (user.quizzesCompleted === 1 && !user.achievements.includes('first_quiz')) user.achievements.push('first_quiz')
  if (user.quizzesCompleted === 10 && !user.achievements.includes('ten_quizzes')) user.achievements.push('ten_quizzes')
  results.forEach(r => {
    if (!r.correct && !user.wrongList.find(w => w.id === r.id)) {
      user.wrongList.push({ id: r.id, question: r.question, correctAnswer: r.options[r.correctAnswer] })
    }
  })
  res.json({ results, score, total: results.length, pointsEarned: score * 2 })
})

app.post('/api/favorite/:id', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  const qid = parseInt(req.params.id)
  if (!user.favorites.includes(qid)) {
    user.favorites.push(qid)
    if (user.favorites.length >= 10 && !user.achievements.includes('collector')) user.achievements.push('collector')
  }
  res.json({ favorites: user.favorites })
})

app.delete('/api/favorite/:id', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  user.favorites = user.favorites.filter(f => f !== parseInt(req.params.id))
  res.json({ favorites: user.favorites })
})

app.get('/api/favorites', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  const favs = questions.filter(q => user.favorites.includes(q.id))
  res.json(favs)
})

app.get('/api/wrong-list', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  res.json(user.wrongList)
})

app.post('/api/submit-question', authMiddleware, (req, res) => {
  const { question, options, answer, category, difficulty, type, explanation } = req.body
  submissions.push({ id: submissions.length + 1, question, options, answer: parseInt(answer), category, difficulty: parseInt(difficulty) || 1, type: type || 'choice', explanation, submitter: req.user.id, status: 'pending' })
  res.json({ message: '提交成功' })
})

app.get('/api/leaderboard', (req, res) => {
  const sorted = [...users].sort((a, b) => b.points - a.points).slice(0, 20).map(u => ({ username: u.username, points: u.points, quizzesCompleted: u.quizzesCompleted }))
  res.json(sorted)
})

app.get('/api/categories', (req, res) => res.json([...new Set(questions.map(q => q.category))]))

app.get('/api/achievements', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  res.json(achievementsList.map(a => ({ ...a, unlocked: user.achievements.includes(a.key) })))
})

app.get('/api/rank/info', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  initRank(user)
  res.json({ rankScore: user.rankScore, rankLevel: getRank(user.rankScore) })
})

app.get('/api/rank/leaderboard', (req, res) => {
  const sorted = users.slice().sort((a, b) => (b.rankScore || 1000) - (a.rankScore || 1000)).slice(0, 20).map(u => ({ username: u.username, rankScore: u.rankScore || 1000, rankLevel: getRank(u.rankScore || 1000) }))
  res.json(sorted)
})

app.post('/api/duel/start', authMiddleware, (req, res) => {
  const user = findUser(req.user.id)
  if (!user) return res.status(404).json({ error: '不存在' })
  initRank(user)
  const roomId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const duelQs = questions.slice().sort(() => Math.random() - 0.5).slice(0, 5).map(q => ({ id: q.id, question: q.question, options: q.options, category: q.category, type: q.type, answer: q.answer, explanation: q.explanation }))
  const aiData = duelQs.map(q => simAI(q, 0.7))
  duelRooms[roomId] = { playerId: user.id, questions: duelQs, playerAnswers: [], playerTimes: [], aiAnswers: aiData.map(d => d.answer), aiTimes: aiData.map(d => d.time), status: 'waiting', aiSkill: 0.7 }
  const safeQs = duelQs.map(({ id, question, options, category, type }) => ({ id, question, options, category, type }))
  res.json({ roomId, questions: safeQs })
})

app.post('/api/duel/answer', authMiddleware, (req, res) => {
  const { roomId, questionIndex, answer, time } = req.body
  const room = duelRooms[roomId]
  if (!room) return res.status(404).json({ error: '房间不存在' })
  if (room.playerId !== req.user.id) return res.status(403).json({ error: '无权操作' })
  if (room.playerAnswers[questionIndex] !== undefined) return res.status(400).json({ error: '已答过此题' })
  room.playerAnswers[questionIndex] = answer
  room.playerTimes[questionIndex] = time
  res.json({ message: '已记录' })
})

app.post('/api/duel/end', authMiddleware, (req, res) => {
  const { roomId } = req.body
  const room = duelRooms[roomId]
  if (!room) return res.status(404).json({ error: '房间不存在' })
  if (room.playerId !== req.user.id) return res.status(403).json({ error: '无权操作' })
  if (room.status === 'finished') return res.status(400).json({ error: '已结束' })
  room.status = 'finished'
  const playerScore = room.playerAnswers.filter((ans, idx) => ans === room.questions[idx].answer).length
  const aiScore = room.aiAnswers.filter((ans, idx) => ans === room.questions[idx].answer).length
  let winner = 'draw'
  if (playerScore > aiScore) winner = 'player'
  else if (playerScore < aiScore) winner = 'ai'
  const user = findUser(req.user.id)
  const newRankScore = calcElo(user.rankScore, user.rankScore, playerScore, 5)
  user.rankScore = newRankScore
  user.rankLevel = getRank(newRankScore)
  const details = room.questions.map((q, idx) => ({
    question: q.question, options: q.options, correctAnswer: q.options[q.answer],
    playerAnswer: q.options[room.playerAnswers[idx]] || '未答', aiAnswer: q.options[room.aiAnswers[idx]],
    playerTime: room.playerTimes[idx] || 0, aiTime: room.aiTimes[idx],
    playerCorrect: room.playerAnswers[idx] === q.answer, aiCorrect: room.aiAnswers[idx] === q.answer, explanation: q.explanation
  }))
  delete duelRooms[roomId]
  res.json({ winner, playerScore, aiScore, newRankScore, details })
})

const PORT = 3001

app.use(express.static(path.join(__dirname, 'dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`后端就绪 :${PORT}`))