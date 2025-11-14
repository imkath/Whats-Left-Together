# Fuentes de Datos Oficiales

## Kit de fuentes para What's Left Together

Este documento lista todas las fuentes de datos confiables y trazables utilizadas en el proyecto.

---

## 1. Tablas de vida y esperanza de vida

### 1.1. Fuente principal (columna vertebral)

#### UN World Population Prospects 2024 (WPP-2024)

**Uso principal**: Cálculo central del número de años y visitas esperadas

- **Web principal**: https://population.un.org/wpp
- **Descargas (Mortality/Life tables)**: https://population.un.org/wpp/downloads?folder=Standard+Projections&group=Mortality

**Qué proporciona**:

- Tablas de vida por país, sexo y edad
- Probabilidad de supervivencia (lₓ)
- Esperanza de vida residual (eₓ)
- Cobertura: 237 países/áreas
- Edición: 2024 (muy reciente)

**Cómo lo usamos**:

```
Para cada persona (usuario y familiar):
  - País
  - Sexo
  - Edad actual
  - Esperanza de vida residual eₓ desde la tabla

Con eso → horizonte de años en que ambos están vivos "en promedio"
```

**Citación**:

```
United Nations, Department of Economic and Social Affairs, Population Division (2024).
World Population Prospects 2024, Online Edition.
https://population.un.org/wpp/
```

---

### 1.2. Fuentes de validación

#### WHO Global Health Observatory (GHO)

**Uso**: Validación cruzada de datos de mortalidad

- **Portal general**: https://www.who.int/data/gho
- **Life expectancy y life tables**: https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/healthy-life-expectancy-(hale)
- **Life tables by country**: https://who-dev5.prgsdev.com/m/data/gho/data/indicators/indicator-details/GHO/gho-ghe-life-tables-by-country

**Qué proporciona**:

- Fuente alternativa/contraste para algunas regiones
- Verificación de coherencia WPP↔WHO

**Citación**:

```
World Health Organization (2024).
Global Health Observatory - Life Expectancy and Life Tables.
https://www.who.int/data/gho
```

---

### 1.3. Fuentes de alta calidad por país (nivel "pro")

#### Human Mortality Database (HMD)

**Uso**: Precisión adicional para países con buena estadística vital

- **Sitio principal**: https://www.mortality.org
- **Ejemplo USA**: https://www.mortality.org/Country/Country?cntr=USA
- **Guía de citación**: https://www.mortality.org/Research/CitationGuidelines

**Qué proporciona**:

- Tablas de vida muy refinadas
- Países con buena estadística: EE.UU., Europa, Chile (si disponible), etc.
- Útil para dar un plus de precisión

**Citación** (seguir guía oficial):

```
Human Mortality Database. University of California, Berkeley (USA),
and Max Planck Institute for Demographic Research (Germany).
Available at www.mortality.org (data downloaded on [DATE]).
```

---

#### Human Life-Table Database (HLD)

**Uso**: Fuente secundaria para series históricas

- **Sitio principal**: https://www.lifetable.de

**Qué proporciona**:

- Colección de tablas de vida (oficiales + investigación)
- 140+ países
- Útil para casos no bien cubiertos en otros sitios

**Citación**:

```
Max Planck Institute for Demographic Research (2024).
Human Life-Table Database.
https://www.lifetable.de
```

---

## 2. Datos de uso del tiempo

**Uso**: Contexto y visualizaciones ("ya usaste X% del tiempo típico con tus padres")

### 2.1. Our World in Data – Time Use

**Uso principal**: Visualizaciones de cómo cambia el tiempo con diferentes personas

- **Artículo general**: https://ourworldindata.org/time-use
- **Gráfico clave**: https://ourworldindata.org/grapher/time-spent-with-relationships-by-age-us

**Qué proporciona**:

- Tiempo diario con padres, pareja, hijos, amigos por edad
- Visualización: "mayoría de horas con padres se concentran antes de los 20 años"

**Citación**:

```
Roser, M., Ritchie, H., & Spooner, F. (2023).
Time Use. Our World in Data.
https://ourworldindata.org/time-use
```

---

### 2.2. American Time Use Survey (ATUS)

**Uso**: Datos base (fuente primaria de Our World in Data)

- **Resumen más reciente**: https://www.bls.gov/news.release/atus.nr0.htm

**Qué proporciona**:

- Distribución de tiempo diario (trabajo, cuidado, ocio, compañía)
- Base de datos oficial del gobierno de EE.UU.

**Citación**:

```
U.S. Bureau of Labor Statistics (2024).
American Time Use Survey.
https://www.bls.gov/tus/
```

---

### 2.3. Visual Capitalist (opcional, inspiración visual)

**Uso**: Inspiración para presentación clara

- **Artículo**: https://www.visualcapitalist.com/who-americans-spend-their-time-with/

**Qué proporciona**:

- Ejemplo de cómo presentar curvas de "tiempo con X grupo" por edad

---

## 3. Comparaciones y tablas agregadas

### 3.1. Our World in Data – Life Expectancy

**Uso**: Gráficos de comparación entre países

- **Dataset y gráfico**: https://ourworldindata.org/grapher/life-expectancy-hmd-unwpp

**Qué proporciona**:

- Comparación entre países
- "La vida media ha crecido X años en las últimas décadas"

**Uso en el proyecto**:

- No para cálculo principal (mejor WPP directo)
- Sí para apoyo visual en "Acerca de" o "Metodología"

**Citación**:

```
Roser, M., Ortiz-Ospina, E., & Ritchie, H. (2023).
Life Expectancy. Our World in Data.
https://ourworldindata.org/life-expectancy
```

---

## 4. Marco psicológico y teórico

**Uso**: Sección "Por qué importa" / justificación del proyecto

### 4.1. Socioemotional Selectivity Theory (SST)

**Uso**: Base teórica de por qué mostrar estos números tiene sentido

#### Artículo de revisión reciente (open access)

- **Título**: "Socioemotional Selectivity Theory: The Role of Perceived Endings in Human Motivation"
- **Revista**: _The Gerontologist_, 2021
- **Link**: https://pmc.ncbi.nlm.nih.gov/articles/PMC8599276

**Qué proporciona**:

- Evidencia de que percibir el tiempo como limitado → priorizamos relaciones cercanas
- Base científica sólida para el proyecto

**Citación**:

```
Carstensen, L. L. (2021).
Socioemotional Selectivity Theory: The Role of Perceived Endings in Human Motivation.
The Gerontologist, 61(8), 1188–1196.
https://doi.org/10.1093/geront/gnab116
```

---

#### Artículo clásico

- **Título**: "Taking Time Seriously: A Theory of Socioemotional Selectivity"
- **Link**: https://www.researchgate.net/publication/13099435_Taking_time_seriously_A_theory_of_socioemotional_selectivity

**Citación**:

```
Carstensen, L. L., Isaacowitz, D. M., & Charles, S. T. (1999).
Taking time seriously: A theory of socioemotional selectivity.
American Psychologist, 54(3), 165–181.
https://doi.org/10.1037/0003-066X.54.3.165
```

---

### 4.2. Horizonte temporal percibido

**Uso**: Matizar en metodología (el número es estadístico, pero percepción subjetiva también importa)

- **Título**: "Rethinking the measurement of time horizons in the context of socioemotional selectivity theory"
- **Revista**: _International Psychogeriatrics_, 2023
- **Link**: https://www.sciencedirect.com/science/article/pii/S1041610224030357

**Qué proporciona**:

- El horizonte temporal percibido no es solo "edad"
- También influyen contexto y eventos (mudanzas, enfermedad, etc.)

**Citación**:

```
[Autor et al.] (2023).
Rethinking the measurement of time horizons in the context of
socioemotional selectivity theory.
International Psychogeriatrics.
https://doi.org/[DOI]
```

---

## 5. Resumen operativo: cómo usar estas fuentes

### Cálculo de años con ambos vivos

- **Base**: UN WPP 2024 (tablas de vida por edad, país, sexo)
- **Validación puntual**: WHO GHO + HMD para países con buenos datos

### Visualizaciones de "ya usaste gran parte del tiempo con X"

- **Base**: Our World in Data (time use) + ATUS

### Texto explicativo y marco conceptual

- **Base**: Artículos de Carstensen y coautores sobre SST

### Rigor de citación

- Para HMD y HLD: seguir guías de citación oficiales que proporcionan
- Para WPP: citar con fecha de descarga
- Para papers: formato APA o Vancouver

---

## 6. Trazabilidad de datos

### Archivo de registro (Data README)

Cada vez que se actualicen los datos, documentar en `data/DOWNLOAD_LOG.md`:

```markdown
# Registro de descargas de datos

## UN WPP-2024

- Fecha de descarga: [YYYY-MM-DD]
- Archivo: WPP2024_Life_Table_Complete.csv
- URL: https://population.un.org/wpp/downloads?folder=Standard+Projections&group=Mortality
- Hash SHA256: [hash del archivo]
- Procesado con: scripts/process-life-tables.js

## WHO GHO

- Fecha de descarga: [YYYY-MM-DD]
- Archivo: [nombre]
- URL: [url exacta]
  ...
```

---

## 7. Referencias completas (formato APA)

### Datos demográficos

1. United Nations, Department of Economic and Social Affairs, Population Division (2024). _World Population Prospects 2024, Online Edition_. https://population.un.org/wpp/

2. World Health Organization (2024). _Global Health Observatory - Life Expectancy and Life Tables_. https://www.who.int/data/gho

3. Human Mortality Database. University of California, Berkeley (USA), and Max Planck Institute for Demographic Research (Germany). Available at www.mortality.org

4. Max Planck Institute for Demographic Research (2024). _Human Life-Table Database_. https://www.lifetable.de

### Uso del tiempo

5. Roser, M., Ritchie, H., & Spooner, F. (2023). Time Use. _Our World in Data_. https://ourworldindata.org/time-use

6. U.S. Bureau of Labor Statistics (2024). _American Time Use Survey_. https://www.bls.gov/tus/

### Marco teórico

7. Carstensen, L. L. (2021). Socioemotional Selectivity Theory: The Role of Perceived Endings in Human Motivation. _The Gerontologist_, 61(8), 1188–1196. https://doi.org/10.1093/geront/gnab116

8. Carstensen, L. L., Isaacowitz, D. M., & Charles, S. T. (1999). Taking time seriously: A theory of socioemotional selectivity. _American Psychologist_, 54(3), 165–181. https://doi.org/10.1037/0003-066X.54.3.165

9. Roser, M., Ortiz-Ospina, E., & Ritchie, H. (2023). Life Expectancy. _Our World in Data_. https://ourworldindata.org/life-expectancy

---

**Última actualización**: 2025-11-14
**Mantenido por**: What's Left Together Team
**Contacto**: [GitHub Issues]
