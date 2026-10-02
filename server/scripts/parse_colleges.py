import zipfile
import json
import xml.etree.ElementTree as ET
import time
import re

start_time = time.time()
xlsx_path = "College-ALL COLLEGE.xlsx"
out_jsonl = "server/scripts/colleges.jsonl"

print("Opening xlsx file...")
with zipfile.ZipFile(xlsx_path, 'r') as z:
    with z.open('xl/worksheets/sheet1.xml') as f:
        print("Parsing XML stream...")
        count = 0
        with open(out_jsonl, 'w', encoding='utf-8') as out:
            # Iterparse
            context = ET.iterparse(f, events=('end',))
            for event, elem in context:
                # Local tag without namespace
                tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
                if tag == 'row':
                    r_attr = elem.attrib.get('r', '')
                    try:
                        row_idx = int(r_attr)
                    except ValueError:
                        row_idx = 0
                    
                    if row_idx >= 4:
                        row_data = {}
                        for cell in elem:
                            c_tag = cell.tag.split('}')[-1] if '}' in cell.tag else cell.tag
                            if c_tag == 'c':
                                cell_ref = cell.attrib.get('r', '')
                                col_letter = re.match(r'([A-Z]+)', cell_ref)
                                col = col_letter.group(1) if col_letter else ''
                                
                                val = ''
                                for child in cell:
                                    ch_tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                                    if ch_tag == 'v' or ch_tag == 't':
                                        val = child.text or ''
                                        break
                                if col:
                                    row_data[col] = val.strip()

                        aishe_code = row_data.get('A', '')
                        name = row_data.get('B', '')
                        state = row_data.get('C', '')
                        district = row_data.get('D', '')
                        website = row_data.get('E', '')
                        year = row_data.get('F', '')
                        location = row_data.get('G', '')
                        college_type = row_data.get('H', '')
                        management = row_data.get('I', '')
                        university_aishe = row_data.get('J', '')
                        university_name = row_data.get('K', '')
                        university_type = row_data.get('L', '')

                        if name:
                            # Clean up name if it has leading index like "061-" or "100002-"
                            clean_name = re.sub(r'^\d+[-\s]+', '', name).strip()
                            if not clean_name:
                                clean_name = name.strip()

                            record = {
                                "aisheCode": aishe_code,
                                "name": clean_name,
                                "rawName": name,
                                "state": state,
                                "district": district,
                                "city": district,
                                "website": website,
                                "yearOfEstablishment": year,
                                "location": location,
                                "collegeType": college_type,
                                "management": management,
                                "universityAisheCode": university_aishe,
                                "universityName": university_name,
                                "universityType": university_type,
                                "country": "India"
                            }
                            out.write(json.dumps(record, ensure_ascii=False) + '\n')
                            count += 1
                            if count % 10000 == 0:
                                print(f"Processed {count} colleges...")
                    
                    elem.clear()

print(f"Finished parsing {count} colleges in {time.time() - start_time:.2f}s!")
