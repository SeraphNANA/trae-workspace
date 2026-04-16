#!/usr/bin/env python3
"""
千瓜数据抓取工作流 - 使用API接口抓取
【1. 输入参数】→ 【2. API数据抓取】→ 【3. 数据处理】→ 【4. 最终输出Excel】

使用说明：
1. 登录千瓜数据平台 https://app.qian-gua.com
2. 搜索品牌并设置筛选条件
3. 打开浏览器开发者工具（F12）→ Network
4. 找到 GetPlatFromBrandDataList 请求
5. 复制请求的Cookie和brandid参数
6. 将Cookie粘贴到CONFIG['cookie']中
7. 修改CONFIG中的其他参数（品牌、日期范围、渠道、brandid）
8. 运行脚本：python3 qiangua_scraper.py
9. 或使用命令行参数：python3 qiangua_scraper.py --brand 古茗 --channel 抖音 --start-date 2026-03-01 --end-date 2026-03-15
"""

import asyncio
import time
import requests
import pandas as pd
import argparse
from datetime import datetime, timedelta

# ==================== 命令行参数解析 ====================
def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description='千瓜数据抓取器')
    parser.add_argument('--brand', type=str, default='古茗', help='品牌名称')
    parser.add_argument('--brandid', type=str, default='804643', help='品牌ID')
    parser.add_argument('--channel', type=str, default='抖音', help='渠道（抖音/小红书/微博）')
    parser.add_argument('--start-date', type=str, default='2026-03-01', help='开始日期（YYYY-MM-DD）')
    parser.add_argument('--end-date', type=str, default='2026-03-15', help='结束日期（YYYY-MM-DD）')
    parser.add_argument('--max-items', type=int, default=150, help='最多抓取数量')
    return parser.parse_args()

# ==================== 【1. 输入参数】 ====================
CONFIG = {
    "api_url": "https://api.qian-gua.com/v2/brand/GetPlatFromBrandDataList",  # API接口
    "cookie": "UM_distinctid=19c4b7cd9d41594-0350388306a246-1c525631-157188-19c4b7cd9d51b9b; _c_WBKFRo=FT9SsqpgUdhThpNxlCEBfyL4xJHMAPKYuY47Z2Nv; Hm_lvt_ed4e8df159c27d4f0ce1a965612b94dd=1774517014,1775105164,1775310619,1775490525; HMACCOUNT=C4C8138F554270DD; User=UserId=f9b4a40467a170aa&Password=bac22cc98940e8192c0df10b1442eeb6&ChildId=93881; Hm_lvt_c6d9cdbaf0b464645ff2ee32a71ea1ae=1774342851,1775533118; Hm_lpvt_c6d9cdbaf0b464645ff2ee32a71ea1ae=1775533600; _uetsid=62eed150323411f180e5175a24a62ddd|1en34ih|2|g50|0|2288; _uetvid=e352d550071611f1b244b34a28626087|9w8mhs|1775533601266|1|1|bat.bing.com/p/conversions/c/i; Hm_lpvt_ed4e8df159c27d4f0ce1a965612b94dd=1775534998; CNZZDATA1281397103=909541008-1774517014-%7C1775534998",  # 从浏览器复制的Cookie
    "brandid": "804643",  # 品牌ID
    "brand": "古茗",  # 品牌名称
    "start_date": "2026-03-01",  # 开始日期
    "end_date": "2026-03-15",  # 结束日期
    "channel": "抖音",  # 渠道
    "max_items": 150,  # 最多抓取150条
    "page_size": 50,  # 每页数量
    "request_interval": 2,  # 请求间隔(秒)
    "max_retries": 3,  # 最大重试次数
    "timeout": 30,  # 请求超时时间(秒)
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# 渠道映射（平台类型）
CHANNEL_MAP = {
    "抖音": 2,
    "小红书": 1,
    "微博": 3
}

# 品牌ID映射
BRAND_ID_MAP = {
    "古茗": "804643",
    "库迪咖啡": "826079",
    "星巴克": "39010",
    "蜜雪冰城": "805164"
    # 可以在这里添加更多品牌
}

# ==================== 【2. API数据抓取】 ====================
class APIScraper:
    """使用API进行数据抓取"""
    
    def __init__(self, config: dict):
        self.config = config
        self.headers = {
            "User-Agent": config.get('user_agent'),
            "Cookie": config.get('cookie'),
            "Referer": "https://app.qian-gua.com/",
            "Origin": "https://app.qian-gua.com"
        }
    
    async def fetch_data(self) -> list:
        """抓取指定日期范围内的数据"""
        data_list = []
        page_index = 1
        collected = 0
        max_items = self.config.get('max_items', 150)
        page_size = self.config.get('page_size', 50)
        
        while collected < max_items:
            try:
                params = {
                    "brandid": self.config.get('brandid'),
                    "days": -1,
                    "platfromtype": CHANNEL_MAP.get(self.config.get('channel'), 2),
                    "starttime": self.config.get('start_date'),
                    "endtime": self.config.get('end_date'),
                    "sort": 1,  # 按互动量排序
                    "pageindex": page_index,
                    "pagesize": page_size,
                    "_": int(time.time() * 1000)  # 防缓存参数
                }
                
                print(f"[抓取] 页码: {page_index}")
                
                response = requests.get(
                    self.config.get('api_url'),
                    params=params,
                    headers=self.headers,
                    timeout=self.config.get('timeout', 30)
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # 打印完整响应
                    print(f"[抓取] API响应: {result}")
                    
                    # 检查响应状态
                    if result.get('Code') != 200:
                        print(f"[抓取] API错误: {result.get('Msg', '未知错误')}")
                        break
                    
                    item_list = result.get('Data', {}).get('ItemList', [])
                    
                    print(f"[抓取] 数据列表长度: {len(item_list)}")
                    
                    if not item_list:
                        break
                    
                    for item in item_list:
                        if collected >= max_items:
                            break
                        
                        # 提取数据
                        data_item = {
                            "品牌": self.config.get('brand'),
                            "渠道": self.config.get('channel'),
                            "标题": item.get('Video', {}).get('Title', ''),
                            "作者": item.get('Blogger', {}).get('NickName', ''),
                            "粉丝数": item.get('Blogger', {}).get('Fans', 0),
                            "原链接": item.get('Video', {}).get('Url', ''),
                            "互动量": item.get('Video', {}).get('Likes', 0) + item.get('Video', {}).get('Comments', 0) + item.get('Video', {}).get('Shares', 0),
                            "点赞": item.get('Video', {}).get('Likes', 0),
                            "评论": item.get('Video', {}).get('Comments', 0),
                            "分享": item.get('Video', {}).get('Shares', 0)
                        }
                        data_list.append(data_item)
                        collected += 1
                    
                    page_index += 1
                    await asyncio.sleep(self.config.get('request_interval', 2))
                else:
                    print(f"[抓取] 失败: 状态码 {response.status_code}")
                    print(f"[抓取] 响应内容: {response.text[:200]}")
                    break
                    
            except Exception as e:
                print(f"[抓取] 错误: {str(e)}")
                await asyncio.sleep(self.config.get('request_interval', 2))
                
        print(f"[抓取] 完成，共抓取 {len(data_list)} 条数据")
        return data_list

# ==================== 【3. 数据处理】 ====================
class DataProcessor:
    """数据处理"""
    
    @staticmethod
    def generate_date_range(start_date: str, end_date: str) -> list:
        """生成日期范围"""
        dates = []
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        current = start
        while current <= end:
            dates.append(current.strftime("%Y-%m-%d"))
            current += timedelta(days=1)
        
        return dates

# ==================== 【4. 最终输出】 ====================
class ExcelExporter:
    """导出Excel文件"""
    
    @staticmethod
    def export(data: list, output_path: str):
        """导出数据到Excel"""
        print(f"[Excel] 正在导出到: {output_path}")
        
        if data:
            df = pd.DataFrame(data)
            # 选择并排序列
            columns = ["品牌", "渠道", "标题", "作者", "粉丝数", "原链接", "互动量", "点赞", "评论", "分享"]
            df = df[columns]
            df.to_excel(output_path, index=False)
        else:
            # 创建空表格
            df = pd.DataFrame(columns=["品牌", "渠道", "标题", "作者", "粉丝数", "原链接", "互动量", "点赞", "评论", "分享"])
            df.to_excel(output_path, index=False)
        
        print(f"[Excel] 导出完成: {output_path}")
        print(f"[Excel] 总数据量: {len(data)} 条")
        return output_path

# ==================== 主流程 ====================
async def main():
    """主流程"""
    # 解析命令行参数
    args = parse_args()
    
    # 使用命令行参数覆盖默认配置
    config = CONFIG.copy()
    config['brand'] = args.brand
    
    # 如果用户指定了brandid，则使用用户指定的；否则根据品牌名称自动获取
    if args.brandid and args.brandid != '804643':  # 804643是默认值
        config['brandid'] = args.brandid
    else:
        # 根据品牌名称自动获取品牌ID
        brand_id = BRAND_ID_MAP.get(args.brand, config.get('brandid'))
        config['brandid'] = brand_id
    
    config['channel'] = args.channel
    config['start_date'] = args.start_date
    config['end_date'] = args.end_date
    config['max_items'] = args.max_items
    
    print("=" * 60)
    print("千瓜数据抓取工作流 - 开始执行")
    print(f"📋 配置参数:")
    print(f"   品牌: {config.get('brand')}")
    print(f"   品牌ID: {config.get('brandid')}")
    print(f"   渠道: {config.get('channel')}")
    print(f"   日期范围: {config.get('start_date')} 至 {config.get('end_date')}")
    print(f"   最大抓取数: {config.get('max_items')}")
    print("=" * 60)
    
    # 检查Cookie是否设置
    if not config.get('cookie'):
        print("[错误] 请在CONFIG中设置登录Cookie")
        print("[提示] 请按照脚本顶部的使用说明获取Cookie")
        return
    
    # 检查brandid是否设置
    if not config.get('brandid'):
        print("[错误] 请在CONFIG中设置品牌ID")
        print("[提示] 请按照脚本顶部的使用说明获取brandid")
        return
    
    # 1. 初始化
    scraper = APIScraper(config)
    
    # 2. 抓取数据
    print("\n[步骤1] 抓取数据...")
    all_data = await scraper.fetch_data()
    
    # 3. 导出Excel
    print("\n[步骤2] 导出Excel...")
    output_path = f"千瓜数据_{config.get('brand')}_{config.get('channel')}_{config.get('start_date')}_to_{config.get('end_date')}.xlsx"
    ExcelExporter.export(all_data, output_path)
    
    print("\n" + "=" * 60)
    print(f"✅ 执行成功!")
    print(f"📁 文件路径: {output_path}")
    print(f"📊 总抓取数据: {len(all_data)} 条")
    print("=" * 60)
    
    return output_path

if __name__ == "__main__":
    asyncio.run(main())