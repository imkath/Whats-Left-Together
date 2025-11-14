#!/usr/bin/env python3
"""
Script para procesar Life Tables F06 de UN WPP-2024 usando pandas

Este script es MUCHO más rápido que la versión en Node.js porque pandas
está optimizado para leer archivos Excel grandes.

EJECUCIÓN:
    python3 scripts/process_life_tables.py

DEPENDENCIAS:
    pip install pandas openpyxl
"""

import pandas as pd
import json
import os
from pathlib import Path
from datetime import datetime
import hashlib

# Configuración
CONFIG = {
    'input_files': {
        'male': 'src/lib/data/raw/WPP2024_MORT_F06_2_SINGLE_AGE_LIFE_TABLE_ESTIMATES_MALE.xlsx',
        'female': 'src/lib/data/raw/WPP2024_MORT_F06_3_SINGLE_AGE_LIFE_TABLE_ESTIMATES_FEMALE.xlsx'
    },
    'output_dir': 'public/data/life-tables',
    'countries_json': 'src/lib/data/countries.json',
    'log_file': 'data/DOWNLOAD_LOG.md',
    'sheet_name': 'Estimates 2016-2023',  # Hoja con datos más recientes
    'target_year': 2023,

    # Países a procesar (todos los principales)
    'countries': [
        # América Latina (19)
        'CHL', 'ARG', 'BRA', 'MEX', 'COL', 'PER', 'VEN', 'ECU', 'BOL', 'URY',
        'PRY', 'CRI', 'PAN', 'GTM', 'CUB', 'DOM', 'HND', 'SLV', 'NIC',
        # Norte América (2)
        'USA', 'CAN',
        # Europa (28)
        'ESP', 'GBR', 'DEU', 'FRA', 'ITA', 'PRT', 'NLD', 'BEL', 'AUT', 'CHE',
        'GRC', 'SWE', 'NOR', 'DNK', 'POL', 'CZE', 'HUN', 'ROU', 'UKR', 'IRL',
        'FIN', 'SVK', 'BGR', 'HRV', 'LTU', 'SVN', 'LVA', 'EST',
        # Asia (19)
        'JPN', 'CHN', 'IND', 'KOR', 'IDN', 'THA', 'VNM', 'PHL', 'MYS', 'SGP',
        'PAK', 'BGD', 'IRN', 'TUR', 'IRQ', 'SAU', 'ISR', 'KAZ', 'UZB',
        # Oceanía (2)
        'AUS', 'NZL',
        # África (10)
        'ZAF', 'EGY', 'NGA', 'KEN', 'ETH', 'TZA', 'UGA', 'DZA', 'MAR', 'GHA',
        # Otros (1)
        'RUS'
    ],

    'country_names': {
        # América Latina
        'CHL': 'Chile', 'ARG': 'Argentina', 'BRA': 'Brazil', 'MEX': 'Mexico',
        'COL': 'Colombia', 'PER': 'Peru', 'VEN': 'Venezuela', 'ECU': 'Ecuador',
        'BOL': 'Bolivia', 'URY': 'Uruguay', 'PRY': 'Paraguay', 'CRI': 'Costa Rica',
        'PAN': 'Panama', 'GTM': 'Guatemala', 'CUB': 'Cuba', 'DOM': 'Dominican Republic',
        'HND': 'Honduras', 'SLV': 'El Salvador', 'NIC': 'Nicaragua',
        # Norte América
        'USA': 'United States', 'CAN': 'Canada',
        # Europa
        'ESP': 'Spain', 'GBR': 'United Kingdom', 'DEU': 'Germany', 'FRA': 'France',
        'ITA': 'Italy', 'PRT': 'Portugal', 'NLD': 'Netherlands', 'BEL': 'Belgium',
        'AUT': 'Austria', 'CHE': 'Switzerland', 'GRC': 'Greece', 'SWE': 'Sweden',
        'NOR': 'Norway', 'DNK': 'Denmark', 'POL': 'Poland', 'CZE': 'Czech Republic',
        'HUN': 'Hungary', 'ROU': 'Romania', 'UKR': 'Ukraine', 'IRL': 'Ireland',
        'FIN': 'Finland', 'SVK': 'Slovakia', 'BGR': 'Bulgaria', 'HRV': 'Croatia',
        'LTU': 'Lithuania', 'SVN': 'Slovenia', 'LVA': 'Latvia', 'EST': 'Estonia',
        # Asia
        'JPN': 'Japan', 'CHN': 'China', 'IND': 'India', 'KOR': 'South Korea',
        'IDN': 'Indonesia', 'THA': 'Thailand', 'VNM': 'Vietnam', 'PHL': 'Philippines',
        'MYS': 'Malaysia', 'SGP': 'Singapore', 'PAK': 'Pakistan', 'BGD': 'Bangladesh',
        'IRN': 'Iran', 'TUR': 'Turkey', 'IRQ': 'Iraq', 'SAU': 'Saudi Arabia',
        'ISR': 'Israel', 'KAZ': 'Kazakhstan', 'UZB': 'Uzbekistan',
        # Oceanía
        'AUS': 'Australia', 'NZL': 'New Zealand',
        # África
        'ZAF': 'South Africa', 'EGY': 'Egypt', 'NGA': 'Nigeria', 'KEN': 'Kenya',
        'ETH': 'Ethiopia', 'TZA': 'Tanzania', 'UGA': 'Uganda', 'DZA': 'Algeria',
        'MAR': 'Morocco', 'GHA': 'Ghana',
        # Otros
        'RUS': 'Russia'
    }
}

def calculate_file_hash(filepath):
    """Calcular SHA256 de un archivo"""
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            sha256.update(chunk)
    return sha256.hexdigest()

def process_excel_file(filepath, sex):
    """Procesar archivo Excel para un sexo específico"""
    print(f"\n{'='*70}")
    print(f"📖 Procesando: {Path(filepath).name}")
    print(f"   Sexo: {sex}")
    print(f"{'='*70}")

    # Leer Excel con pandas (mucho más rápido que XLSX)
    # Los archivos F06 tienen metadata en las primeras 16 filas
    print("   📂 Cargando archivo Excel con pandas...")
    df = pd.read_excel(filepath, sheet_name=CONFIG['sheet_name'], engine='openpyxl', skiprows=16)

    print(f"   ✅ Archivo cargado: {len(df):,} filas")
    print(f"   📋 Columnas: {list(df.columns[:10])}...")

    # Renombrar columnas para facilitar el procesamiento
    df.columns = [str(col).strip().lower() for col in df.columns]

    # Detectar columnas relevantes
    iso3_col = None
    year_col = None
    age_col = None
    qx_col = None
    lx_col = None
    ex_col = None

    for col in df.columns:
        col_lower = col.lower()
        if 'iso3' in col_lower or 'iso 3' in col_lower:
            iso3_col = col
        elif col_lower == 'year':
            year_col = col
        elif 'age (x)' in col_lower or col_lower == 'age':
            age_col = col
        elif 'probability of dying' in col_lower or 'q(x' in col_lower:
            qx_col = col
        elif 'number of survivors' in col_lower or 'l(x)' in col_lower:
            lx_col = col
        elif 'expectation of life' in col_lower or 'e(x)' in col_lower:
            ex_col = col

    print(f"   🔍 Columnas detectadas:")
    print(f"      ISO3: {iso3_col}")
    print(f"      Year: {year_col}")
    print(f"      Age: {age_col}")
    print(f"      qx: {qx_col}")
    print(f"      lx: {lx_col}")
    print(f"      ex: {ex_col}")

    if not all([iso3_col, age_col, qx_col, lx_col, ex_col]):
        raise ValueError("No se encontraron todas las columnas requeridas")

    # Filtrar por año objetivo
    if year_col:
        df = df[df[year_col] == CONFIG['target_year']]
        print(f"   ⚙️  Filtrado por año {CONFIG['target_year']}: {len(df):,} filas")

    # Filtrar por países configurados
    df = df[df[iso3_col].isin(CONFIG['countries'])]
    print(f"   ⚙️  Filtrado por países: {len(df):,} filas")

    # Procesar cada país
    results = {}
    countries_processed = set()

    for country_code in CONFIG['countries']:
        country_data = df[df[iso3_col] == country_code].copy()

        if len(country_data) == 0:
            continue

        # Ordenar por edad
        country_data = country_data.sort_values(age_col)

        # Crear entradas
        entries = []
        for _, row in country_data.iterrows():
            try:
                age = int(row[age_col])
                qx = float(row[qx_col])
                lx = float(row[lx_col])
                ex = float(row[ex_col])

                entries.append({
                    'age': age,
                    'qx': round(qx, 6),
                    'lx': round(lx, 2),
                    'ex': round(ex, 2)
                })
            except (ValueError, TypeError):
                continue

        if len(entries) < 50:
            print(f"   ⚠️  {country_code}: Solo {len(entries)} edades (se esperaban ~101)")
            continue

        results[f"{country_code}_{sex}"] = {
            'country': country_code,
            'countryName': CONFIG['country_names'].get(country_code, country_code),
            'sex': sex,
            'year': CONFIG['target_year'],
            'source': 'UN World Population Prospects 2024',
            'sourceUrl': 'https://population.un.org/wpp/',
            'downloadDate': datetime.now().strftime('%Y-%m-%d'),
            'entries': entries
        }

        countries_processed.add(country_code)
        print(f"   ✅ {country_code}_{sex}.json ({len(entries)} edades)")

    return results, countries_processed

def save_results(all_results):
    """Guardar archivos JSON"""
    output_dir = Path(CONFIG['output_dir'])
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*70}")
    print("💾 Guardando archivos JSON...")
    print(f"{'='*70}\n")

    for key, data in all_results.items():
        filepath = output_dir / f"{key}.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"   ✅ {key}.json")

    print(f"\n   📦 Total: {len(all_results)} archivos generados")

def update_countries_json(countries_processed):
    """Actualizar countries.json"""
    countries_data = []

    for code in sorted(countries_processed):
        name = CONFIG['country_names'].get(code, code)

        # Determinar región
        region = 'Other'
        if code in ['CHL', 'ARG', 'BRA', 'MEX', 'COL', 'PER', 'VEN', 'ECU', 'BOL', 'URY', 'PRY', 'CRI', 'PAN', 'GTM', 'CUB', 'DOM', 'HND', 'SLV', 'NIC']:
            region = 'Latin America'
        elif code in ['USA', 'CAN']:
            region = 'North America'
        elif code in ['ESP', 'GBR', 'DEU', 'FRA', 'ITA', 'PRT', 'NLD', 'BEL', 'AUT', 'CHE', 'GRC', 'SWE', 'NOR', 'DNK', 'POL', 'CZE', 'HUN', 'ROU', 'UKR', 'IRL', 'FIN', 'SVK', 'BGR', 'HRV', 'LTU', 'SVN', 'LVA', 'EST']:
            region = 'Europe'
        elif code in ['JPN', 'CHN', 'IND', 'KOR', 'IDN', 'THA', 'VNM', 'PHL', 'MYS', 'SGP', 'PAK', 'BGD', 'IRN', 'TUR', 'IRQ', 'SAU', 'ISR', 'KAZ', 'UZB']:
            region = 'Asia'
        elif code in ['AUS', 'NZL']:
            region = 'Oceania'
        elif code in ['ZAF', 'EGY', 'NGA', 'KEN', 'ETH', 'TZA', 'UGA', 'DZA', 'MAR', 'GHA']:
            region = 'Africa'

        countries_data.append({
            'code': code,
            'name': name,
            'nameEs': name,  # TODO: Agregar traducciones
            'region': region,
            'hasData': True
        })

    with open(CONFIG['countries_json'], 'w', encoding='utf-8') as f:
        json.dump(countries_data, f, indent=2, ensure_ascii=False)

    print(f"\n   ✅ Actualizado: {CONFIG['countries_json']} ({len(countries_data)} países)")

def main():
    import time
    start_time = time.time()

    print("\n" + "="*70)
    print("🚀 PROCESADOR DE LIFE TABLES UN WPP-2024 (Python + Pandas)")
    print("="*70)
    print(f"📅 Año objetivo: {CONFIG['target_year']}")
    print(f"🌍 Países configurados: {len(CONFIG['countries'])}")
    print("="*70)

    # Verificar archivos
    for sex, filepath in CONFIG['input_files'].items():
        if not os.path.exists(filepath):
            print(f"\n❌ Archivo no encontrado: {filepath}")
            return

        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f"   ✅ {sex}: {size_mb:.0f} MB")

    # Procesar archivos
    all_results = {}
    all_countries = set()

    try:
        for sex, filepath in CONFIG['input_files'].items():
            results, countries = process_excel_file(filepath, sex)
            all_results.update(results)
            all_countries.update(countries)
    except Exception as e:
        print(f"\n❌ Error procesando archivos: {e}")
        import traceback
        traceback.print_exc()
        return

    # Guardar resultados
    save_results(all_results)

    # Actualizar countries.json
    update_countries_json(all_countries)

    # Resumen
    elapsed = time.time() - start_time

    print("\n" + "="*70)
    print("✨ PROCESAMIENTO COMPLETADO")
    print("="*70)
    print(f"⏱️  Tiempo: {elapsed:.1f} segundos")
    print(f"📦 Archivos generados: {len(all_results)}")
    print(f"🌍 Países con datos: {len(all_countries)}")
    print(f"📁 Directorio: {CONFIG['output_dir']}")
    print("="*70)

    print("\n✅ ¡Datos reales de la ONU listos!")
    print("\n📝 Próximos pasos:")
    print("   1. npm run dev")
    print("   2. Prueba la calculadora con diferentes países")
    print("   3. Compara con los datos de muestra anteriores\n")

if __name__ == '__main__':
    main()
