/**
 * Script para procesar tablas de vida de UN WPP-2024 desde archivos XLSX
 *
 * ANTES DE EJECUTAR:
 * 1. Descargar datos de: https://population.un.org/wpp/downloads?folder=Standard+Projections&group=Mortality
 * 2. Guardar el archivo .xlsx en: data/raw/
 * 3. Actualizar CONFIG.inputFile con el nombre exacto del archivo
 *
 * EJECUCIÓN:
 * npm install xlsx
 * node scripts/process-life-tables-xlsx.js
 *
 * SALIDA:
 * Archivos JSON en: public/data/life-tables/
 * Formato: {COUNTRY_CODE}_{sex}.json
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const crypto = require('crypto');

// Configuración
const CONFIG = {
  // Actualizar con el nombre exacto de tu archivo
  inputFile: 'data/raw/WPP2024_MORT_F17_1_LIFE_TABLE_ESTIMATES.xlsx',

  // O si tienes múltiples archivos:
  // inputFiles: [
  //   'data/raw/WPP2024_Life_Table_Complete.xlsx',
  //   'data/raw/WPP2024_Life_Table_Abridged.xlsx',
  // ],

  outputDir: 'public/data/life-tables',
  logFile: 'data/DOWNLOAD_LOG.md',

  // Hoja específica a leer (si sabes cuál es)
  // Si no se especifica, intentará encontrar la hoja correcta automáticamente
  sheetName: null, // ej: 'Estimates' o 'Medium variant'

  // Países a procesar
  countries: [
    'CHL',
    'USA',
    'ESP',
    'MEX',
    'ARG',
    'COL',
    'GBR',
    'DEU',
    'FRA',
    'JPN',
    'BRA',
    'PER',
    'URY',
    'CAN',
    'ITA',
    'PRT',
    'NLD',
    'SWE',
    'NOR',
    'DNK',
    'AUS',
    'NZL',
    'KOR',
    'CHN',
  ],

  countryNames: {
    CHL: 'Chile',
    USA: 'United States',
    ESP: 'Spain',
    MEX: 'Mexico',
    ARG: 'Argentina',
    COL: 'Colombia',
    GBR: 'United Kingdom',
    DEU: 'Germany',
    FRA: 'France',
    JPN: 'Japan',
    BRA: 'Brazil',
    PER: 'Peru',
    URY: 'Uruguay',
    CAN: 'Canada',
    ITA: 'Italy',
    PRT: 'Portugal',
    NLD: 'Netherlands',
    SWE: 'Sweden',
    NOR: 'Norway',
    DNK: 'Denmark',
    AUS: 'Australia',
    NZL: 'New Zealand',
    KOR: 'South Korea',
    CHN: 'China',
  },
};

const results = {};
let rowsProcessed = 0;
const errors = [];

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
 * Detectar la hoja correcta automáticamente
 */
function findCorrectSheet(workbook) {
  const sheetNames = workbook.SheetNames;

  console.log('\n📋 Hojas disponibles en el archivo:');
  sheetNames.forEach((name, i) => {
    console.log(`   ${i + 1}. ${name}`);
  });

  // Prioridad de búsqueda
  const priorities = [
    'Estimates',
    'Medium variant',
    'ESTIMATES',
    'Life Table',
    'Data',
    sheetNames[0], // Primera hoja como fallback
  ];

  for (const priority of priorities) {
    const found = sheetNames.find((name) => name.toLowerCase().includes(priority.toLowerCase()));
    if (found) {
      console.log(`\n✅ Usando hoja: "${found}"`);
      return found;
    }
  }

  // Si no encuentra, usar la primera
  console.log(`\n⚠️  Usando primera hoja: "${sheetNames[0]}"`);
  return sheetNames[0];
}

/**
 * Detectar nombres de columnas (pueden variar)
 */
function detectColumnNames(header) {
  const mapping = {
    country: null,
    sex: null,
    age: null,
    year: null,
    qx: null,
    lx: null,
    ex: null,
  };

  // Buscar columnas por patrones comunes
  const patterns = {
    country: ['location', 'loc', 'country', 'iso', 'locid', 'region'],
    sex: ['sex', 'gender'],
    age: ['age', 'agegrp', 'age group', 'agegroup'],
    year: ['year', 'time', 'period'],
    qx: ['qx', 'q(x)', 'mx', 'death probability'],
    lx: ['lx', 'l(x)', 'survivors'],
    ex: ['ex', 'e(x)', 'e0', 'life expectancy'],
  };

  for (let i = 0; i < header.length; i++) {
    const colName = (header[i] || '').toString().toLowerCase().trim();

    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.some((p) => colName.includes(p))) {
        if (!mapping[key]) {
          // Tomar la primera coincidencia
          mapping[key] = i;
        }
      }
    }
  }

  console.log('\n🔍 Columnas detectadas:');
  for (const [key, index] of Object.entries(mapping)) {
    if (index !== null) {
      console.log(`   ${key}: columna ${index} (${header[index]})`);
    } else {
      console.log(`   ${key}: ⚠️  NO ENCONTRADA`);
    }
  }

  return mapping;
}

/**
 * Procesar archivo XLSX
 */
function processXLSX(filePath) {
  console.log(`\n📖 Leyendo archivo: ${filePath}`);

  // Leer archivo Excel
  const workbook = XLSX.readFile(filePath);

  // Encontrar hoja correcta
  const sheetName = CONFIG.sheetName || findCorrectSheet(workbook);
  const worksheet = workbook.Sheets[sheetName];

  // Convertir a JSON (sin header para detectar automáticamente)
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rawData.length === 0) {
    throw new Error('La hoja está vacía');
  }

  // Primera fila como header
  const header = rawData[0];
  const columnMapping = detectColumnNames(header);

  // Verificar que tenemos las columnas mínimas necesarias
  const required = ['country', 'age', 'ex'];
  const missing = required.filter((col) => columnMapping[col] === null);

  if (missing.length > 0) {
    console.error(`\n❌ Faltan columnas requeridas: ${missing.join(', ')}`);
    console.log('\n💡 Revisa el archivo manualmente y actualiza CONFIG.sheetName si es necesario');
    process.exit(1);
  }

  // Procesar filas (empezar desde la segunda fila)
  console.log(`\n⚙️  Procesando ${rawData.length - 1} filas...`);

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    rowsProcessed++;

    try {
      // Extraer datos usando el mapeo detectado
      const country = row[columnMapping.country]?.toString().trim();
      const sexRaw = row[columnMapping.sex]?.toString().toLowerCase();
      const age = parseInt(row[columnMapping.age]);
      const year = columnMapping.year ? parseInt(row[columnMapping.year]) : 2024;

      const qx = columnMapping.qx ? parseFloat(row[columnMapping.qx]) : 0;
      const lx = columnMapping.lx ? parseFloat(row[columnMapping.lx]) : 100000;
      const ex = parseFloat(row[columnMapping.ex]);

      // Determinar sexo
      let sex = null;
      if (sexRaw) {
        if (sexRaw.includes('female') || sexRaw.includes('f')) sex = 'female';
        else if (sexRaw.includes('male') || sexRaw.includes('m')) sex = 'male';
      }

      // Validaciones
      if (!country || !sex || isNaN(age) || isNaN(ex)) {
        continue; // Saltar fila inválida silenciosamente
      }

      // Filtrar por países configurados
      if (!CONFIG.countries.includes(country)) {
        continue;
      }

      // Solo año más reciente (o si no hay columna year, tomar todo)
      if (columnMapping.year && year !== 2024 && year !== 2023) {
        continue;
      }

      // Crear clave
      const key = `${country}_${sex}`;

      if (!results[key]) {
        results[key] = {
          country,
          countryName: CONFIG.countryNames[country] || country,
          sex,
          year: year || 2024,
          source: 'UN World Population Prospects 2024',
          sourceUrl: 'https://population.un.org/wpp/',
          downloadDate: new Date().toISOString().split('T')[0],
          entries: [],
        };
      }

      // Agregar entrada
      results[key].entries.push({
        age,
        qx: parseFloat((qx || 0).toFixed(6)),
        lx: parseFloat((lx || 100000).toFixed(2)),
        ex: parseFloat(ex.toFixed(2)),
      });
    } catch (err) {
      errors.push(`Fila ${i + 1}: ${err.message}`);
    }

    // Progreso cada 1000 filas
    if (rowsProcessed % 1000 === 0) {
      process.stdout.write(`\r   Procesadas: ${rowsProcessed} filas`);
    }
  }

  console.log(`\r   Procesadas: ${rowsProcessed} filas ✅`);
}

/**
 * Guardar resultados
 */
function saveResults() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  let savedFiles = 0;

  console.log('\n💾 Guardando archivos JSON...\n');

  for (const [key, data] of Object.entries(results)) {
    // Ordenar por edad
    data.entries.sort((a, b) => a.age - b.age);

    // Validar datos suficientes
    if (data.entries.length < 10) {
      errors.push(`${key}: Datos insuficientes (${data.entries.length} entradas)`);
      continue;
    }

    // Guardar
    const filePath = path.join(CONFIG.outputDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`   ✅ ${key}.json (${data.entries.length} grupos de edad)`);
    savedFiles++;
  }

  return savedFiles;
}

/**
 * Actualizar log
 */
function updateDownloadLog(fileHash, savedFiles) {
  const logContent = `# Registro de descargas de datos

## UN World Population Prospects 2024

**Última actualización**: ${new Date().toISOString().split('T')[0]}

### Archivo fuente
- **Nombre**: ${path.basename(CONFIG.inputFile)}
- **Formato**: XLSX (Excel con múltiples hojas)
- **URL**: https://population.un.org/wpp/downloads?folder=Standard+Projections&group=Mortality
- **SHA256**: \`${fileHash}\`
- **Filas procesadas**: ${rowsProcessed}
- **Países exportados**: ${savedFiles}

### Archivos generados

${Object.keys(results)
  .sort()
  .map((key) => {
    const data = results[key];
    return `- \`${key}.json\` - ${data.countryName} (${data.entries.length} edades)`;
  })
  .join('\n')}

### Procesamiento
- **Script**: scripts/process-life-tables-xlsx.js
- **Fecha**: ${new Date().toISOString()}
- **Errores**: ${errors.length}

${
  errors.length > 0
    ? `\n### Advertencias\n${errors
        .slice(0, 10)
        .map((e) => `- ${e}`)
        .join('\n')}${errors.length > 10 ? `\n- ... y ${errors.length - 10} más` : ''}`
    : ''
}

---

## Validación

Para validar integridad:
\`\`\`bash
shasum -a 256 "${CONFIG.inputFile}"
\`\`\`

Debe coincidir con: \`${fileHash}\`

## Próxima actualización

La ONU actualiza WPP cada 2 años. Verificar en:
https://population.un.org/wpp/
`;

  const dataDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.logFile, logContent);
  console.log(`\n📝 Log actualizado: ${CONFIG.logFile}`);
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Procesando tablas de vida UN WPP-2024 (formato XLSX)');
  console.log('='.repeat(60));

  // Verificar archivo
  if (!fs.existsSync(CONFIG.inputFile)) {
    console.error(`\n❌ Archivo no encontrado: ${CONFIG.inputFile}`);
    console.error('\n💡 Descarga el archivo de:');
    console.error('   https://population.un.org/wpp/downloads');
    console.error(`\n   Y guárdalo como: ${CONFIG.inputFile}`);
    console.error('\n   O actualiza CONFIG.inputFile con el nombre correcto');
    process.exit(1);
  }

  // Calcular hash
  console.log('\n📊 Calculando hash del archivo...');
  const fileHash = calculateFileHash(CONFIG.inputFile);
  console.log(`   SHA256: ${fileHash.substring(0, 32)}...`);

  // Procesar
  try {
    processXLSX(CONFIG.inputFile);
  } catch (error) {
    console.error('\n❌ Error procesando archivo:', error.message);
    process.exit(1);
  }

  // Guardar
  const savedFiles = saveResults();

  // Log
  updateDownloadLog(fileHash, savedFiles);

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('✨ PROCESAMIENTO COMPLETADO');
  console.log('='.repeat(60));
  console.log(`📦 Archivos generados: ${savedFiles}`);
  console.log(`⚠️  Advertencias: ${errors.length}`);
  console.log(`📁 Directorio: ${CONFIG.outputDir}`);
  console.log('='.repeat(60));

  if (savedFiles === 0) {
    console.error('\n❌ No se generó ningún archivo.');
    console.error('   Revisa que el archivo XLSX tenga el formato correcto.');
    process.exit(1);
  }

  console.log('\n✅ ¡Listo! Ahora puedes ejecutar:');
  console.log('   npm run dev\n');
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
