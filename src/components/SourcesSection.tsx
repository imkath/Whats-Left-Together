/**
 * Componente reutilizable de fuentes
 * Muestra las fuentes oficiales con enlaces
 */

interface Source {
  name: string;
  organization: string;
  url: string;
  description: string;
  isPrimary?: boolean;
}

const SOURCES: Source[] = [
  {
    name: 'UN World Population Prospects 2024',
    organization: 'Naciones Unidas, División de Población',
    url: 'https://population.un.org/wpp/',
    description: 'Tablas de vida por edad, sexo y país para 237 países. Fuente principal de datos.',
    isPrimary: true,
  },
  {
    name: 'WHO Global Health Observatory',
    organization: 'Organización Mundial de la Salud',
    url: 'https://www.who.int/data/gho',
    description: 'Validación cruzada de datos de mortalidad y esperanza de vida.',
  },
  {
    name: 'Human Mortality Database',
    organization: 'UC Berkeley & Max Planck Institute',
    url: 'https://www.mortality.org',
    description: 'Tablas de vida refinadas para países con estadísticas de alta calidad.',
  },
  {
    name: 'Our World in Data - Time Use',
    organization: 'Universidad de Oxford',
    url: 'https://ourworldindata.org/time-use',
    description: 'Datos sobre uso del tiempo y cómo cambia a lo largo de la vida.',
  },
  {
    name: 'Socioemotional Selectivity Theory',
    organization: 'Carstensen et al. (2021)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8599276/',
    description: 'Base teórica: percibir tiempo limitado → priorizar relaciones cercanas.',
  },
];

interface SourcesSectionProps {
  compact?: boolean;
  showTitle?: boolean;
}

export default function SourcesSection({ compact = false, showTitle = true }: SourcesSectionProps) {
  if (compact) {
    return (
      <div className="text-sm">
        {showTitle && (
          <h4 className="font-semibold text-neutral-800 mb-3">Fuentes de datos oficiales:</h4>
        )}
        <ul className="space-y-2">
          {SOURCES.filter((s) => s.isPrimary).map((source) => (
            <li key={source.url} className="flex gap-2">
              <span className="text-primary-600">→</span>
              <div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {source.name}
                </a>
                <p className="text-xs text-neutral-600 mt-1">{source.description}</p>
              </div>
            </li>
          ))}
          <li className="text-xs text-neutral-600 mt-3">
            <a href="/methodology" className="text-primary-600 hover:text-primary-700">
              + {SOURCES.length - 1} fuentes adicionales →
            </a>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div>
      {showTitle && <h3 className="text-2xl font-bold mb-6">Fuentes de datos oficiales</h3>}

      <div className="space-y-4">
        {SOURCES.map((source) => (
          <div
            key={source.url}
            className={`card ${source.isPrimary ? 'border-primary-300 bg-primary-50' : ''}`}
          >
            <div className="flex items-start gap-3">
              {source.isPrimary && <span className="text-2xl">⭐</span>}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-neutral-900">{source.name}</h4>
                <p className="text-sm text-neutral-600 mt-1">{source.organization}</p>
                <p className="text-neutral-700 mt-2">{source.description}</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  → Ver fuente
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
        <p className="text-sm text-neutral-700">
          <strong>Transparencia total:</strong> Todo el código y los datos son de acceso público.
          Puedes verificar la metodología completa, revisar el código fuente, y validar los
          cálculos.
        </p>
        <a
          href="https://github.com/[tu-repo]/whats-left-together"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          → Ver código en GitHub
        </a>
      </div>
    </div>
  );
}
