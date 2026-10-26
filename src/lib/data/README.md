# Life Tables Data

Este directorio contiene las tablas de vida procesadas de la ONU (WPP-2024).

## Fuente oficial

**UN World Population Prospects 2024**

- URL: https://population.un.org/wpp/downloads?folder=Standard%20Projections&group=Mortality
- Dataset: Life tables by age (single year) and sex
- Fecha de descarga: 2026-02-20
- Cobertura en la app: 197 países y áreas (394 archivos, uno por país y sexo)
- Versión: WPP-2024 Revision

## Estructura de archivos

```
public/data/life-tables/
├── CHL_female.json       # Chile, mujeres
├── CHL_male.json         # Chile, hombres
└── ...                   # 394 archivos

src/lib/data/
├── raw/                  # XLSX y CSV de la ONU (no versionados)
├── countries.json        # Lista de países disponibles
└── index.ts              # API para acceder a los datos
```

## Formato de datos

Cada archivo JSON contiene:

```typescript
{
  "country": "CHL",
  "countryName": "Chile",
  "sex": "female",
  "year": 2023,
  "source": "UN World Population Prospects 2024",
  "sourceUrl": "https://population.un.org/wpp/",
  "downloadDate": "2026-02-20",
  "entries": [
    {
      "age": 0,
      "qx": 0.00512,    // Prob. de morir entre x y x+1
      "lx": 100000,     // Supervivientes a edad x (de 100,000 nacidos)
      "ex": 82.5        // Esperanza de vida a edad x
    },
    // ... para cada edad 0-100+
  ]
}
```

## Cómo actualizar los datos

1. Descargar los archivos F06 (single age, male y female) de la ONU y dejarlos en `src/lib/data/raw/`
2. Convertirlos a CSV y generar los JSON:
   ```bash
   python3 scripts/xlsx-to-csv.py
   npm run process-life-tables-f06
   ```
3. Actualizar la fecha de descarga en este README
4. Hacer commit con mensaje descriptivo

## Nota metodológica

Las tablas de vida muestran:

- **qx**: Probabilidad de morir entre edad x y x+1
- **lx**: De 100,000 personas nacidas, cuántas sobreviven hasta edad x
- **ex**: Esperanza de vida residual a edad x (años esperados restantes)

La probabilidad de supervivencia de edad a hasta edad a+t es:

```
P(sobrevivir de a a a+t) = l(a+t) / l(a)
```

Esto es lo que usamos en el modelo actuarial.
