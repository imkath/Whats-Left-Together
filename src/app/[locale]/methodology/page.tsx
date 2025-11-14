'use client';

import { ArrowLeft, Database, AlertTriangle, BookOpen, Code, FileText } from 'lucide-react';
import Footer from '@/components/Footer';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <a
            href="/"
            className="text-primary-700 hover:text-primary-900 text-sm mb-2 inline-flex items-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a la calculadora
          </a>
          <h1 className="text-4xl font-bold mt-2">Cómo funciona</h1>
          <p className="text-neutral-600 mt-2">
            Metodología, fuentes de datos y fundamento científico
          </p>
        </div>
      </header>

      <div className="container-custom py-12 max-w-4xl">
        {/* Abstract */}
        <div className="card mb-8">
          <p className="text-lg text-neutral-700 leading-relaxed">
            Este proyecto no predice el futuro. Utiliza{' '}
            <strong>tablas de vida demográficas oficiales</strong> para aproximar cuántas veces más
            podrías ver en persona a alguien importante, si las condiciones actuales se mantienen.
            Es un <strong>espejo estadístico</strong>, no una sentencia.
          </p>
        </div>

        {/* 1. Qué calculamos */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">1. Qué calculamos</h2>
          <div className="card">
            <p className="text-neutral-700 mb-3">
              <strong>Visitas presenciales esperadas</strong> que quedan entre dos personas.
            </p>
            <p className="text-neutral-700">
              Basado en la probabilidad de que ambos estén vivos en cada año futuro, multiplicado
              por la frecuencia de visitas que mantienes actualmente.
            </p>
          </div>
        </section>

        {/* 2. De dónde salen los datos */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">2. De dónde salen los datos</h2>

          <div className="space-y-4">
            {/* Fuente principal */}
            <div className="card border-primary-300 bg-primary-50">
              <div className="mb-3 flex items-start gap-3">
                <div className="mt-1 text-primary-700">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary-900">
                    UN World Population Prospects 2024 (WPP-2024)
                  </h3>
                  <p className="text-sm text-primary-700 mt-1 font-medium">
                    Fuente principal de datos
                  </p>
                </div>
              </div>

              <div className="text-neutral-700 space-y-2 text-sm">
                <p>
                  <strong>Qué proporciona:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Tablas de vida por edad, país y sexo</li>
                  <li>
                    Esperanza de vida residual (e<sub>x</sub>)
                  </li>
                  <li>Probabilidad de supervivencia año a año</li>
                  <li>Cobertura: 237 países y áreas</li>
                </ul>

                <p className="mt-3">
                  <strong>Organización:</strong> Naciones Unidas, División de Población
                </p>
                <p>
                  <strong>Actualización:</strong> 2024 (revisión más reciente)
                </p>

                <a
                  href="https://population.un.org/wpp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-primary-700 hover:text-primary-800 font-medium"
                >
                  → Ver fuente oficial
                </a>
              </div>
            </div>

            {/* Fuentes de validación */}
            <div className="card">
              <h4 className="font-semibold mb-3">Fuentes de validación:</h4>

              <div className="space-y-3 text-sm">
                <div className="border-l-2 border-primary-500 pl-3">
                  <div>
                    <strong>WHO Global Health Observatory</strong> - Validación cruzada de datos de
                    mortalidad
                    <br />
                    <a
                      href="https://www.who.int/data/gho"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      www.who.int/data/gho
                    </a>
                  </div>
                </div>

                <div className="border-l-2 border-primary-500 pl-3">
                  <div>
                    <strong>Human Mortality Database</strong> - Precisión adicional para países con
                    buena estadística
                    <br />
                    <a
                      href="https://www.mortality.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      www.mortality.org
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Qué supuestos hacemos */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">3. Qué supuestos hacemos</h2>

          <div className="card">
            <ul className="space-y-3 text-neutral-700">
              <li className="flex gap-3">
                <span className="text-primary-600 font-bold">→</span>
                <div>
                  <strong>Frecuencia de visitas se mantiene estable</strong>
                  <p className="text-sm text-neutral-600 mt-1">
                    Si actualmente ves a la persona 12 veces al año, asumimos que eso continuará. En
                    la realidad puede aumentar o disminuir.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-primary-600 font-bold">→</span>
                <div>
                  <strong>Usamos promedios poblacionales</strong>
                  <p className="text-sm text-neutral-600 mt-1">
                    Las tablas de vida representan la experiencia promedio de una población, no
                    consideran salud individual.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="text-primary-600 font-bold">→</span>
                <div>
                  <strong>No incorporamos factores individuales</strong>
                  <p className="text-sm text-neutral-600 mt-1">
                    No conocemos enfermedades específicas, hábitos de vida, condiciones
                    particulares.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Qué NO hace esta herramienta */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            4. <AlertTriangle size={28} className="text-red-600" /> Qué NO hace esta herramienta
          </h2>

          <div className="card bg-red-50 border-red-300 border-l-4">
            <ul className="space-y-2 text-neutral-800 list-disc list-inside">
              <li>
                <strong>No predice cuándo morirá nadie</strong>
              </li>
              <li>
                <strong>No debe usarse para decisiones médicas</strong>
              </li>
              <li>
                <strong>No reemplaza el juicio personal o consejo profesional</strong>
              </li>
              <li>
                <strong>No incorpora eventos imprevistos (accidentes, pandemias, etc.)</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* 5. Por qué creemos que mostrar este número es útil */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            5. <BookOpen size={28} className="text-primary-700" /> Por qué creemos que mostrar este
            número es útil
          </h2>

          <div className="card border-primary-300">
            <h3 className="text-xl font-semibold mb-4">Fundamento psicológico</h3>

            <div className="prose prose-neutral max-w-none">
              <p className="text-neutral-700">
                La <strong>Teoría de la Selectividad Socioemocional</strong> (Carstensen, 1999,
                2021) demuestra que cuando las personas perciben que su tiempo futuro es limitado,
                priorizan relaciones cercanas y metas emocionales por encima de la exploración o
                acumulación de información.
              </p>

              <p className="text-neutral-700 mt-3">
                La gente tiende a <strong>subestimar cuán finito es su tiempo</strong> con los
                demás. Un número concreto ayuda a tomar decisiones más conscientes sobre
                prioridades.
              </p>

              <div className="bg-neutral-100 border-l-4 border-primary-500 p-4 mt-4 rounded">
                <p className="text-sm font-medium mb-2">Referencia científica:</p>
                <p className="text-sm text-neutral-700">
                  Carstensen, L. L. (2021). Socioemotional Selectivity Theory: The Role of Perceived
                  Endings in Human Motivation. <em>The Gerontologist</em>, 61(8), 1188–1196.
                </p>
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8599276/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                >
                  → Leer artículo (acceso abierto)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Datos de uso del tiempo */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Contexto: Uso del tiempo a lo largo de la vida
          </h2>

          <div className="card">
            <p className="text-neutral-700 mb-4">
              Datos del <strong>American Time Use Survey</strong> (Bureau of Labor Statistics,
              EE.UU.) y análisis de <strong>Our World in Data</strong> muestran que:
            </p>

            <ul className="space-y-2 text-neutral-700 ml-6 list-disc">
              <li>La mayor parte del tiempo con padres se concentra antes de los 20 años</li>
              <li>Después de esa edad, la frecuencia de encuentros disminuye dramáticamente</li>
              <li>El patrón es similar para abuelos, con concentración aún más temprana</li>
            </ul>

            <p className="text-neutral-700 mt-4">
              Esto significa que <strong>la mayoría del tiempo ya se consumió</strong>, incluso
              cuando ambos siguen vivos.
            </p>

            <a
              href="https://ourworldindata.org/time-use"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-medium"
            >
              → Ver datos de uso del tiempo
            </a>
          </div>
        </section>

        {/* Modelo matemático */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Modelo matemático</h2>

          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Cálculo paso a paso</h3>

            <div className="space-y-4 text-neutral-700 text-sm">
              <div>
                <strong>
                  1. Esperanza de vida residual (e<sub>x</sub>):
                </strong>
                <p className="mt-1">
                  Para una persona de edad <em>a</em>, e<sub>a</sub> es el número esperado de años
                  que le quedan por vivir, <em>condicional a haber sobrevivido hasta esa edad</em>.
                </p>
              </div>

              <div>
                <strong>2. Probabilidad de supervivencia:</strong>
                <p className="mt-1">
                  P(sobrevivir de edad <em>a</em> a edad <em>a+t</em>) = l<sub>a+t</sub> / l
                  <sub>a</sub>
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  Donde l<sub>x</sub> es el número de supervivientes a edad x (de cohorte inicial de
                  100,000)
                </p>
              </div>

              <div>
                <strong>3. Tiempo conjunto esperado:</strong>
                <p className="mt-1">
                  Suma año por año de: P(tú vivo en año t) × P(otra persona viva en año t)
                </p>
              </div>

              <div>
                <strong>4. Visitas esperadas:</strong>
                <p className="mt-1">
                  Suma de: (frecuencia anual) × P(ambos vivos en año t), para cada año t
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                <strong>Referencia metodológica:</strong> Preston, S. H., Heuveline, P., & Guillot,
                M. (2001).
                <em>Demography: Measuring and Modeling Population Processes</em>. Blackwell
                Publishers.
              </p>
            </div>
          </div>
        </section>

        {/* Transparencia */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Code size={28} className="text-primary-700" /> Transparencia y código abierto
          </h2>

          <div className="card bg-primary-50 border-primary-200">
            <p className="text-neutral-700 mb-4">
              Todo el código de este proyecto es <strong>abierto y auditable</strong>:
            </p>

            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Código fuente completo disponible en GitHub</li>
              <li>Modelo matemático implementado en TypeScript</li>
              <li>Script de procesamiento de datos incluido</li>
              <li>Todas las fuentes documentadas con enlaces directos</li>
            </ul>

            <div className="mt-4">
              <a
                href="https://github.com/[tu-repo]/whats-left-together"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block"
              >
                Ver código en GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Referencias completas */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <FileText size={28} className="text-primary-700" /> Referencias completas
          </h2>

          <div className="card">
            <h3 className="font-semibold mb-3">Datos demográficos</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700 mb-6">
              <li>
                United Nations, Department of Economic and Social Affairs, Population Division
                (2024).
                <em>World Population Prospects 2024</em>.{' '}
                <a
                  href="https://population.un.org/wpp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  https://population.un.org/wpp/
                </a>
              </li>
              <li>
                World Health Organization (2024). <em>Global Health Observatory</em>.{' '}
                <a
                  href="https://www.who.int/data/gho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  https://www.who.int/data/gho
                </a>
              </li>
              <li>
                Human Mortality Database. University of California, Berkeley (USA), and Max Planck
                Institute for Demographic Research (Germany).{' '}
                <a
                  href="https://www.mortality.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  www.mortality.org
                </a>
              </li>
            </ol>

            <h3 className="font-semibold mb-3">Uso del tiempo</h3>
            <ol
              className="list-decimal list-inside space-y-2 text-sm text-neutral-700 mb-6"
              start={4}
            >
              <li>
                Roser, M., Ritchie, H., & Spooner, F. (2023). Time Use. <em>Our World in Data</em>.{' '}
                <a
                  href="https://ourworldindata.org/time-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  https://ourworldindata.org/time-use
                </a>
              </li>
              <li>
                U.S. Bureau of Labor Statistics (2024). <em>American Time Use Survey</em>.{' '}
                <a
                  href="https://www.bls.gov/tus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  https://www.bls.gov/tus/
                </a>
              </li>
            </ol>

            <h3 className="font-semibold mb-3">Marco teórico</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700" start={6}>
              <li>
                Carstensen, L. L. (2021). Socioemotional Selectivity Theory: The Role of Perceived
                Endings in Human Motivation. <em>The Gerontologist</em>, 61(8), 1188–1196.{' '}
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8599276/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  https://doi.org/10.1093/geront/gnab116
                </a>
              </li>
              <li>
                Carstensen, L. L., Isaacowitz, D. M., & Charles, S. T. (1999). Taking time
                seriously: A theory of socioemotional selectivity. <em>American Psychologist</em>,
                54(3), 165–181.
              </li>
            </ol>
          </div>
        </section>

        {/* CTA final */}
        <div className="text-center py-8">
          <a href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            Volver a la calculadora
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
