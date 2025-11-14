/**
 * Script para procesar archivos de expectativa de vida por edad de UN WPP-2024
 *
 * Este script procesa los archivos F05 (Life Expectancy by Age) que están disponibles.
 * Estos archivos contienen datos de esperanza de vida (ex) por edad, país y año.
 *
 * ARCHIVOS NECESARIOS (ya los tienes en src/lib/data/raw/):
 * - WPP2024_MORT_F05_2_LIFE_EXPECTANCY_BY_AGE_MALE.xlsx
 * - WPP2024_MORT_F05_3_LIFE_EXPECTANCY_BY_AGE_FEMALE.xlsx
 *
 * EJECUCIÓN:
 * npm run process-life-expectancy
 *
 * SALIDA:
 * Archivos JSON en: public/data/life-tables/
 * Formato: {COUNTRY_CODE}_{sex}.json
 */

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')
const crypto = require('crypto')

// Configuración
const CONFIG = {
  inputFiles: {
    male: 'src/lib/data/raw/WPP2024_MORT_F05_2_LIFE_EXPECTANCY_BY_AGE_MALE.xlsx',
    female: 'src/lib/data/raw/WPP2024_MORT_F05_3_LIFE_EXPECTANCY_BY_AGE_FEMALE.xlsx',
  },

  outputDir: 'public/data/life-tables',
  logFile: 'data/DOWNLOAD_LOG.md',

  // Año a filtrar (tomar el más reciente)
  targetYears: [2024, 2023, 2022],

  // Países a procesar (ISO3 codes)
  countries: [
    'CHL', 'USA', 'ESP', 'MEX', 'ARG', 'COL',
    'GBR', 'DEU', 'FRA', 'JPN', 'BRA', 'PER',
    'URY', 'CAN', 'ITA', 'PRT', 'NLD', 'SWE',
    'NOR', 'DNK', 'AUS', 'NZL', 'KOR', 'CHN',
    'IND', 'RUS', 'ZAF', 'EGY', 'NGA', 'KEN',
    'ECU', 'BOL', 'VEN', 'CRI', 'PAN', 'GTM',
    'CUB', 'DOM', 'HND', 'PRY', 'SLV', 'NIC',
    'BEL', 'AUT', 'CHE', 'GRC', 'POL', 'CZE',
    'HUN', 'ROU', 'UKR', 'TUR', 'ISR', 'SAU',
    'IRN', 'IRQ', 'PAK', 'BGD', 'VNM', 'THA',
    'MYS', 'SGP', 'PHL', 'IDN'
  ],

  countryNames: {
    'CHL': 'Chile', 'USA': 'United States', 'ESP': 'Spain',
    'MEX': 'Mexico', 'ARG': 'Argentina', 'COL': 'Colombia',
    'GBR': 'United Kingdom', 'DEU': 'Germany', 'FRA': 'France',
    'JPN': 'Japan', 'BRA': 'Brazil', 'PER': 'Peru',
    'URY': 'Uruguay', 'CAN': 'Canada', 'ITA': 'Italy',
    'PRT': 'Portugal', 'NLD': 'Netherlands', 'SWE': 'Sweden',
    'NOR': 'Norway', 'DNK': 'Denmark', 'AUS': 'Australia',
    'NZL': 'New Zealand', 'KOR': 'South Korea', 'CHN': 'China',
    'IND': 'India', 'RUS': 'Russia', 'ZAF': 'South Africa',
    'EGY': 'Egypt', 'NGA': 'Nigeria', 'KEN': 'Kenya',
    'ECU': 'Ecuador', 'BOL': 'Bolivia', 'VEN': 'Venezuela',
    'CRI': 'Costa Rica', 'PAN': 'Panama', 'GTM': 'Guatemala',
    'CUB': 'Cuba', 'DOM': 'Dominican Republic', 'HND': 'Honduras',
    'PRY': 'Paraguay', 'SLV': 'El Salvador', 'NIC': 'Nicaragua',
    'BEL': 'Belgium', 'AUT': 'Austria', 'CHE': 'Switzerland',
    'GRC': 'Greece', 'POL': 'Poland', 'CZE': 'Czech Republic',
    'HUN': 'Hungary', 'ROU': 'Romania', 'UKR': 'Ukraine',
    'TUR': 'Turkey', 'ISR': 'Israel', 'SAU': 'Saudi Arabia',
    'IRN': 'Iran', 'IRQ': 'Iraq', 'PAK': 'Pakistan',
    'BGD': 'Bangladesh', 'VNM': 'Vietnam', 'THA': 'Thailand',
    'MYS': 'Malaysia', 'SGP': 'Singapore', 'PHL': 'Philippines',
    'IDN': 'Indonesia'
  }
}

const results = {}
let rowsProcessed = 0
let errors = []
let warnings = []

/**
 * Calcular hash SHA256 de archivo
 */
function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath)
  const hashSum = crypto.createHash('sha256')
  hashSum.update(fileBuffer)
  return hashSum.digest('hex')
}

/**
 * Detectar la hoja correcta automáticamente
 */
function findCorrectSheet(workbook) {
  const sheetNames = workbook.SheetNames

  console.log('   📋 Hojas disponibles:')
  sheetNames.forEach((name, i) => {
    console.log(`      ${i + 1}. ${name}`)
  })

  // Prioridad de búsqueda para archivos F05
  const priorities = [
    'Estimates',
    'Medium variant',
    'ESTIMATES',
    'Data',
    sheetNames[0] // Primera hoja como fallback
  ]

  for (const priority of priorities) {
    const found = sheetNames.find(name =>
      name.toLowerCase().includes(priority.toLowerCase())
    )
    if (found) {
      console.log(`   ✅ Usando hoja: "${found}"`)
      return found
    }
  }

  // Si no encuentra, usar la primera
  console.log(`   ⚠️  Usando primera hoja: "${sheetNames[0]}"`)
  return sheetNames[0]
}

/**
 * Detectar nombres de columnas
 */
function detectColumnNames(header) {
  const mapping = {
    country: null,
    age: null,
    year: null,
    ex: null
  }

  // Buscar columnas por patrones comunes
  const patterns = {
    country: ['location', 'loc', 'country', 'iso', 'locid', 'region', 'iso3'],
    age: ['age', 'agegrp', 'age group', 'agegroup', 'agegrpstart'],
    year: ['year', 'time', 'period', 'midperiod'],
    ex: ['ex', 'e(x)', 'e0', 'life expectancy', 'lifeexpectancy']
  }

  for (let i = 0; i < header.length; i++) {
    const colName = (header[i] || '').toString().toLowerCase().trim()

    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.some(p => colName.includes(p))) {
        if (!mapping[key]) { // Tomar la primera coincidencia
          mapping[key] = i
        }
      }
    }
  }

  console.log('   🔍 Columnas detectadas:')
  for (const [key, index] of Object.entries(mapping)) {
    if (index !== null) {
      console.log(`      ${key}: columna ${index} (${header[index]})`)
    } else {
      console.log(`      ${key}: ⚠️  NO ENCONTRADA`)
    }
  }

  return mapping
}

/**
 * Procesar archivo XLSX para un sexo específico
 */
function processXLSX(filePath, sex) {
  console.log(`\n📖 Procesando: ${path.basename(filePath)}`)
  console.log(`   Sexo: ${sex}`)

  // Leer archivo Excel
  const workbook = XLSX.readFile(filePath)

  // Encontrar hoja correcta
  const sheetName = findCorrectSheet(workbook)
  const worksheet = workbook.Sheets[sheetName]

  // Convertir a JSON
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

  if (rawData.length === 0) {
    throw new Error('La hoja está vacía')
  }

  // Los archivos F05 de la ONU tienen metadata en las primeras filas
  // La fila 16 (índice 16) tiene los encabezados
  // Los datos comienzan en la fila 17 (índice 17)
  let headerRowIndex = -1
  for (let i = 0; i < Math.min(30, rawData.length); i++) {
    const row = rawData[i]
    if (row && row.length > 5) {
      const firstCols = row.slice(0, 10).map(c => (c || '').toString().toLowerCase())
      if (firstCols.some(c => c.includes('location') || c.includes('iso3') || c.includes('year'))) {
        headerRowIndex = i
        break
      }
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('No se encontró la fila de encabezados')
  }

  console.log(`   📍 Fila de encabezados encontrada: ${headerRowIndex}`)

  const header = rawData[headerRowIndex]
  const columnMapping = detectColumnNames(header)

  // Verificar columnas requeridas
  const required = ['country', 'age', 'ex']
  const missing = required.filter(col => columnMapping[col] === null)

  if (missing.length > 0) {
    throw new Error(`Faltan columnas requeridas: ${missing.join(', ')}`)
  }

  // Procesar filas (empezar después del header)
  const dataStartRow = headerRowIndex + 1
  console.log(`   ⚙️  Procesando ${rawData.length - dataStartRow} filas...`)

  let localProcessed = 0

  for (let i = dataStartRow; i < rawData.length; i++) {
    const row = rawData[i]
    rowsProcessed++
    localProcessed++

    try {
      // Extraer datos
      const countryRaw = row[columnMapping.country]?.toString().trim()
      const age = parseInt(row[columnMapping.age])
      const year = columnMapping.year ? parseInt(row[columnMapping.year]) : 2024
      const ex = parseFloat(row[columnMapping.ex])

      // Validaciones básicas
      if (!countryRaw || isNaN(age) || isNaN(ex)) {
        continue
      }

      // Normalizar código de país (algunos archivos usan diferentes formatos)
      let country = countryRaw.toUpperCase()

      // Si el código es numérico (LocID), necesitamos mapear a ISO3
      // Por ahora, solo procesar si ya es ISO3
      if (country.length !== 3) {
        continue
      }

      // Filtrar por países configurados
      if (!CONFIG.countries.includes(country)) {
        continue
      }

      // Solo año más reciente
      if (!CONFIG.targetYears.includes(year)) {
        continue
      }

      // Crear clave
      const key = `${country}_${sex}`

      if (!results[key]) {
        results[key] = {
          country,
          countryName: CONFIG.countryNames[country] || country,
          sex,
          year: year,
          source: 'UN World Population Prospects 2024',
          sourceUrl: 'https://population.un.org/wpp/',
          downloadDate: new Date().toISOString().split('T')[0],
          entries: []
        }
      }

      // Agregar entrada
      results[key].entries.push({
        age,
        qx: 0, // No disponible en estos archivos
        lx: 0, // No disponible en estos archivos
        ex: parseFloat(ex.toFixed(2))
      })

    } catch (err) {
      errors.push(`${sex} - Fila ${i + 1}: ${err.message}`)
    }

    // Progreso cada 5000 filas
    if (localProcessed % 5000 === 0) {
      process.stdout.write(`\r      Procesadas: ${localProcessed} filas`)
    }
  }

  console.log(`\r      Procesadas: ${localProcessed} filas ✅`)
}

/**
 * Calcular qx y lx aproximados usando ex
 * Nota: Esto es una aproximación. Los datos reales de tablas de vida completas
 * incluyen qx y lx directamente.
 */
function estimateQxLx(entries) {
  const initialPopulation = 100000

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const nextEntry = entries[i + 1]

    // Estimar qx usando la diferencia en expectativa de vida
    if (nextEntry) {
      // Aproximación: qx basado en el cambio de ex
      const exDiff = entry.ex - nextEntry.ex
      entry.qx = Math.max(0, Math.min(1, 1 - (nextEntry.ex / entry.ex)))
    } else {
      entry.qx = 1.0 // Última edad
    }

    // Calcular lx (sobrevivientes)
    if (i === 0) {
      entry.lx = initialPopulation
    } else {
      const prevEntry = entries[i - 1]
      entry.lx = prevEntry.lx * (1 - prevEntry.qx)
    }
  }

  return entries
}

/**
 * Guardar resultados
 */
function saveResults() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })
  }

  let savedFiles = 0

  console.log('\n💾 Guardando archivos JSON...\n')

  for (const [key, data] of Object.entries(results)) {
    // Ordenar por edad
    data.entries.sort((a, b) => a.age - b.age)

    // Validar datos suficientes
    if (data.entries.length < 10) {
      warnings.push(`${key}: Datos insuficientes (${data.entries.length} entradas)`)
      continue
    }

    // Estimar qx y lx
    data.entries = estimateQxLx(data.entries)

    // Guardar
    const filePath = path.join(CONFIG.outputDir, `${key}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    console.log(`   ✅ ${key}.json (${data.entries.length} grupos de edad, año ${data.year})`)
    savedFiles++
  }

  return savedFiles
}

/**
 * Actualizar log
 */
function updateDownloadLog(savedFiles) {
  const logContent = `# Registro de procesamiento de datos

## UN World Population Prospects 2024 - Life Expectancy by Age

**Última actualización**: ${new Date().toISOString().split('T')[0]}

### Archivos fuente
- **Archivo male**: ${path.basename(CONFIG.inputFiles.male)}
- **Archivo female**: ${path.basename(CONFIG.inputFiles.female)}
- **Formato**: XLSX (Excel)
- **URL**: https://population.un.org/wpp/downloads?folder=Standard+Projections&group=Mortality
- **Filas procesadas**: ${rowsProcessed}
- **Archivos generados**: ${savedFiles}

### Datos generados

${Object.keys(results).sort().map(key => {
  const data = results[key]
  return `- \`${key}.json\` - ${data.countryName} (${data.entries.length} edades, año ${data.year})`
}).join('\n')}

### Procesamiento
- **Script**: scripts/process-life-expectancy-xlsx.js
- **Fecha**: ${new Date().toISOString()}
- **Errores**: ${errors.length}
- **Advertencias**: ${warnings.length}

${errors.length > 0 ? `\n### Errores\n${errors.slice(0, 10).map(e => `- ${e}`).join('\n')}${errors.length > 10 ? `\n- ... y ${errors.length - 10} más` : ''}` : ''}

${warnings.length > 0 ? `\n### Advertencias\n${warnings.slice(0, 10).map(e => `- ${e}`).join('\n')}${warnings.length > 10 ? `\n- ... y ${warnings.length - 10} más` : ''}` : ''}

---

## Notas importantes

**Valores estimados**: Los valores de \`qx\` (probabilidad de muerte) y \`lx\` (sobrevivientes) son estimaciones
calculadas a partir de \`ex\` (expectativa de vida). Para datos más precisos, se recomienda usar los archivos
de Life Tables completas (F17) cuando estén disponibles.

**Años disponibles**: Se procesaron datos del año más reciente disponible en los archivos (2024, 2023 o 2022).

## Próxima actualización

La ONU actualiza WPP cada 2 años. Verificar en:
https://population.un.org/wpp/
`

  const dataDir = path.dirname(CONFIG.logFile)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  fs.writeFileSync(CONFIG.logFile, logContent)
  console.log(`\n📝 Log actualizado: ${CONFIG.logFile}`)
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Procesando datos de expectativa de vida UN WPP-2024')
  console.log('='.repeat(70))

  // Verificar archivos
  for (const [sex, filePath] of Object.entries(CONFIG.inputFiles)) {
    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ Archivo no encontrado: ${filePath}`)
      console.error(`\n💡 Verifica que el archivo esté en la ubicación correcta`)
      process.exit(1)
    }
  }

  // Procesar cada archivo
  try {
    processXLSX(CONFIG.inputFiles.male, 'male')
    processXLSX(CONFIG.inputFiles.female, 'female')
  } catch (error) {
    console.error('\n❌ Error procesando archivos:', error.message)
    process.exit(1)
  }

  // Guardar
  const savedFiles = saveResults()

  // Log
  updateDownloadLog(savedFiles)

  // Resumen
  console.log('\n' + '='.repeat(70))
  console.log('✨ PROCESAMIENTO COMPLETADO')
  console.log('='.repeat(70))
  console.log(`📦 Archivos generados: ${savedFiles}`)
  console.log(`⚠️  Advertencias: ${warnings.length}`)
  console.log(`❌ Errores: ${errors.length}`)
  console.log(`📁 Directorio: ${CONFIG.outputDir}`)
  console.log('='.repeat(70))

  if (savedFiles === 0) {
    console.error('\n❌ No se generó ningún archivo.')
    console.error('   Revisa los archivos XLSX y verifica que tengan el formato correcto.')
    console.error('   Consulta el log de errores arriba.')
    process.exit(1)
  }

  console.log('\n✅ ¡Listo! Ahora puedes ejecutar:')
  console.log('   npm run dev\n')
}

main().catch(error => {
  console.error('Error fatal:', error)
  process.exit(1)
})