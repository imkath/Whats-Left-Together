# Life Tables Data

Este directorio contiene las tablas de vida procesadas de la ONU (WPP-2024).

## Fuente oficial

**UN World Population Prospects 2024**

- URL: https://population.un.org/wpp/downloads?folder=Standard%20Projections&group=Mortality
- Dataset: Life tables by age (single year) and sex
- Fecha de descarga: [TO BE FILLED]
- Versión: WPP-2024 Revision

## Estructura de archivos

```
data/
├── life-tables/
│   ├── CHL_female.json   # Chile, mujeres
│   ├── CHL_male.json     # Chile, hombres
│   ├── USA_female.json   # Estados Unidos, mujeres
│   ├── USA_male.json     # Estados Unidos, hombres
│   └── ...
├── countries.json        # Lista de países disponibles
└── index.ts             # API para acceder a los datos
```

## Formato de datos

Cada archivo JSON contiene:

```typescript
{
  "country": "CHL",
  "countryName": "Chile",
  "sex": "female",
  "year": 2024,
  "source": "UN WPP-2024",
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

1. Descargar las tablas más recientes de la ONU
2. Ejecutar el script de procesamiento:
   ```bash
   npm run process-life-tables
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
