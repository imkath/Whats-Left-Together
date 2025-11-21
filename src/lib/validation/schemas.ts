/**
 * Zod validation schemas for form inputs
 */

import { z } from 'zod';

/**
 * Schema for person input validation
 */
export const personInputSchema = z.object({
  age: z
    .number({
      required_error: 'Age is required',
      invalid_type_error: 'Age must be a number',
    })
    .int('Age must be a whole number')
    .min(0, 'Age must be at least 0')
    .max(100, 'Age cannot exceed 100 (life table data limitation)'),
  sex: z.enum(['male', 'female'], {
    required_error: 'Sex is required',
    invalid_type_error: 'Sex must be either male or female',
  }),
  country: z
    .string({
      required_error: 'Country is required',
    })
    .length(3, 'Country code must be 3 characters (ISO 3166-1 alpha-3)')
    .regex(/^[A-Z]{3}$/, 'Country code must be uppercase letters'),
});

/**
 * Schema for frequency period validation
 */
export const frequencyPeriodSchema = z.enum(['weekly', 'monthly', 'quarterly', 'yearly'], {
  required_error: 'Frequency period is required',
  invalid_type_error: 'Invalid frequency period',
});

/**
 * Schema for relation type validation
 */
export const relationTypeSchema = z.enum(
  [
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
  ],
  {
    required_error: 'Relationship type is required',
    invalid_type_error: 'Invalid relationship type',
  }
);

/**
 * Schema for times per period validation
 * Validates against maximum allowed for each period
 */
export const timesPerPeriodSchema = z
  .object({
    period: frequencyPeriodSchema,
    times: z.number().int().min(1, 'Must have at least 1 visit per period'),
  })
  .refine(
    (data) => {
      const maxTimes: Record<string, number> = {
        weekly: 7,
        monthly: 31,
        quarterly: 90,
        yearly: 365,
      };
      return data.times <= maxTimes[data.period];
    },
    (data) => ({
      message: `For ${data.period} period, maximum is ${
        { weekly: 7, monthly: 31, quarterly: 90, yearly: 365 }[data.period]
      } times`,
      path: ['times'],
    })
  );

/**
 * Schema for the other person's input validation
 * Also limited to 100 due to life table data constraints
 */
const theirPersonInputSchema = z.object({
  age: z
    .number({
      required_error: 'Age is required',
      invalid_type_error: 'Age must be a number',
    })
    .int('Age must be a whole number')
    .min(0, 'Age must be at least 0')
    .max(100, 'Age cannot exceed 100 (life table data limitation)'),
  sex: z.enum(['male', 'female'], {
    required_error: 'Sex is required',
    invalid_type_error: 'Sex must be either male or female',
  }),
  country: z
    .string({
      required_error: 'Country is required',
    })
    .length(3, 'Country code must be 3 characters (ISO 3166-1 alpha-3)')
    .regex(/^[A-Z]{3}$/, 'Country code must be uppercase letters'),
});

/**
 * Schema for relationship input validation
 */
export const relationshipInputSchema = z
  .object({
    you: personInputSchema,
    them: theirPersonInputSchema,
    relationType: relationTypeSchema,
    visitsPerYear: z
      .number()
      .int()
      .min(0, 'Visits per year cannot be negative')
      .max(365, 'Cannot exceed 365 visits per year'),
    frequencyPeriod: frequencyPeriodSchema.optional(),
    timesPerPeriod: z.number().int().min(1).optional(),
  })
  .refine(
    (data) => {
      // Ensure "you" are not older than 100 or younger than 0
      return data.you.age >= 0 && data.you.age <= 100;
    },
    {
      message: 'Your age must be between 0 and 100',
      path: ['you', 'age'],
    }
  )
  .refine(
    (data) => {
      // Logical check: for parent relations, "them" should be older
      const parentRelations = [
        'mother',
        'father',
        'grandmother_maternal',
        'grandmother_paternal',
        'grandfather_maternal',
        'grandfather_paternal',
      ];

      if (parentRelations.includes(data.relationType)) {
        return data.them.age > data.you.age;
      }
      return true;
    },
    {
      message: 'For parent/grandparent relations, they should be older than you',
      path: ['them', 'age'],
    }
  );

/**
 * Type exports for TypeScript integration
 */
export type PersonInputValidation = z.infer<typeof personInputSchema>;
export type RelationshipInputValidation = z.infer<typeof relationshipInputSchema>;
