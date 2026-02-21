/**
 * Script para procesar Life Tables F06 de UN WPP-2024
 *
 * Archivos F06: Single Age Life Tables (edades 0-100)
 * Contienen: mx, qx, px, lx, dx, Lx, Sx, Tx, ex, ax
 *
 * ARCHIVOS NECESARIOS:
 * - WPP2024_MORT_F06_2_SINGLE_AGE_LIFE_TABLE_ESTIMATES_MALE.xlsx
 * - WPP2024_MORT_F06_3_SINGLE_AGE_LIFE_TABLE_ESTIMATES_FEMALE.xlsx
 *
 * EJECUCIÓN:
 * npm run process-life-tables-f06
 *
 * SALIDA:
 * public/data/life-tables/{COUNTRY}_{sex}.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuración
const CONFIG = {
  // CSV files pre-converted from XLSX using scripts/xlsx-to-csv.py
  inputFiles: {
    male: 'src/lib/data/raw/estimates_2016_2023_male.csv',
    female: 'src/lib/data/raw/estimates_2016_2023_female.csv',
  },

  outputDir: 'public/data/life-tables',
  logFile: 'data/DOWNLOAD_LOG.md',

  targetYear: 2023, // Los Estimates suelen llegar hasta 2023

  // Mapa completo de países: nombres en/es y región
  // Solo se procesan los países que están en este mapa Y en los datos XLSX
  countryMap: {
    // ── África ──
    DZA: { en: 'Algeria', es: 'Argelia', region: 'Africa' },
    AGO: { en: 'Angola', es: 'Angola', region: 'Africa' },
    BEN: { en: 'Benin', es: 'Benín', region: 'Africa' },
    BWA: { en: 'Botswana', es: 'Botsuana', region: 'Africa' },
    BFA: { en: 'Burkina Faso', es: 'Burkina Faso', region: 'Africa' },
    BDI: { en: 'Burundi', es: 'Burundi', region: 'Africa' },
    CPV: { en: 'Cabo Verde', es: 'Cabo Verde', region: 'Africa' },
    CMR: { en: 'Cameroon', es: 'Camerún', region: 'Africa' },
    CAF: { en: 'Central African Republic', es: 'República Centroafricana', region: 'Africa' },
    TCD: { en: 'Chad', es: 'Chad', region: 'Africa' },
    COM: { en: 'Comoros', es: 'Comoras', region: 'Africa' },
    COG: { en: 'Congo', es: 'Congo', region: 'Africa' },
    COD: { en: 'DR Congo', es: 'RD del Congo', region: 'Africa' },
    CIV: { en: "Côte d'Ivoire", es: 'Costa de Marfil', region: 'Africa' },
    DJI: { en: 'Djibouti', es: 'Yibuti', region: 'Africa' },
    EGY: { en: 'Egypt', es: 'Egipto', region: 'Africa' },
    GNQ: { en: 'Equatorial Guinea', es: 'Guinea Ecuatorial', region: 'Africa' },
    ERI: { en: 'Eritrea', es: 'Eritrea', region: 'Africa' },
    SWZ: { en: 'Eswatini', es: 'Esuatini', region: 'Africa' },
    ETH: { en: 'Ethiopia', es: 'Etiopía', region: 'Africa' },
    GAB: { en: 'Gabon', es: 'Gabón', region: 'Africa' },
    GMB: { en: 'Gambia', es: 'Gambia', region: 'Africa' },
    GHA: { en: 'Ghana', es: 'Ghana', region: 'Africa' },
    GIN: { en: 'Guinea', es: 'Guinea', region: 'Africa' },
    GNB: { en: 'Guinea-Bissau', es: 'Guinea-Bisáu', region: 'Africa' },
    KEN: { en: 'Kenya', es: 'Kenia', region: 'Africa' },
    LSO: { en: 'Lesotho', es: 'Lesoto', region: 'Africa' },
    LBR: { en: 'Liberia', es: 'Liberia', region: 'Africa' },
    LBY: { en: 'Libya', es: 'Libia', region: 'Africa' },
    MDG: { en: 'Madagascar', es: 'Madagascar', region: 'Africa' },
    MWI: { en: 'Malawi', es: 'Malaui', region: 'Africa' },
    MLI: { en: 'Mali', es: 'Malí', region: 'Africa' },
    MRT: { en: 'Mauritania', es: 'Mauritania', region: 'Africa' },
    MUS: { en: 'Mauritius', es: 'Mauricio', region: 'Africa' },
    MAR: { en: 'Morocco', es: 'Marruecos', region: 'Africa' },
    MOZ: { en: 'Mozambique', es: 'Mozambique', region: 'Africa' },
    NAM: { en: 'Namibia', es: 'Namibia', region: 'Africa' },
    NER: { en: 'Niger', es: 'Níger', region: 'Africa' },
    NGA: { en: 'Nigeria', es: 'Nigeria', region: 'Africa' },
    RWA: { en: 'Rwanda', es: 'Ruanda', region: 'Africa' },
    STP: { en: 'São Tomé and Príncipe', es: 'Santo Tomé y Príncipe', region: 'Africa' },
    SEN: { en: 'Senegal', es: 'Senegal', region: 'Africa' },
    SYC: { en: 'Seychelles', es: 'Seychelles', region: 'Africa' },
    SLE: { en: 'Sierra Leone', es: 'Sierra Leona', region: 'Africa' },
    SOM: { en: 'Somalia', es: 'Somalia', region: 'Africa' },
    ZAF: { en: 'South Africa', es: 'Sudáfrica', region: 'Africa' },
    SSD: { en: 'South Sudan', es: 'Sudán del Sur', region: 'Africa' },
    SDN: { en: 'Sudan', es: 'Sudán', region: 'Africa' },
    TZA: { en: 'Tanzania', es: 'Tanzania', region: 'Africa' },
    TGO: { en: 'Togo', es: 'Togo', region: 'Africa' },
    TUN: { en: 'Tunisia', es: 'Túnez', region: 'Africa' },
    UGA: { en: 'Uganda', es: 'Uganda', region: 'Africa' },
    ZMB: { en: 'Zambia', es: 'Zambia', region: 'Africa' },
    ZWE: { en: 'Zimbabwe', es: 'Zimbabue', region: 'Africa' },
    MYT: { en: 'Mayotte', es: 'Mayotte', region: 'Africa' },
    REU: { en: 'Réunion', es: 'Reunión', region: 'Africa' },
    // ── Asia ──
    AFG: { en: 'Afghanistan', es: 'Afganistán', region: 'Asia' },
    ARM: { en: 'Armenia', es: 'Armenia', region: 'Asia' },
    AZE: { en: 'Azerbaijan', es: 'Azerbaiyán', region: 'Asia' },
    BHR: { en: 'Bahrain', es: 'Baréin', region: 'Asia' },
    BGD: { en: 'Bangladesh', es: 'Bangladés', region: 'Asia' },
    BTN: { en: 'Bhutan', es: 'Bután', region: 'Asia' },
    BRN: { en: 'Brunei', es: 'Brunéi', region: 'Asia' },
    KHM: { en: 'Cambodia', es: 'Camboya', region: 'Asia' },
    CHN: { en: 'China', es: 'China', region: 'Asia' },
    PRK: { en: 'North Korea', es: 'Corea del Norte', region: 'Asia' },
    KOR: { en: 'South Korea', es: 'Corea del Sur', region: 'Asia' },
    CYP: { en: 'Cyprus', es: 'Chipre', region: 'Asia' },
    GEO: { en: 'Georgia', es: 'Georgia', region: 'Asia' },
    HKG: { en: 'Hong Kong', es: 'Hong Kong', region: 'Asia' },
    IND: { en: 'India', es: 'India', region: 'Asia' },
    IDN: { en: 'Indonesia', es: 'Indonesia', region: 'Asia' },
    IRN: { en: 'Iran', es: 'Irán', region: 'Asia' },
    IRQ: { en: 'Iraq', es: 'Irak', region: 'Asia' },
    ISR: { en: 'Israel', es: 'Israel', region: 'Asia' },
    JPN: { en: 'Japan', es: 'Japón', region: 'Asia' },
    JOR: { en: 'Jordan', es: 'Jordania', region: 'Asia' },
    KAZ: { en: 'Kazakhstan', es: 'Kazajistán', region: 'Asia' },
    KWT: { en: 'Kuwait', es: 'Kuwait', region: 'Asia' },
    KGZ: { en: 'Kyrgyzstan', es: 'Kirguistán', region: 'Asia' },
    LAO: { en: 'Laos', es: 'Laos', region: 'Asia' },
    LBN: { en: 'Lebanon', es: 'Líbano', region: 'Asia' },
    MAC: { en: 'Macao', es: 'Macao', region: 'Asia' },
    MYS: { en: 'Malaysia', es: 'Malasia', region: 'Asia' },
    MDV: { en: 'Maldives', es: 'Maldivas', region: 'Asia' },
    MNG: { en: 'Mongolia', es: 'Mongolia', region: 'Asia' },
    MMR: { en: 'Myanmar', es: 'Myanmar', region: 'Asia' },
    NPL: { en: 'Nepal', es: 'Nepal', region: 'Asia' },
    OMN: { en: 'Oman', es: 'Omán', region: 'Asia' },
    PAK: { en: 'Pakistan', es: 'Pakistán', region: 'Asia' },
    PSE: { en: 'Palestine', es: 'Palestina', region: 'Asia' },
    PHL: { en: 'Philippines', es: 'Filipinas', region: 'Asia' },
    QAT: { en: 'Qatar', es: 'Catar', region: 'Asia' },
    SAU: { en: 'Saudi Arabia', es: 'Arabia Saudita', region: 'Asia' },
    SGP: { en: 'Singapore', es: 'Singapur', region: 'Asia' },
    LKA: { en: 'Sri Lanka', es: 'Sri Lanka', region: 'Asia' },
    SYR: { en: 'Syria', es: 'Siria', region: 'Asia' },
    TJK: { en: 'Tajikistan', es: 'Tayikistán', region: 'Asia' },
    THA: { en: 'Thailand', es: 'Tailandia', region: 'Asia' },
    TLS: { en: 'Timor-Leste', es: 'Timor Oriental', region: 'Asia' },
    TUR: { en: 'Turkey', es: 'Turquía', region: 'Asia' },
    TKM: { en: 'Turkmenistan', es: 'Turkmenistán', region: 'Asia' },
    ARE: { en: 'United Arab Emirates', es: 'Emiratos Árabes Unidos', region: 'Asia' },
    UZB: { en: 'Uzbekistan', es: 'Uzbekistán', region: 'Asia' },
    VNM: { en: 'Vietnam', es: 'Vietnam', region: 'Asia' },
    YEM: { en: 'Yemen', es: 'Yemen', region: 'Asia' },
    // ── Europa ──
    ALB: { en: 'Albania', es: 'Albania', region: 'Europe' },
    AUT: { en: 'Austria', es: 'Austria', region: 'Europe' },
    BLR: { en: 'Belarus', es: 'Bielorrusia', region: 'Europe' },
    BEL: { en: 'Belgium', es: 'Bélgica', region: 'Europe' },
    BIH: { en: 'Bosnia and Herzegovina', es: 'Bosnia y Herzegovina', region: 'Europe' },
    BGR: { en: 'Bulgaria', es: 'Bulgaria', region: 'Europe' },
    HRV: { en: 'Croatia', es: 'Croacia', region: 'Europe' },
    CZE: { en: 'Czechia', es: 'Chequia', region: 'Europe' },
    DNK: { en: 'Denmark', es: 'Dinamarca', region: 'Europe' },
    EST: { en: 'Estonia', es: 'Estonia', region: 'Europe' },
    FIN: { en: 'Finland', es: 'Finlandia', region: 'Europe' },
    FRA: { en: 'France', es: 'Francia', region: 'Europe' },
    DEU: { en: 'Germany', es: 'Alemania', region: 'Europe' },
    GRC: { en: 'Greece', es: 'Grecia', region: 'Europe' },
    HUN: { en: 'Hungary', es: 'Hungría', region: 'Europe' },
    ISL: { en: 'Iceland', es: 'Islandia', region: 'Europe' },
    IRL: { en: 'Ireland', es: 'Irlanda', region: 'Europe' },
    ITA: { en: 'Italy', es: 'Italia', region: 'Europe' },
    LVA: { en: 'Latvia', es: 'Letonia', region: 'Europe' },
    LTU: { en: 'Lithuania', es: 'Lituania', region: 'Europe' },
    LUX: { en: 'Luxembourg', es: 'Luxemburgo', region: 'Europe' },
    MLT: { en: 'Malta', es: 'Malta', region: 'Europe' },
    MDA: { en: 'Moldova', es: 'Moldavia', region: 'Europe' },
    MNE: { en: 'Montenegro', es: 'Montenegro', region: 'Europe' },
    NLD: { en: 'Netherlands', es: 'Países Bajos', region: 'Europe' },
    MKD: { en: 'North Macedonia', es: 'Macedonia del Norte', region: 'Europe' },
    NOR: { en: 'Norway', es: 'Noruega', region: 'Europe' },
    POL: { en: 'Poland', es: 'Polonia', region: 'Europe' },
    PRT: { en: 'Portugal', es: 'Portugal', region: 'Europe' },
    ROU: { en: 'Romania', es: 'Rumanía', region: 'Europe' },
    RUS: { en: 'Russia', es: 'Rusia', region: 'Europe' },
    SRB: { en: 'Serbia', es: 'Serbia', region: 'Europe' },
    SVK: { en: 'Slovakia', es: 'Eslovaquia', region: 'Europe' },
    SVN: { en: 'Slovenia', es: 'Eslovenia', region: 'Europe' },
    ESP: { en: 'Spain', es: 'España', region: 'Europe' },
    SWE: { en: 'Sweden', es: 'Suecia', region: 'Europe' },
    CHE: { en: 'Switzerland', es: 'Suiza', region: 'Europe' },
    UKR: { en: 'Ukraine', es: 'Ucrania', region: 'Europe' },
    GBR: { en: 'United Kingdom', es: 'Reino Unido', region: 'Europe' },
    // ── América Latina y el Caribe ──
    ATG: { en: 'Antigua and Barbuda', es: 'Antigua y Barbuda', region: 'Latin America' },
    ARG: { en: 'Argentina', es: 'Argentina', region: 'Latin America' },
    ABW: { en: 'Aruba', es: 'Aruba', region: 'Latin America' },
    BHS: { en: 'Bahamas', es: 'Bahamas', region: 'Latin America' },
    BRB: { en: 'Barbados', es: 'Barbados', region: 'Latin America' },
    BLZ: { en: 'Belize', es: 'Belice', region: 'Latin America' },
    BOL: { en: 'Bolivia', es: 'Bolivia', region: 'Latin America' },
    BRA: { en: 'Brazil', es: 'Brasil', region: 'Latin America' },
    CHL: { en: 'Chile', es: 'Chile', region: 'Latin America' },
    COL: { en: 'Colombia', es: 'Colombia', region: 'Latin America' },
    CRI: { en: 'Costa Rica', es: 'Costa Rica', region: 'Latin America' },
    CUB: { en: 'Cuba', es: 'Cuba', region: 'Latin America' },
    CUW: { en: 'Curaçao', es: 'Curazao', region: 'Latin America' },
    DOM: { en: 'Dominican Republic', es: 'República Dominicana', region: 'Latin America' },
    ECU: { en: 'Ecuador', es: 'Ecuador', region: 'Latin America' },
    SLV: { en: 'El Salvador', es: 'El Salvador', region: 'Latin America' },
    GRD: { en: 'Grenada', es: 'Granada', region: 'Latin America' },
    GLP: { en: 'Guadeloupe', es: 'Guadalupe', region: 'Latin America' },
    GTM: { en: 'Guatemala', es: 'Guatemala', region: 'Latin America' },
    GUF: { en: 'French Guiana', es: 'Guayana Francesa', region: 'Latin America' },
    GUY: { en: 'Guyana', es: 'Guyana', region: 'Latin America' },
    HTI: { en: 'Haiti', es: 'Haití', region: 'Latin America' },
    HND: { en: 'Honduras', es: 'Honduras', region: 'Latin America' },
    JAM: { en: 'Jamaica', es: 'Jamaica', region: 'Latin America' },
    MTQ: { en: 'Martinique', es: 'Martinica', region: 'Latin America' },
    MEX: { en: 'Mexico', es: 'México', region: 'Latin America' },
    NIC: { en: 'Nicaragua', es: 'Nicaragua', region: 'Latin America' },
    PAN: { en: 'Panama', es: 'Panamá', region: 'Latin America' },
    PRY: { en: 'Paraguay', es: 'Paraguay', region: 'Latin America' },
    PER: { en: 'Peru', es: 'Perú', region: 'Latin America' },
    PRI: { en: 'Puerto Rico', es: 'Puerto Rico', region: 'Latin America' },
    KNA: { en: 'Saint Kitts and Nevis', es: 'San Cristóbal y Nieves', region: 'Latin America' },
    LCA: { en: 'Saint Lucia', es: 'Santa Lucía', region: 'Latin America' },
    VCT: { en: 'Saint Vincent', es: 'San Vicente y las Granadinas', region: 'Latin America' },
    SUR: { en: 'Suriname', es: 'Surinam', region: 'Latin America' },
    TTO: { en: 'Trinidad and Tobago', es: 'Trinidad y Tobago', region: 'Latin America' },
    URY: { en: 'Uruguay', es: 'Uruguay', region: 'Latin America' },
    VEN: { en: 'Venezuela', es: 'Venezuela', region: 'Latin America' },
    VIR: { en: 'US Virgin Islands', es: 'Islas Vírgenes de EE.UU.', region: 'Latin America' },
    // ── América del Norte ──
    CAN: { en: 'Canada', es: 'Canadá', region: 'North America' },
    USA: { en: 'United States', es: 'Estados Unidos', region: 'North America' },
    // ── Oceanía ──
    AUS: { en: 'Australia', es: 'Australia', region: 'Oceania' },
    FJI: { en: 'Fiji', es: 'Fiyi', region: 'Oceania' },
    NCL: { en: 'New Caledonia', es: 'Nueva Caledonia', region: 'Oceania' },
    NZL: { en: 'New Zealand', es: 'Nueva Zelanda', region: 'Oceania' },
    PNG: { en: 'Papua New Guinea', es: 'Papúa Nueva Guinea', region: 'Oceania' },
    PYF: { en: 'French Polynesia', es: 'Polinesia Francesa', region: 'Oceania' },
    WSM: { en: 'Samoa', es: 'Samoa', region: 'Oceania' },
    SLB: { en: 'Solomon Islands', es: 'Islas Salomón', region: 'Oceania' },
    TON: { en: 'Tonga', es: 'Tonga', region: 'Oceania' },
    VUT: { en: 'Vanuatu', es: 'Vanuatu', region: 'Oceania' },
    GUM: { en: 'Guam', es: 'Guam', region: 'Oceania' },
  },
};

const results = {};
let rowsProcessed = 0;
const countriesFound = new Set();
const errors = [];
const warnings = [];

/**
 * Calcular hash SHA256 de archivo
 */
function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Detectar nombres de columnas en los archivos F06
 */
function detectColumnNames(header) {
  const mapping = {
    iso3: null,
    year: null,
    age: null,
    mx: null,
    qx: null,
    lx: null,
    ex: null,
  };

  for (let i = 0; i < header.length; i++) {
    const colName = (header[i] || '').toString().toLowerCase().trim();

    // Buscar columnas específicas (soporta nombres cortos y largos del XLSX/CSV)
    if ((colName.includes('iso3') || colName.includes('alpha-code')) && !mapping.iso3) {
      mapping.iso3 = i;
    } else if ((colName.includes('year') || colName === 'time') && !mapping.year) {
      mapping.year = i;
    } else if (
      (colName === 'age' || colName.includes('agegrp') || colName.includes('age (x)')) &&
      !mapping.age
    ) {
      mapping.age = i;
    } else if (
      (colName === 'mx' || colName.includes('central death rate') || colName.includes('m(x,n)')) &&
      !mapping.mx
    ) {
      mapping.mx = i;
    } else if (
      (colName === 'qx' ||
        colName.includes('probability of dying') ||
        colName.includes('q(x,n)')) &&
      !mapping.qx
    ) {
      mapping.qx = i;
    } else if (
      (colName === 'lx' || colName.includes('number of survivors') || colName.includes('l(x)')) &&
      !mapping.lx
    ) {
      mapping.lx = i;
    } else if (
      (colName === 'ex' || colName.includes('expectation of life') || colName.includes('e(x)')) &&
      !mapping.ex
    ) {
      mapping.ex = i;
    }
  }

  return mapping;
}

/**
 * Procesar archivo CSV para un sexo específico
 * (CSV pre-convertido desde XLSX usando scripts/xlsx-to-csv.py)
 */
function processCSV(filePath, sex) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📖 Procesando: ${path.basename(filePath)}`);
  console.log(`   Sexo: ${sex}`);
  console.log(`${'='.repeat(70)}`);

  console.log('   📂 Cargando CSV...');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  console.log(`   ✅ ${lines.length.toLocaleString()} líneas cargadas`);

  // Buscar fila de encabezados (buscar ISO3 o similar)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(30, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('iso3') || line.includes('alpha-code')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('No se encontró la fila de encabezados en el CSV');
  }

  // Parsear header
  const header = parseCSVLine(lines[headerRowIndex]);
  const columnMapping = detectColumnNames(header);

  console.log(`   📍 Encabezados en fila: ${headerRowIndex}`);
  console.log('   🔍 Columnas detectadas:');
  for (const [key, index] of Object.entries(columnMapping)) {
    if (index !== null) {
      console.log(`      ${key}: columna ${index} (${header[index]})`);
    } else {
      console.log(`      ${key}: ⚠️  NO ENCONTRADA`);
    }
  }

  // Verificar columnas requeridas
  const required = ['iso3', 'age', 'qx', 'lx', 'ex'];
  const missing = required.filter((col) => columnMapping[col] === null);

  if (missing.length > 0) {
    throw new Error(`Faltan columnas requeridas: ${missing.join(', ')}`);
  }

  // Procesar filas
  const dataStartRow = headerRowIndex + 1;
  console.log(
    `   ⚙️  Procesando ${(lines.length - dataStartRow).toLocaleString()} filas de datos...`
  );

  let localProcessed = 0;
  let savedForThisSex = 0;

  for (let i = dataStartRow; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = parseCSVLine(line);
    if (!row || row.length === 0) continue;

    rowsProcessed++;
    localProcessed++;

    try {
      // Extraer datos
      const iso3 = (row[columnMapping.iso3] || '').toString().trim().toUpperCase();
      const year = columnMapping.year ? parseInt(row[columnMapping.year]) : CONFIG.targetYear;
      const age = parseInt(row[columnMapping.age]);
      const mx = columnMapping.mx ? parseFloat(row[columnMapping.mx]) : 0;
      const qx = parseFloat(row[columnMapping.qx]);
      const lx = parseFloat(row[columnMapping.lx]);
      const ex = parseFloat(row[columnMapping.ex]);

      // Validaciones
      if (!iso3 || iso3.length !== 3) continue;
      if (isNaN(age) || isNaN(qx) || isNaN(lx) || isNaN(ex)) continue;
      if (age < 0 || age > 100) continue;

      // Filtrar: solo países en el mapa
      if (!CONFIG.countryMap[iso3]) continue;

      // Filtrar por año objetivo
      if (year !== CONFIG.targetYear) continue;

      countriesFound.add(iso3);

      // Crear clave
      const key = `${iso3}_${sex}`;

      if (!results[key]) {
        results[key] = {
          country: iso3,
          countryName: CONFIG.countryMap[iso3]?.en || iso3,
          sex,
          year: CONFIG.targetYear,
          source: 'UN World Population Prospects 2024',
          sourceUrl: 'https://population.un.org/wpp/',
          downloadDate: new Date().toISOString().split('T')[0],
          entries: [],
        };
        savedForThisSex++;
      }

      // Agregar entrada
      results[key].entries.push({
        age,
        qx: parseFloat(qx.toFixed(6)),
        lx: parseFloat(lx.toFixed(2)),
        ex: parseFloat(ex.toFixed(2)),
      });
    } catch (err) {
      if (errors.length < 10) {
        errors.push(`${sex} - Fila ${i + 1}: ${err.message}`);
      }
    }

    // Progreso cada 100000 filas
    if (localProcessed % 100000 === 0) {
      process.stdout.write(
        `\r      Procesadas: ${localProcessed.toLocaleString()} filas | Países: ${savedForThisSex}`
      );
    }
  }

  console.log(
    `\r      ✅ Procesadas: ${localProcessed.toLocaleString()} filas | Países: ${savedForThisSex}`
  );
}

/**
 * Parsear una línea CSV respetando comillas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Guardar resultados
 */
function saveResults() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  let savedFiles = 0;

  console.log(`\n${'='.repeat(70)}`);
  console.log('💾 Guardando archivos JSON...');
  console.log(`${'='.repeat(70)}\n`);

  for (const [key, data] of Object.entries(results)) {
    // Ordenar por edad
    data.entries.sort((a, b) => a.age - b.age);

    // Validar datos suficientes
    if (data.entries.length < 50) {
      warnings.push(`${key}: Datos insuficientes (${data.entries.length} entradas, esperado ~101)`);
      continue;
    }

    // Guardar
    const filePath = path.join(CONFIG.outputDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`   ✅ ${key}.json (${data.entries.length} edades)`);
    savedFiles++;
  }

  return savedFiles;
}

/**
 * Actualizar countries.json con los países procesados
 */
function updateCountriesJson() {
  const countriesJsonPath = 'src/lib/data/countries.json';

  // Crear array de países con datos
  const countriesWithData = Array.from(countriesFound)
    .sort()
    .map((code) => {
      const meta = CONFIG.countryMap[code] || {};
      return {
        code,
        name: meta.en || code,
        nameEs: meta.es || meta.en || code,
        region: meta.region || 'Other',
        hasData: true,
      };
    });

  fs.writeFileSync(countriesJsonPath, JSON.stringify(countriesWithData, null, 2));
  console.log(`\n   ✅ Actualizado: ${countriesJsonPath} (${countriesWithData.length} países)`);
}

/**
 * Actualizar log
 */
function updateDownloadLog(savedFiles) {
  const logContent = `# Registro de procesamiento de datos

## UN World Population Prospects 2024 - Life Tables (Single Ages)

**Última actualización**: ${new Date().toISOString().split('T')[0]}

### Archivos fuente
- **Male**: ${path.basename(CONFIG.inputFiles.male)}
- **Female**: ${path.basename(CONFIG.inputFiles.female)}
- **Formato**: XLSX - Single Age Life Tables (F06)
- **URL**: https://population.un.org/wpp/downloads
- **Año de datos**: ${CONFIG.targetYear}
- **Filas procesadas**: ${rowsProcessed.toLocaleString()}
- **Archivos generados**: ${savedFiles}
- **Países con datos**: ${countriesFound.size}

### Países procesados

${Array.from(countriesFound)
  .sort()
  .map((code) => `- **${code}**: ${CONFIG.countryMap[code]?.en || code}`)
  .join('\n')}

### Archivos generados

${Object.keys(results)
  .sort()
  .map((key) => {
    const data = results[key];
    return `- \`${key}.json\` - ${data.countryName}, ${data.sex} (${data.entries.length} edades, año ${data.year})`;
  })
  .join('\n')}

### Procesamiento
- **Script**: scripts/process-life-tables-f06.js
- **Fecha**: ${new Date().toISOString()}
- **Errores**: ${errors.length}
- **Advertencias**: ${warnings.length}

${
  errors.length > 0
    ? `\n### Errores (primeros 10)\n${errors
        .slice(0, 10)
        .map((e) => `- ${e}`)
        .join('\n')}`
    : ''
}

${
  warnings.length > 0
    ? `\n### Advertencias\n${warnings
        .slice(0, 20)
        .map((e) => `- ${e}`)
        .join('\n')}${warnings.length > 20 ? `\n- ... y ${warnings.length - 20} más` : ''}`
    : ''
}

---

## Datos incluidos por archivo

Cada archivo JSON contiene:
- **qx**: Probabilidad de muerte entre edad x y x+1
- **lx**: Número de sobrevivientes a edad x (de 100,000 nacimientos)
- **ex**: Expectativa de vida restante a edad x

## Próxima actualización

La ONU actualiza WPP cada 2 años. Verificar en:
https://population.un.org/wpp/
`;

  const dataDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.logFile, logContent);
  console.log(`   ✅ Log actualizado: ${CONFIG.logFile}`);
}

/**
 * Main
 */
async function main() {
  const startTime = Date.now();

  console.log('\n' + '='.repeat(70));
  console.log('🚀 PROCESADOR DE LIFE TABLES UN WPP-2024 (F06)');
  console.log('='.repeat(70));
  console.log(`📅 Año objetivo: ${CONFIG.targetYear}`);
  console.log(`🌍 Países en mapa: ${Object.keys(CONFIG.countryMap).length}`);
  console.log('='.repeat(70));

  // Verificar archivos
  for (const [sex, filePath] of Object.entries(CONFIG.inputFiles)) {
    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ Archivo no encontrado: ${filePath}`);
      process.exit(1);
    }
    const stats = fs.statSync(filePath);
    console.log(`   ✅ ${sex}: ${(stats.size / 1024 / 1024).toFixed(0)} MB`);
  }

  // Procesar cada archivo
  try {
    processCSV(CONFIG.inputFiles.male, 'male');
    processCSV(CONFIG.inputFiles.female, 'female');
  } catch (error) {
    console.error('\n❌ Error procesando archivos:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  // Guardar
  const savedFiles = saveResults();

  // Actualizar countries.json
  updateCountriesJson();

  // Log
  updateDownloadLog(savedFiles);

  // Resumen
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(70));
  console.log('✨ PROCESAMIENTO COMPLETADO');
  console.log('='.repeat(70));
  console.log(`⏱️  Tiempo: ${elapsed} segundos`);
  console.log(`📦 Archivos generados: ${savedFiles}`);
  console.log(`🌍 Países con datos: ${countriesFound.size}`);
  console.log(`⚠️  Advertencias: ${warnings.length}`);
  console.log(`❌ Errores: ${errors.length}`);
  console.log(`📁 Directorio: ${CONFIG.outputDir}`);
  console.log('='.repeat(70));

  if (savedFiles === 0) {
    console.error('\n❌ No se generó ningún archivo.');
    console.error('   Revisa los errores arriba.');
    process.exit(1);
  }

  console.log('\n✅ ¡Datos reales de la ONU listos!');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. npm run dev');
  console.log('   2. Prueba la calculadora con diferentes países');
  console.log('   3. Compara con los datos de muestra anteriores\n');
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
