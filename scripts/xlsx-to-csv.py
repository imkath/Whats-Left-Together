"""
Convert UN WPP-2024 XLSX life table sheets to CSV for Node.js processing.
Uses openpyxl read-only mode. Fixes incorrect dimension metadata by resetting it.
"""

import openpyxl
import csv
import sys
import os
import time

SHEET_NAME = 'Estimates 2016-2023'

FILES = {
    'male': 'src/lib/data/raw/WPP2024_MORT_F06_2_SINGLE_AGE_LIFE_TABLE_ESTIMATES_MALE.xlsx',
    'female': 'src/lib/data/raw/WPP2024_MORT_F06_3_SINGLE_AGE_LIFE_TABLE_ESTIMATES_FEMALE.xlsx',
}

OUTPUT_DIR = 'src/lib/data/raw'


def convert_sheet_to_csv(xlsx_path, csv_path):
    print(f'  Loading {os.path.basename(xlsx_path)}...')
    start = time.time()

    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)
    ws = wb[SHEET_NAME]

    # Fix: the XLSX files have incorrect dimension metadata (A1:W18)
    # Reset it so openpyxl reads all actual rows
    ws.reset_dimensions()

    row_count = 0
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for row in ws.iter_rows(values_only=True):
            writer.writerow(row)
            row_count += 1
            if row_count % 100000 == 0:
                print(f'    {row_count:,} rows...', flush=True)

    wb.close()
    elapsed = time.time() - start
    size_mb = os.path.getsize(csv_path) / (1024 * 1024)
    print(f'  Done: {row_count:,} rows, {size_mb:.1f} MB, {elapsed:.1f}s')
    return row_count


def main():
    print('Converting UN WPP-2024 XLSX to CSV...\n')

    for sex, xlsx_path in FILES.items():
        if not os.path.exists(xlsx_path):
            print(f'ERROR: {xlsx_path} not found')
            sys.exit(1)

        csv_path = os.path.join(OUTPUT_DIR, f'estimates_2016_2023_{sex}.csv')
        print(f'[{sex.upper()}]')
        convert_sheet_to_csv(xlsx_path, csv_path)
        print()

    print('All conversions complete.')


if __name__ == '__main__':
    main()
