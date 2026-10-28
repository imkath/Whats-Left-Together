# DESIGN.md

Sistema de diseño de What's Left Together. Lo lee cualquiera que toque la UI, persona o modelo.

## Para quién

Adultos de 25 a 55 años que piensan en una madre, un padre, una abuela o una pareja, casi siempre desde el celular y muchas veces porque alguien les compartió el enlace. Llegan con una pregunta íntima y algo de miedo a la respuesta. Lo que necesitan es responder rápido, leer un número honesto y salir con algo que hacer. No buscan un dashboard.

Prueba del público: **una persona que acaba de calcular las visitas que le quedan con su abuela, ¿siente que el sitio la trató con respeto y le dijo la verdad?**

## Dirección: el registro que se deshace

El logo ya trae la idea: las letras de "together" se descomponen en cuadrados que se dispersan. Todo el sitio sale de ese cuadrado. Una visita es un cuadrado, un año es una fila, y la probabilidad de que ambos sigan vivos es cuánta tinta le queda. Referentes: las cartas de registro de asistencia impresas (una casilla por día) y los gráficos de unidades de Otto Neurath (Isotype), donde cada figura cuenta una cosa real.

Una línea de filosofía: **nada decorativo que no cuente algo; si hay un cuadrado en pantalla, es una visita.**

## Color

| Rol              | Claro             | Oscuro            | Uso                                                            |
| ---------------- | ----------------- | ----------------- | -------------------------------------------------------------- |
| Fondo            | `#FFFFFF`         | `#111111`         | Página                                                         |
| Superficie       | `#F4F4F3`         | `#232322`         | Bloques que agrupan (formulario, notas)                        |
| Línea            | `#E6E6E4`         | `#3A3A38`         | Bordes de 1 px completos, divisores                            |
| Texto            | `#111111`         | `#F4F4F3`         | Texto principal, la tinta del logo                             |
| Texto secundario | `#6E6E6A` (5,1:1) | `#9A9A96`         | Ayudas, etiquetas                                              |
| Presencia        | `#834E60` (6,5:1) | `#B48C97` (6,4:1) | Lo que sigue vivo: el número central y los cuadrados. Nada más |

Filosofía: el logo es tinta negra sobre blanco, así que el sistema es monocromo y la presencia es el único color. Si algo no es "lo que todavía queda", no va en presencia.

## Tipografía

- **Schibsted Grotesk** (OFL, Google Fonts) para todo. Es un grotesco de diario, de la familia formal del wordmark (grotesco de astas rectas, `a` de dos pisos), con cifras tabulares. Se lee como información pública seria, que es lo que es: datos de la ONU.
- Pesos con función: 800 solo para el número del resultado, 700 para títulos, 400 para texto, 500 para controles.
- Cifras siempre `tabular-nums`.

## Forma

- Radios: controles y botones 6 px, contenedores 10 px. El cuadrado del logo tiene esquina apenas suavizada; nada de píldoras.
- Sombras: ninguna en reposo. Se separa con espacio y, si hace falta, con borde completo de 1 px.
- Espaciado en múltiplos de 4 px. Secciones de 64 a 96 px en escritorio, 48 en móvil. Gutter lateral de 16 px en móvil.
- Ancho de lectura: 40 a 42 rem para texto, 72 rem como máximo para la página.
- Movimiento: 150 a 250 ms, `cubic-bezier(0.2, 0, 0, 1)`. Los cuadrados del resultado aparecen fila por fila; con `prefers-reduced-motion` aparecen todos de una.
- Íconos: Solar Icons en peso `Linear`, solo donde ayudan a actuar (flechas, compartir, tema). Nunca como adorno de una tarjeta.

## Exclusiones, con su alternativa

| No                                                | En su lugar                                                                             | Por qué                                                                    |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Fondo hueso o papel cálido                        | Blanco `#FFFFFF`                                                                        | El cálido "elegante" es receta de generador; el logo es negro sobre blanco |
| Barritas de color sobre títulos, líneas de acento | Jerarquía con peso y espacio                                                            | Adorno de plantilla que no dice nada                                       |
| Etiqueta en versalitas espaciadas sobre el logo   | El logo solo, y una pregunta debajo                                                     | El logo ya es el título                                                    |
| Tres tarjetas con ícono duotono                   | Texto corrido en columnas, con la cita al autor                                         | El contenido es un argumento, no tres beneficios                           |
| Gráfico de puntos al azar                         | Grilla de cuadrados: una fila por año, un cuadrado por visita, tinta según probabilidad | Lo que se muestra tiene que ser el dato                                    |
| Modal que bloquea antes de empezar                | Una nota corta junto al formulario y otra junto al resultado                            | El aviso se lee cuando sirve, no como peaje                                |
| Tarjetas de acción que no hacen nada              | Botones que hacen algo: compartir, probar otra frecuencia, calcular otra persona        | Si parece presionable, tiene que funcionar                                 |
| Botones píldora con sombra                        | Rectángulo de 6 px, sin sombra                                                          | Sigue al cuadrado del logo                                                 |
| Flechas de los `input[type=number]`               | Campo limpio con `inputMode="numeric"`                                                  | Se ven anticuadas y el celular ya trae teclado numérico                    |

## Estados que siempre existen

Cargando (una fila de cuadrados que se llena), error con salida concreta (cambiar país, reintentar), vacío (el formulario mismo) y resultado. Contraste AA en todos, foco visible con anillo de presencia.
