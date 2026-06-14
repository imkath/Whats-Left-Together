/**
 * Zod validation schemas for form inputs.
 *
 * Messages are localized: the schema is built through `buildRelationshipInputSchema(t)`,
 * which receives a translator bound to the `validation` i18n namespace. Building the
 * schema is cheap, so it is constructed per submit, keeping error messages in sync with
 * the active locale instead of shipping hardcoded English strings to the user.
 */

import { z } from 'zod';

/** Translator bound to the `validation` namespace (e.g. `useTranslations('validation')`). */
export type ValidationTranslator = (
  key: string,
  params?: Record<string, string | number>
) => string;

const RELATION_TYPES = [
  'mother',
  'father',
  'grandmother_maternal',
  'grandmother_paternal',
  'grandfather_maternal',
  'grandfather_paternal',
  'partner',
  'friend',
  'other_family',
  'other',
] as const;

/** Relations where the other person is expected to be older than the user. */
const PARENT_RELATIONS: readonly string[] = [
  'mother',
  'father',
  'grandmother_maternal',
  'grandmother_paternal',
  'grandfather_maternal',
  'grandfather_paternal',
];

const FREQUENCY_PERIODS = ['weekly', 'monthly', 'quarterly', 'yearly'] as const;

/**
 * Build the relationship-input validation schema with localized messages.
 *
 * @param t - Translator bound to the `validation` namespace.
 */
export function buildRelationshipInputSchema(t: ValidationTranslator) {
  // Shared by "you" and "them"; life-table data caps age at 100.
  const personSchema = z.object({
    age: z
      .number({
        required_error: t('ageRequired'),
        invalid_type_error: t('ageInvalid'),
      })
      .int(t('ageInteger'))
      .min(0, t('ageMin'))
      .max(100, t('ageMax', { max: 100 })),
    sex: z.enum(['male', 'female'], {
      required_error: t('sexRequired'),
      invalid_type_error: t('sexInvalid'),
    }),
    country: z
      .string({ required_error: t('countryRequired') })
      .length(3, t('countryInvalid'))
      .regex(/^[A-Z]{3}$/, t('countryInvalid')),
  });

  return z
    .object({
      you: personSchema,
      them: personSchema,
      relationType: z.enum(RELATION_TYPES, {
        required_error: t('relationRequired'),
        invalid_type_error: t('relationInvalid'),
      }),
      visitsPerYear: z
        .number()
        .int()
        .min(0, t('visitsMin'))
        .max(365, t('visitsMax', { max: 365 })),
      frequencyPeriod: z.enum(FREQUENCY_PERIODS).optional(),
      timesPerPeriod: z.number().int().min(1, t('timesMin')).optional(),
    })
    .refine(
      (data) =>
        PARENT_RELATIONS.includes(data.relationType) ? data.them.age > data.you.age : true,
      {
        message: t('olderThanYou'),
        path: ['them', 'age'],
      }
    );
}

export type RelationshipInputValidation = z.infer<ReturnType<typeof buildRelationshipInputSchema>>;
