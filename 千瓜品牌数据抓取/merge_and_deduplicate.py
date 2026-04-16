import pandas as pd
import os

# 定义文件路径
file1 = '/Users/ml25qs01/trae-workspace/千瓜品牌数据抓取/千瓜数据_古茗_抖音_2026-03-01_to_2026-03-15.xlsx'
file2 = '/Users/ml25qs01/trae-workspace/千瓜品牌数据抓取/千瓜数据_古茗_抖音_2026-03-16_to_2026-03-31.xlsx'
output_file = '/Users/ml25qs01/trae-workspace/千瓜品牌数据抓取/千瓜数据_古茗_抖音_2026-03-01_to_2026-03-31.xlsx'

# 读取两个Excel文件
df1 = pd.read_excel(file1)
df2 = pd.read_excel(file2)

# 合并两个数据框
df_combined = pd.concat([df1, df2], ignore_index=True)

# 去重，保留所有列都相同的唯一记录
df_deduplicated = df_combined.drop_duplicates()

# 保存去重后的数据到新文件
df_deduplicated.to_excel(output_file, index=False)

print(f"处理完成！")
print(f"原始数据行数: {len(df1)} + {len(df2)} = {len(df1) + len(df2)}")
print(f"去重后数据行数: {len(df_deduplicated)}")
print(f"保存路径: {output_file}")
