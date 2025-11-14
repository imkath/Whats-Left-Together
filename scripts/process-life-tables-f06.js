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

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')
const crypto = require('crypto')

// Configuración
const CONFIG = {
  inputFiles: {
    male: 'src/lib/data/raw/WPP2024_MORT_F06_2_SINGLE_AGE_LIFE_TABLE_ESTIMATES_MALE.xlsx',
    female: 'src/lib/data/raw/WPP2024_MORT_F06_3_SINGLE_AGE_LIFE_TABLE_ESTIMATES_FEMALE.xlsx',
  },

  outputDir: 'public/data/life-tables',
  logFile: 'data/DOWNLOAD_LOG.md',

  // Usar datos de "Estimates" (históricos) del año más reciente
  sheetName: 'Estimates',
  targetYear: 2023, // Los Estimates suelen llegar hasta 2023

  // Países a exportar (códigos ISO3)
  // OPTIMIZADO: Solo países principales para procesamiento rápido
  // Puedes agregar más después
  countries: [
    // América Latina (principales)
    'CHL', 'ARG', 'BRA', 'MEX', 'COL', 'PER', 'URY',
    // Norte América
    'USA', 'CAN',
    // Europa (principales)
    'ESP', 'GBR', 'DEU', 'FRA', 'ITA', 'PRT',
    // Asia (principales)
    'JPN', 'CHN', 'IND', 'KOR',
    // Oceanía
    'AUS', 'NZL'
  ],

  countryNames: {
    // América Latina
    'CHL': 'Chile', 'ARG': 'Argentina', 'BRA': 'Brazil', 'MEX': 'Mexico',
    'COL': 'Colombia', 'PER': 'Peru', 'VEN': 'Venezuela', 'ECU': 'Ecuador',
    'BOL': 'Bolivia', 'URY': 'Uruguay', 'PRY': 'Paraguay', 'CRI': 'Costa Rica',
    'PAN': 'Panama', 'GTM': 'Guatemala', 'CUB': 'Cuba', 'DOM': 'Dominican Republic',
    'HND': 'Honduras', 'SLV': 'El Salvador', 'NIC': 'Nicaragua',
    // Norte América
    'USA': 'United States', 'CAN': 'Canada',
    // Europa
    'ESP': 'Spain', 'GBR': 'United Kingdom', 'DEU': 'Germany', 'FRA': 'France',
    'ITA': 'Italy', 'PRT': 'Portugal', 'NLD': 'Netherlands', 'BEL': 'Belgium',
    'AUT': 'Austria', 'CHE': 'Switzerland', 'GRC': 'Greece', 'SWE': 'Sweden',
    'NOR': 'Norway', 'DNK': 'Denmark', 'POL': 'Poland', 'CZE': 'Czech Republic',
    'HUN': 'Hungary', 'ROU': 'Romania', 'UKR': 'Ukraine', 'IRL': 'Ireland',
    'FIN': 'Finland', 'SVK': 'Slovakia', 'BGR': 'Bulgaria', 'HRV': 'Croatia',
    'LTU': 'Lithuania', 'SVN': 'Slovenia', 'LVA': 'Latvia', 'EST': 'Estonia',
    // Asia
    'JPN': 'Japan', 'CHN': 'China', 'IND': 'India', 'KOR': 'South Korea',
    'IDN': 'Indonesia', 'THA': 'Thailand', 'VNM': 'Vietnam', 'PHL': 'Philippines',
    'MYS': 'Malaysia', 'SGP': 'Singapore', 'PAK': 'Pakistan', 'BGD': 'Bangladesh',
    'IRN': 'Iran', 'TUR': 'Turkey', 'IRQ': 'Iraq', 'SAU': 'Saudi Arabia',
    'ISR': 'Israel', 'KAZ': 'Kazakhstan', 'UZB': 'Uzbekistan',
    // Oceanía
    'AUS': 'Australia', 'NZL': 'New Zealand',
    // África
    'ZAF': 'South Africa', 'EGY': 'Egypt', 'NGA': 'Nigeria', 'KEN': 'Kenya',
    'ETH': 'Ethiopia', 'TZA': 'Tanzania', 'UGA': 'Uganda', 'DZA': 'Algeria',
    'MAR': 'Morocco', 'GHA': 'Ghana',
    // Otros
    'RUS': 'Russia'
  }
}

const results = {}
let rowsProcessed = 0
let countriesFound = new Set()
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
    ex: null
  }

  for (let i = 0; i < header.length; i++) {
    const colName = (header[i] || '').toString().toLowerCase().trim()

    // Buscar columnas específicas
    if (colName.includes('iso3') && !mapping.iso3) {
      mapping.iso3 = i
    } else if ((colName.includes('year') || colName === 'time') && !mapping.year) {
      mapping.year = i
    } else if ((colName === 'age' || colName.includes('agegrp')) && !mapping.age) {
      mapping.age = i
    } else if (colName === 'mx' && !mapping.mx) {
      mapping.mx = i
    } else if (colName === 'qx' && !mapping.qx) {
      mapping.qx = i
    } else if (colName === 'lx' && !mapping.lx) {
      mapping.lx = i
    } else if (colName === 'ex' && !mapping.ex) {
      mapping.ex = i
    }
  }

  return mapping
}

/**
 * Procesar archivo XLSX para un sexo específico
 */
function processXLSX(filePath, sex) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`📖 Procesando: ${path.basename(filePath)}`)
  console.log(`   Sexo: ${sex}`)
  console.log(`${'='.repeat(70)}`)

  // Leer archivo Excel con opciones optimizadas para archivos grandes
  console.log('   📂 Cargando archivo Excel (puede tomar 1-3 minutos)...')
  const workbook = XLSX.readFile(filePath, {
    cellDates: false,
    cellNF: false,
    cellStyles: false,
    sheetStubs: false,
    dense: true // Usar formato denso para reducir uso de memoria
  })

  console.log(`   ✅ Archivo cargado`)
  console.log(`   📋 Hojas disponibles: ${workbook.SheetNames.join(', ')}`)

  const worksheet = workbook.Sheets[CONFIG.sheetName]
  if (!worksheet) {
    throw new Error(`Hoja "${CONFIG.sheetName}" no encontrada`)
  }

  // Convertir a JSON (esto también puede tomar tiempo)
  console.log('   🔄 Convirtiendo a JSON...')
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  console.log(`   ✅ ${rawData.length.toLocaleString()} filas cargadas`)

  // Buscar fila de encabezados
  let headerRowIndex = -1
  for (let i = 0; i < Math.min(30, rawData.length); i++) {
    const row = rawData[i]
    if (row && row.length > 5) {
      const firstCols = row.slice(0, 15).map(c => (c || '').toString().toLowerCase())
      if (firstCols.some(c => c.includes('iso3') || (c.includes('age') && c.includes('qx')))) {
        headerRowIndex = i
        break
      }
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('No se encontró la fila de encabezados')
  }

  console.log(`   📍 Encabezados en fila: ${headerRowIndex}`)

  const header = rawData[headerRowIndex]
  const columnMapping = detectColumnNames(header)

  console.log('   🔍 Columnas detectadas:')
  for (const [key, index] of Object.entries(columnMapping)) {
    if (index !== null) {
      console.log(`      ${key}: columna ${index} (${header[index]})`)
    } else {
      console.log(`      ${key}: ⚠️  NO ENCONTRADA`)
    }
  }

  // Verificar columnas requeridas
  const required = ['iso3', 'age', 'qx', 'lx', 'ex']
  const missing = required.filter(col => columnMapping[col] === null)

  if (missing.length > 0) {
    throw new Error(`Faltan columnas requeridas: ${missing.join(', ')}`)
  }

  // Procesar filas
  const dataStartRow = headerRowIndex + 1
  console.log(`   ⚙️  Procesando ${(rawData.length - dataStartRow).toLocaleString()} filas de datos...`)

  let localProcessed = 0
  let savedForThisSex = 0

  for (let i = dataStartRow; i < rawData.length; i++) {
    const row = rawData[i]

    if (!row || row.length === 0) continue

    rowsProcessed++
    localProcessed++

    try {
      // Extraer datos
      const iso3 = row[columnMapping.iso3]?.toString().trim().toUpperCase()
      const year = columnMapping.year ? parseInt(row[columnMapping.year]) : CONFIG.targetYear
      const age = parseInt(row[columnMapping.age])
      const mx = columnMapping.mx ? parseFloat(row[columnMapping.mx]) : 0
      const qx = parseFloat(row[columnMapping.qx])
      const lx = parseFloat(row[columnMapping.lx])
      const ex = parseFloat(row[columnMapping.ex])

      // Validaciones
      if (!iso3 || iso3.length !== 3) continue
      if (isNaN(age) || isNaN(qx) || isNaN(lx) || isNaN(ex)) continue
      if (age < 0 || age > 100) continue

      // Filtrar por países configurados
      if (!CONFIG.countries.includes(iso3)) continue

      // Filtrar por año objetivo
      if (year !== CONFIG.targetYear) continue

      countriesFound.add(iso3)

      // Crear clave
      const key = `${iso3}_${sex}`

      if (!results[key]) {
        results[key] = {
          country: iso3,
          countryName: CONFIG.countryNames[iso3] || iso3,
          sex,
          year: CONFIG.targetYear,
          source: 'UN World Population Prospects 2024',
          sourceUrl: 'https://population.un.org/wpp/',
          downloadDate: new Date().toISOString().split('T')[0],
          entries: []
        }
        savedForThisSex++
      }

      // Agregar entrada
      results[key].entries.push({
        age,
        qx: parseFloat(qx.toFixed(6)),
        lx: parseFloat(lx.toFixed(2)),
        ex: parseFloat(ex.toFixed(2))
      })

    } catch (err) {
      if (errors.length < 10) { // Limitar errores guardados
        errors.push(`${sex} - Fila ${i + 1}: ${err.message}`)
      }
    }

    // Progreso cada 10000 filas
    if (localProcessed % 10000 === 0) {
      process.stdout.write(`\r      Procesadas: ${localProcessed.toLocaleString()} filas | Países: ${savedForThisSex}`)
    }
  }

  console.log(`\r      ✅ Procesadas: ${localProcessed.toLocaleString()} filas | Países: ${savedForThisSex}`)
}

/**
 * Guardar resultados
 */
function saveResults() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })
  }

  let savedFiles = 0

  console.log(`\n${'='.repeat(70)}`)
  console.log('💾 Guardando archivos JSON...')
  console.log(`${'='.repeat(70)}\n`)

  for (const [key, data] of Object.entries(results)) {
    // Ordenar por edad
    data.entries.sort((a, b) => a.age - b.age)

    // Validar datos suficientes
    if (data.entries.length < 50) {
      warnings.push(`${key}: Datos insuficientes (${data.entries.length} entradas, esperado ~101)`)
      continue
    }

    // Guardar
    const filePath = path.join(CONFIG.outputDir, `${key}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    console.log(`   ✅ ${key}.json (${data.entries.length} edades)`)
    savedFiles++
  }

  return savedFiles
}

/**
 * Actualizar countries.json con los países procesados
 */
function updateCountriesJson() {
  const countriesJsonPath = 'src/lib/data/countries.json'

  // Crear array de países con datos
  const countriesWithData = Array.from(countriesFound)
    .sort()
    .map(code => {
      const name = CONFIG.countryNames[code] || code

      // Determinar región (simplificado)
      let region = 'Other'
      if (['CHL', 'ARG', 'BRA', 'MEX', 'COL', 'PER', 'VEN', 'ECU', 'BOL', 'URY', 'PRY', 'CRI', 'PAN', 'GTM', 'CUB', 'DOM', 'HND', 'SLV', 'NIC'].includes(code)) {
        region = 'Latin America'
      } else if (['USA', 'CAN'].includes(code)) {
        region = 'North America'
      } else if (['ESP', 'GBR', 'DEU', 'FRA', 'ITA', 'PRT', 'NLD', 'BEL', 'AUT', 'CHE', 'GRC', 'SWE', 'NOR', 'DNK', 'POL', 'CZE', 'HUN', 'ROU', 'UKR', 'IRL', 'FIN', 'SVK', 'BGR', 'HRV', 'LTU', 'SVN', 'LVA', 'EST'].includes(code)) {
        region = 'Europe'
      } else if (['JPN', 'CHN', 'IND', 'KOR', 'IDN', 'THA', 'VNM', 'PHL', 'MYS', 'SGP', 'PAK', 'BGD', 'IRN', 'TUR', 'IRQ', 'SAU', 'ISR', 'KAZ', 'UZB'].includes(code)) {
        region = 'Asia'
      } else if (['AUS', 'NZL'].includes(code)) {
        region = 'Oceania'
      } else if (['ZAF', 'EGY', 'NGA', 'KEN', 'ETH', 'TZA', 'UGA', 'DZA', 'MAR', 'GHA'].includes(code)) {
        region = 'Africa'
      }

      return {
        code,
        name,
        nameEs: name, // TODO: Agregar traducciones
        region,
        hasData: true
      }
    })

  fs.writeFileSync(countriesJsonPath, JSON.stringify(countriesWithData, null, 2))
  console.log(`\n   ✅ Actualizado: ${countriesJsonPath} (${countriesWithData.length} países)`)
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

${Array.from(countriesFound).sort().map(code =>
  `- **${code}**: ${CONFIG.countryNames[code] || code}`
).join('\n')}

### Archivos generados

${Object.keys(results).sort().map(key => {
  const data = results[key]
  return `- \`${key}.json\` - ${data.countryName}, ${data.sex} (${data.entries.length} edades, año ${data.year})`
}).join('\n')}

### Procesamiento
- **Script**: scripts/process-life-tables-f06.js
- **Fecha**: ${new Date().toISOString()}
- **Errores**: ${errors.length}
- **Advertencias**: ${warnings.length}

${errors.length > 0 ? `\n### Errores (primeros 10)\n${errors.slice(0, 10).map(e => `- ${e}`).join('\n')}` : ''}

${warnings.length > 0 ? `\n### Advertencias\n${warnings.slice(0, 20).map(e => `- ${e}`).join('\n')}${warnings.length > 20 ? `\n- ... y ${warnings.length - 20} más` : ''}` : ''}

---

## Datos incluidos por archivo

Cada archivo JSON contiene:
- **qx**: Probabilidad de muerte entre edad x y x+1
- **lx**: Número de sobrevivientes a edad x (de 100,000 nacimientos)
- **ex**: Expectativa de vida restante a edad x

## Próxima actualización

La ONU actualiza WPP cada 2 años. Verificar en:
https://population.un.org/wpp/
`

  const dataDir = path.dirname(CONFIG.logFile)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  fs.writeFileSync(CONFIG.logFile, logContent)
  console.log(`   ✅ Log actualizado: ${CONFIG.logFile}`)
}

/**
 * Main
 */
async function main() {
  const startTime = Date.now()

  console.log('\n' + '='.repeat(70))
  console.log('🚀 PROCESADOR DE LIFE TABLES UN WPP-2024 (F06)')
  console.log('='.repeat(70))
  console.log(`📅 Año objetivo: ${CONFIG.targetYear}`)
  console.log(`🌍 Países a procesar: ${CONFIG.countries.length}`)
  console.log('='.repeat(70))

  // Verificar archivos
  for (const [sex, filePath] of Object.entries(CONFIG.inputFiles)) {
    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ Archivo no encontrado: ${filePath}`)
      process.exit(1)
    }
    const stats = fs.statSync(filePath)
    console.log(`   ✅ ${sex}: ${(stats.size / 1024 / 1024).toFixed(0)} MB`)
  }

  // Procesar cada archivo
  try {
    processXLSX(CONFIG.inputFiles.male, 'male')
    processXLSX(CONFIG.inputFiles.female, 'female')
  } catch (error) {
    console.error('\n❌ Error procesando archivos:', error.message)
    console.error(error.stack)
    process.exit(1)
  }

  // Guardar
  const savedFiles = saveResults()

  // Actualizar countries.json
  updateCountriesJson()

  // Log
  updateDownloadLog(savedFiles)

  // Resumen
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log('\n' + '='.repeat(70))
  console.log('✨ PROCESAMIENTO COMPLETADO')
  console.log('='.repeat(70))
  console.log(`⏱️  Tiempo: ${elapsed} segundos`)
  console.log(`📦 Archivos generados: ${savedFiles}`)
  console.log(`🌍 Países con datos: ${countriesFound.size}`)
  console.log(`⚠️  Advertencias: ${warnings.length}`)
  console.log(`❌ Errores: ${errors.length}`)
  console.log(`📁 Directorio: ${CONFIG.outputDir}`)
  console.log('='.repeat(70))

  if (savedFiles === 0) {
    console.error('\n❌ No se generó ningún archivo.')
    console.error('   Revisa los errores arriba.')
    process.exit(1)
  }

  console.log('\n✅ ¡Datos reales de la ONU listos!')
  console.log('\n📝 Próximos pasos:')
  console.log('   1. npm run dev')
  console.log('   2. Prueba la calculadora con diferentes países')
  console.log('   3. Compara con los datos de muestra anteriores\n')
}

main().catch(error => {
  console.error('Error fatal:', error)
  process.exit(1)
})
