# Metodología

## Un espejo estadístico para decisiones que importan

---

## Abstract

Este proyecto no predice el futuro. Utiliza tablas de vida demográficas para aproximar cuántas veces más podrías ver en persona a alguien importante, si las condiciones actuales se mantienen. Es un **espejo estadístico**, no una sentencia.

El objetivo no es asustar, sino **hacer explícita la limitación de tiempo** para favorecer decisiones más alineadas con lo que importa.

---

## 1. Fundamento teórico

### 1.1. Marco conceptual

La **Socioemotional Selectivity Theory** (Carstensen, 1992; Carstensen et al., 1999) demuestra que cuando las personas perciben que su tiempo futuro es limitado, priorizan relaciones cercanas y metas emocionales por encima de metas de exploración o acumulación de información.

**Referencia clave**:
- Carstensen, L. L., Isaacowitz, D. M., & Charles, S. T. (1999). Taking time seriously: A theory of socioemotional selectivity. *American Psychologist*, 54(3), 165–181. https://doi.org/10.1037/0003-066X.54.3.165

### 1.2. Uso del tiempo a lo largo de la vida

Datos del **American Time Use Survey** y análisis de Our World in Data muestran que:

- La mayor parte del tiempo con padres se concentra antes de los 20 años
- Después de esa edad, la frecuencia de encuentros disminuye dramáticamente
- El patrón es similar para abuelos, con concentración aún más temprana

**Referencia**:
- Our World in Data: Time Use - https://ourworldindata.org/time-use

Esto significa que **la mayoría del tiempo ya se consumió**, incluso cuando ambos siguen vivos.

---

## 2. Fuentes de datos

### 2.1. Tablas de vida

Utilizamos las **tablas de vida oficial de la ONU**:

**UN World Population Prospects 2024 (WPP-2024)**
- Dataset: Life tables by single year of age and sex
- Cobertura: 237 países y áreas
- Periodo: 1950-2100 (proyecciones medias)
- Actualización: Julio 2024

**Enlace oficial**:
- https://population.un.org/wpp/Download/Standard/Mortality/

**Validación secundaria**:
- WHO Global Health Observatory (para validación cruzada)
- Human Mortality Database (para países con datos de alta calidad)

### 2.2. Variables de las tablas de vida

Para cada combinación de (país, sexo, edad x), las tablas contienen:

| Variable | Definición |
|----------|------------|
| **qₓ** | Probabilidad de morir entre edad x y x+1 |
| **lₓ** | De 100,000 nacidos vivos, número que sobrevive hasta edad x |
| **eₓ** | Esperanza de vida residual a edad x (años esperados restantes, condicional a estar vivo a esa edad) |

---

## 3. Modelo matemático

### 3.1. Esperanza de vida residual

Para una persona de edad **a**, la esperanza de vida residual **eₐ** es el número esperado de años que le quedan por vivir, **condicional a haber sobrevivido hasta la edad a**.

Esto es diferente a la esperanza de vida al nacer (e₀), y es el dato correcto para usar en este cálculo.

**Fuente**: Tablas de vida WPP-2024, columna `eₓ`.

### 3.2. Probabilidad de supervivencia

La probabilidad de que una persona de edad **a** sobreviva hasta la edad **a+t** es:

$$
P(\text{sobrevivir de } a \text{ a } a+t) = \frac{l_{a+t}}{l_a}
$$

donde lₓ es el número de supervivientes a edad x (de la cohorte inicial de 100,000).

**Ejemplo**:
- Si l₆₀ = 85,000 y l₈₀ = 50,000
- Entonces P(una persona de 60 años llegue a 80) = 50,000 / 85,000 = 58.8%

### 3.3. Tiempo conjunto esperado

Para dos personas (tú y otra persona), el tiempo esperado en el que **ambos** estarán vivos se calcula año por año:

$$
T = \sum_{t=0}^{\infty} P(\text{tú vivo en } t) \times P(\text{otra persona viva en } t)
$$

En la práctica, truncamos la suma en un horizonte razonable (ej. 50-80 años).

### 3.4. Encuentros esperados

Si actualmente te ves con la persona **f** veces al año, y asumimos que esa frecuencia se mantiene constante, el número esperado de encuentros futuros es:

$$
\mathbb{E}[\text{encuentros}] = \sum_{t=0}^{T} f \times P(\text{ambos vivos en año } t)
$$

**Supuestos**:
1. Frecuencia constante (f no cambia con el tiempo)
2. Encuentros independientes de la mortalidad
3. No se consideran factores individuales (enfermedad específica, accidentes)

**Limitaciones explícitas**:
- No incorpora información médica individual
- No ajusta por factores de riesgo personales
- Asume independencia entre las dos vidas (no considera mortalidad correlacionada, ej. accidentes comunes)

### 3.5. Rangos de incertidumbre

Para comunicar la incertidumbre inherente, calculamos:

- **Percentil 25 (p25)**: Estimación conservadora
- **Mediana (p50)**: Valor esperado central
- **Percentil 75 (p75)**: Estimación optimista

En la implementación actual, usamos aproximaciones basadas en varianza típica (~30% del valor esperado). En una versión completa, esto se haría con simulación Monte Carlo.

---

## 4. Implementación técnica

### 4.1. Algoritmo paso a paso

```
Entrada:
  - tu_edad, tu_sexo, tu_país
  - otra_edad, otro_sexo, otro_país
  - frecuencia_visitas_por_año

Paso 1: Cargar tablas de vida
  tabla_tú = cargar_tabla(tu_país, tu_sexo)
  tabla_otra = cargar_tabla(otro_país, otro_sexo)

Paso 2: Obtener esperanzas de vida residuales
  e_tú = tabla_tú[tu_edad].ex
  e_otra = tabla_otra[otra_edad].ex

Paso 3: Calcular horizonte temporal
  max_años = min(e_tú, e_otra) + margen_seguridad

Paso 4: Calcular probabilidades año a año
  total_encuentros = 0
  para cada t desde 0 hasta max_años:
    p_tú_vivo = tabla_tú[tu_edad + t].lx / tabla_tú[tu_edad].lx
    p_otra_vivo = tabla_otra[otra_edad + t].lx / tabla_otra[otra_edad].lx
    p_ambos_vivos = p_tú_vivo × p_otra_vivo

    encuentros_en_año_t = frecuencia_visitas_por_año × p_ambos_vivos
    total_encuentros += encuentros_en_año_t

Salida:
  - total_encuentros (redondeado)
  - rango [p25, p50, p75]
  - desglose año por año
```

### 4.2. Código de referencia

Ver implementación completa en:
- `src/lib/models/actuarial.ts` (modelo matemático)
- `src/lib/data/index.ts` (acceso a datos)

---

## 5. Validación y exactitud

### 5.1. Comparación con literatura

Este enfoque es estándar en:
- Cálculos actuariales (seguros de vida)
- Demografía formal (Preston et al., 2001)
- Economía de la salud (cálculo de QALY, años de vida ajustados por calidad)

**Referencia**:
- Preston, S. H., Heuveline, P., & Guillot, M. (2001). *Demography: Measuring and Modeling Population Processes*. Blackwell Publishers.

### 5.2. Casos de prueba

**Ejemplo 1**: Tú (30, mujer, Chile) → Madre (55, mujer, Chile), 12 visitas/año

Datos (aproximados de WPP-2024):
- e₃₀ (mujer, Chile) ≈ 52 años
- e₅₅ (mujer, Chile) ≈ 30 años

Ambas vivas esperado: ~30 años
Encuentros esperados: ~12 × 30 × factor_ajuste ≈ **300-350 visitas**

**Ejemplo 2**: Tú (25, hombre, USA) → Abuelo (82, hombre, USA), 4 visitas/año

Datos:
- e₂₅ (hombre, USA) ≈ 54 años
- e₈₂ (hombre, USA) ≈ 6-8 años

Ambos vivos esperado: ~6-8 años
Encuentros esperados: ~4 × 7 × factor_ajuste ≈ **20-30 visitas**

Este segundo caso refleja la realidad de abuelos en edad avanzada: el tiempo restante es mucho más limitado.

---

## 6. Limitaciones y avisos éticos

### 6.1. Qué NO es esta herramienta

❌ **No es**:
- Una predicción médica individual
- Un consejo sobre decisiones de vida
- Una herramienta diagnóstica
- Un motivo para decisiones extremas (ej. "ya es muy tarde para reconectar")

✅ **Es**:
- Una aproximación basada en promedios poblacionales
- Un espejo estadístico para reflexión
- Un recordatorio de la naturaleza finita del tiempo
- Un punto de partida para priorización consciente

### 6.2. Supuestos importantes

1. **Mortalidad promedio**: Usamos tablas de vida nacionales, que son promedios. Tu situación individual puede ser muy diferente.

2. **Independencia de vidas**: No modelamos eventos correlacionados (ej. accidentes compartidos, pandemias).

3. **Frecuencia constante**: Asumimos que la frecuencia de visitas no cambia. En realidad, puede aumentar o disminuir.

4. **Sin información médica**: No incorporamos condiciones de salud específicas, tratamientos, etc.

### 6.3. Uso responsable

Este sitio debe usarse como:
- **Herramienta de reflexión**, no de angustia
- **Motivador para acción positiva** (más tiempo juntos), no para resignación
- **Complemento a decisiones conscientes**, no sustituto del juicio personal

Si experimentas ansiedad severa al usar esta herramienta, considera:
- Hablar con personas de confianza
- Consultar recursos de apoyo emocional
- Recordar que **los números no son destino**, solo probabilidades

---

## 7. Transparencia y código abierto

### 7.1. Código fuente

Todo el código está disponible en:
- **GitHub**: [repositorio público]
- **Licencia**: MIT

Puedes:
- Revisar la implementación completa
- Proponer mejoras metodológicas
- Reportar errores o inconsistencias
- Usar los datos y código para investigación

### 7.2. Actualizaciones

Nos comprometemos a:
- Actualizar las tablas de vida cuando la ONU publique nuevas revisiones
- Documentar todos los cambios metodológicos
- Mantener esta página actualizada con las referencias más recientes
- Responder a críticas metodológicas fundamentadas

---

## 8. Referencias

### Datos demográficos
1. United Nations, Department of Economic and Social Affairs, Population Division (2024). *World Population Prospects 2024*. https://population.un.org/wpp/

2. World Health Organization. *Global Health Observatory - Life expectancy and healthy life expectancy*. https://www.who.int/data/gho

### Teoría y contexto
3. Carstensen, L. L., Isaacowitz, D. M., & Charles, S. T. (1999). Taking time seriously: A theory of socioemotional selectivity. *American Psychologist*, 54(3), 165–181.

4. Roser, M., Ritchie, H., & Spooner, F. (2023). Time Use. *Our World in Data*. https://ourworldindata.org/time-use

### Métodos demográficos
5. Preston, S. H., Heuveline, P., & Guillot, M. (2001). *Demography: Measuring and Modeling Population Processes*. Blackwell Publishers.

6. Human Mortality Database. University of California, Berkeley (USA), and Max Planck Institute for Demographic Research (Germany). www.mortality.org

---

## Contacto

Para preguntas metodológicas, sugerencias o reportar errores:
- **Issues**: [GitHub Issues]
- **Email**: [contacto]

---

**Última actualización**: 2025-11-14
**Versión del modelo**: 1.0
**Datos**: WPP-2024 (datos reales integrados - 81 países, año 2023)
