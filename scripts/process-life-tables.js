/**
 * Script para procesar tablas de vida de UN WPP-2024
 *
 * ANTES DE EJECUTAR:
 * 1. Descargar datos de: https://population.un.org/wpp/downloads?folder=Standard+Projections&group=Mortality
 * 2. Buscar: "Life tables by age and sex - Both sexes"
 * 3. Guardar el CSV en: data/raw/WPP2024_Life_Table_Complete.csv
 *
 * EJECUCIÓN:
 * node scripts/process-life-tables.js
 *
 * SALIDA:
 * Archivos JSON en: public/data/life-tables/
 * Formato: {COUNTRY_CODE}_{sex}.json
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const crypto = require('crypto');

// Configuración
const CONFIG = {
  inputFile: 'data/raw/WPP2024_Life_Table_Complete.csv',
  outputDir: 'public/data/life-tables',
  logFile: 'data/DOWNLOAD_LOG.md',

  // Países a procesar (ampliar según necesidad)
  countries: [
    'CHL', // Chile
    'USA', // Estados Unidos
    'ESP', // España
    'MEX', // México
    'ARG', // Argentina
    'COL', // Colombia
    'GBR', // Reino Unido
    'DEU', // Alemania
    'FRA', // Francia
    'JPN', // Japón
    'BRA', // Brasil
    'PER', // Perú
    'URY', // Uruguay
    'CAN', // Canadá
    'ITA', // Italia
  ],

  // Mapeo de nombres de países (ISO3 → nombre legible)
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
  },
};

// Estado del procesamiento
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
 * Procesar una fila del CSV
 */
function processRow(row) {
  rowsProcessed++;

  // Extraer datos (ajustar nombres de columnas según CSV real de la ONU)
  const country = row.LocID || row.Location;
  const sex = row.Sex === 'Female' ? 'female' : row.Sex === 'Male' ? 'male' : null;
  const age = parseInt(row.AgeGrp || row.Age);
  const year = parseInt(row.Time || row.Year);

  // Valores de tabla de vida
  const qx = parseFloat(row.qx);
  const lx = parseFloat(row.lx);
  const ex = parseFloat(row.ex || row.e0);

  // Validaciones
  if (!country || !sex || isNaN(age) || isNaN(year)) {
    errors.push(`Row ${rowsProcessed}: Missing critical data`);
    return;
  }

  if (!CONFIG.countries.includes(country)) {
    return; // Saltar países no configurados
  }

  // Solo usar datos del año más reciente (ej. 2024)
  if (year !== 2024) {
    return;
  }

  // Crear clave única por país-sexo
  const key = `${country}_${sex}`;

  if (!results[key]) {
    results[key] = {
      country,
      countryName: CONFIG.countryNames[country] || country,
      sex,
      year,
      source: 'UN World Population Prospects 2024',
      sourceUrl: 'https://population.un.org/wpp/',
      downloadDate: new Date().toISOString().split('T')[0],
      entries: [],
    };
  }

  // Agregar entrada
  results[key].entries.push({
    age,
    qx: parseFloat(qx.toFixed(6)),
    lx: parseFloat(lx.toFixed(2)),
    ex: parseFloat(ex.toFixed(2)),
  });
}

/**
 * Guardar resultados como archivos JSON
 */
function saveResults() {
  // Crear directorio si no existe
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  let savedFiles = 0;

  for (const [key, data] of Object.entries(results)) {
    // Ordenar por edad
    data.entries.sort((a, b) => a.age - b.age);

    // Validar que haya datos suficientes
    if (data.entries.length < 10) {
      errors.push(`${key}: Insufficient data (${data.entries.length} entries)`);
      continue;
    }

    // Guardar archivo
    const filePath = path.join(CONFIG.outputDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`✅ Saved: ${filePath} (${data.entries.length} age groups)`);
    savedFiles++;
  }

  return savedFiles;
}

/**
 * Actualizar log de descargas
 */
function updateDownloadLog(fileHash, savedFiles) {
  const logContent = `# Registro de descargas de datos

## UN World Population Prospects 2024

**Última actualización**: ${new Date().toISOString().split('T')[0]}

### Archivo fuente
- **Nombre**: ${path.basename(CONFIG.inputFile)}
- **URL**: https://population.un.org/wpp/downloads?folder=Standard+Projections&group=Mortality
- **SHA256**: \`${fileHash}\`
- **Filas procesadas**: ${rowsProcessed}
- **Países exportados**: ${savedFiles}

### Archivos generados
${Object.keys(results)
  .map((key) => `- \`${key}.json\``)
  .join('\n')}

### Procesamiento
- **Script**: scripts/process-life-tables.js
- **Fecha**: ${new Date().toISOString()}
- **Errores**: ${errors.length}

${errors.length > 0 ? `\n### Errores encontrados\n${errors.map((e) => `- ${e}`).join('\n')}` : ''}

---

## Próxima actualización

La ONU actualiza WPP cada 2 años. Verificar nuevas versiones en:
https://population.un.org/wpp/

## Validación

Para validar la integridad de los datos:
\`\`\`bash
sha256sum data/raw/WPP2024_Life_Table_Complete.csv
\`\`\`

Debe coincidir con el hash registrado arriba.
`;

  // Crear directorio data si no existe
  const dataDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.logFile, logContent);
  console.log(`\n📝 Updated download log: ${CONFIG.logFile}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Processing UN WPP-2024 Life Tables...\n');

  // Verificar que existe el archivo
  if (!fs.existsSync(CONFIG.inputFile)) {
    console.error(`❌ Error: File not found: ${CONFIG.inputFile}`);
    console.error('\nPor favor descarga los datos de:');
    console.error(
      'https://population.un.org/wpp/downloads?folder=Standard+Projections&group=Mortality'
    );
    console.error(`\nY guárdalos en: ${CONFIG.inputFile}`);
    process.exit(1);
  }

  // Calcular hash del archivo
  console.log('📊 Calculating file hash...');
  const fileHash = calculateFileHash(CONFIG.inputFile);
  console.log(`   SHA256: ${fileHash.substring(0, 16)}...`);

  // Procesar CSV
  console.log('\n📖 Reading CSV file...');

  return new Promise((resolve, reject) => {
    fs.createReadStream(CONFIG.inputFile)
      .pipe(csv())
      .on('data', processRow)
      .on('end', () => {
        console.log(`\n✅ Processed ${rowsProcessed} rows`);
        console.log(
          `📦 Generated data for ${Object.keys(results).length} country-sex combinations\n`
        );

        // Guardar resultados
        console.log('💾 Saving JSON files...\n');
        const savedFiles = saveResults();

        // Actualizar log
        updateDownloadLog(fileHash, savedFiles);

        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('✨ PROCESAMIENTO COMPLETADO');
        console.log('='.repeat(60));
        console.log(`Archivos generados: ${savedFiles}`);
        console.log(`Errores: ${errors.length}`);
        console.log(`Directorio de salida: ${CONFIG.outputDir}`);
        console.log('='.repeat(60) + '\n');

        if (errors.length > 0) {
          console.warn('⚠️  Se encontraron errores. Ver data/DOWNLOAD_LOG.md para detalles.');
        }

        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// Ejecutar
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
