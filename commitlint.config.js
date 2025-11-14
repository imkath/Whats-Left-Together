module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bugs
        'docs', // Documentación
        'style', // Formateo, lint
        'refactor', // Refactorización
        'perf', // Mejoras de rendimiento
        'test', // Tests
        'build', // Build system
        'ci', // CI/CD
        'chore', // Tareas de mantenimiento
        'revert', // Revertir commits
      ],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
  },
};
