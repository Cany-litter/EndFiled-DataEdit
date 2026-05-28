import zipfile
import re

path = r'C:\Users\cany\Desktop\tool\vscode\workSpace\OpenCodeWorkSpace\EndFiled\excel\Endfield伤害期望计算器v0.11-伊汤冰队 - 副本.xlsx'

with zipfile.ZipFile(path, 'r') as z:
    with z.open('xl/worksheets/sheet1.xml') as f:
        content = f.read().decode('utf-8')
        
    # Find AC2 formula (column AC = 29)
    for ref in ['AC2', 'AB2', 'AD2', 'AE2', 'AF2', 'AG2', 'AH2', 'AI2', 'AJ2', 'AK2', 'AL2', 'AM2', 'AN2']:
        pattern = f'<c r="{ref}"[^>]*>.*?</c>'
        matches = re.findall(pattern, content, re.DOTALL)
        for m in matches[:3]:
            print(f'{ref}: {m[:500]}')
        if not matches:
            print(f'{ref}: NOT FOUND')
    print()
    
    # Also look for the formula definitions in cell formulas
    # Find all <f> tags
    formulas = re.findall(r'<f[^>]*>.*?</f>', content, re.DOTALL)
    for f in formulas:
        print(f[:300])
