import zipfile
import xml.etree.ElementTree as ET
import json
import re

DOCX_PATH = '/Users/jason/Library/CloudStorage/GoogleDrive-chenja1977@gmail.com/其他電腦/我的 Mac (1)/Downloads/ASO/工作文件/週報/菙事長室 技術研發部工作週報區/研發部工作週報20260828.docx'
XLSX_PATH = '/Users/jason/Library/CloudStorage/GoogleDrive-chenja1977@gmail.com/其他電腦/我的電腦/Downloads/全國門市專櫃分區表_20250505.xlsx'

print("=== 1. Reading DOCX ===")
docx_text = []
with zipfile.ZipFile(DOCX_PATH) as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
        if texts:
            docx_text.append(''.join(texts))

print(f"Total paragraphs in docx: {len(docx_text)}")
relevant_paras = [p for p in docx_text if '自然足' in p or '門市' in p or '25' in p]
print("Relevant lines preview:")
for p in relevant_paras[:20]:
    print("  ->", p)

print("\n=== 2. Reading XLSX ===")
with zipfile.ZipFile(XLSX_PATH) as z:
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        stree = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in stree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
            t = si.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
            if t is not None and t.text:
                shared_strings.append(t.text)
            else:
                texts = [r.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t').text for r in si.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}r') if r.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') is not None]
                shared_strings.append(''.join(texts))

    sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    rows = sheet_tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
    
    excel_stores = []
    for row in rows:
        cells = row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c')
        d = {}
        for c in cells:
            r = c.get('r')
            col = ''.join([ch for ch in r if ch.isalpha()])
            t = c.get('t')
            v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
            val = v.text if v is not None else ''
            if t == 's' and val != '':
                val = shared_strings[int(val)]
            d[col] = str(val).strip()
        
        # Check if row has data
        # Headers: A:代碼, B:代號, C:營業部, D:門市名稱, E:店長, F:電話, G:地址
        code = d.get('B', '')
        name = d.get('D', '')
        if code and code != '代號' and name and name != '門市名稱':
            excel_stores.append({
                'code': code,
                'alphaCode': d.get('A', ''),
                'dept': d.get('C', ''),
                'name': name,
                'manager': d.get('E', ''),
                'phone': d.get('F', ''),
                'address': d.get('G', '')
            })

print(f"Total excel stores loaded: {len(excel_stores)}")
print("First 5 excel stores:", json.dumps(excel_stores[:5], ensure_ascii=False))

# Look for 25 stores in docx text
full_doc_str = "\n".join(docx_text)
with open('/tmp/docx_dump.txt', 'w', encoding='utf-8') as f:
    f.write(full_doc_str)
print("Docx dumped to /tmp/docx_dump.txt")
