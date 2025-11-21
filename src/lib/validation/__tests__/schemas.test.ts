/**
 * Tests for Zod validation schemas
 */

import {
  personInputSchema,
  frequencyPeriodSchema,
  relationTypeSchema,
  timesPerPeriodSchema,
  relationshipInputSchema,
} from '../schemas';

describe('validation schemas', () => {
  describe('personInputSchema', () => {
    it('should validate correct person input', () => {
      const validInput = {
        age: 30,
        sex: 'female' as const,
        country: 'CHL',
      };

      const result = personInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject negative age', () => {
      const invalidInput = {
        age: -5,
        sex: 'female' as const,
        country: 'CHL',
      };

      const result = personInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 0');
      }
    });

    it('should reject age over 100', () => {
      const invalidInput = {
        age: 101,
        sex: 'male' as const,
        country: 'USA',
      };

      const result = personInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('cannot exceed 100');
      }
    });

    it('should reject fractional ages', () => {
      const invalidInput = {
        age: 30.5,
        sex: 'female' as const,
        country: 'CHL',
      };

      const result = personInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('whole number');
      }
    });

    it('should reject invalid sex', () => {
      const invalidInput = {
        age: 30,
        sex: 'other',
        country: 'CHL',
      };

      const result = personInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid country code format', () => {
      const invalidInput = {
        age: 30,
        sex: 'female' as const,
        country: 'US', // Too short
      };

      const result = personInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject lowercase country code', () => {
      const invalidInput = {
        age: 30,
        sex: 'female' as const,
        country: 'chl',
      };

      const result = personInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const invalidInput = {
        age: 30,
        // missing sex and country
      };

      const result = personInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('frequencyPeriodSchema', () => {
    it('should accept valid frequency periods', () => {
      expect(frequencyPeriodSchema.safeParse('weekly').success).toBe(true);
      expect(frequencyPeriodSchema.safeParse('monthly').success).toBe(true);
      expect(frequencyPeriodSchema.safeParse('quarterly').success).toBe(true);
      expect(frequencyPeriodSchema.safeParse('yearly').success).toBe(true);
    });

    it('should reject invalid frequency periods', () => {
      expect(frequencyPeriodSchema.safeParse('daily').success).toBe(false);
      expect(frequencyPeriodSchema.safeParse('biweekly').success).toBe(false);
      expect(frequencyPeriodSchema.safeParse('').success).toBe(false);
    });
  });

  describe('relationTypeSchema', () => {
    it('should accept all valid relation types', () => {
      const validTypes = [
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
      ];

      validTypes.forEach((type) => {
        const result = relationTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid relation types', () => {
      const invalidTypes = ['parent', 'sibling', 'cousin', ''];

      invalidTypes.forEach((type) => {
        const result = relationTypeSchema.safeParse(type);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('timesPerPeriodSchema', () => {
    it('should accept valid times per period for weekly', () => {
      const valid = { period: 'weekly' as const, times: 3 };
      expect(timesPerPeriodSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject times exceeding weekly maximum (7)', () => {
      const invalid = { period: 'weekly' as const, times: 8 };
      const result = timesPerPeriodSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('weekly');
        expect(result.error.errors[0].message).toContain('7');
      }
    });

    it('should accept valid times per period for monthly', () => {
      const valid = { period: 'monthly' as const, times: 15 };
      expect(timesPerPeriodSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject times exceeding monthly maximum (31)', () => {
      const invalid = { period: 'monthly' as const, times: 32 };
      expect(timesPerPeriodSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject zero times', () => {
      const invalid = { period: 'monthly' as const, times: 0 };
      const result = timesPerPeriodSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 1');
      }
    });

    it('should reject negative times', () => {
      const invalid = { period: 'quarterly' as const, times: -1 };
      expect(timesPerPeriodSchema.safeParse(invalid).success).toBe(false);
    });

    it('should accept maximum for each period', () => {
      expect(timesPerPeriodSchema.safeParse({ period: 'weekly', times: 7 }).success).toBe(true);
      expect(timesPerPeriodSchema.safeParse({ period: 'monthly', times: 31 }).success).toBe(true);
      expect(timesPerPeriodSchema.safeParse({ period: 'quarterly', times: 90 }).success).toBe(true);
      expect(timesPerPeriodSchema.safeParse({ period: 'yearly', times: 365 }).success).toBe(true);
    });
  });

  describe('relationshipInputSchema', () => {
    const validInput = {
      you: { age: 30, sex: 'female' as const, country: 'CHL' },
      them: { age: 55, sex: 'female' as const, country: 'CHL' },
      relationType: 'mother' as const,
      visitsPerYear: 12,
      frequencyPeriod: 'monthly' as const,
      timesPerPeriod: 1,
    };

    it('should validate correct relationship input', () => {
      const result = relationshipInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject if your age exceeds 100', () => {
      const invalid = {
        ...validInput,
        you: { ...validInput.you, age: 101 },
      };

      const result = relationshipInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept their age up to 100', () => {
      const valid = {
        ...validInput,
        them: { ...validInput.them, age: 100 },
        relationType: 'friend' as const, // Not parent, so age check won't apply
      };

      const result = relationshipInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject if their age exceeds 100', () => {
      const invalid = {
        ...validInput,
        them: { ...validInput.them, age: 101 },
      };

      const result = relationshipInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject negative visits per year', () => {
      const invalid = {
        ...validInput,
        visitsPerYear: -5,
      };

      const result = relationshipInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject visits per year exceeding 365', () => {
      const invalid = {
        ...validInput,
        visitsPerYear: 400,
      };

      const result = relationshipInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    describe('parent/grandparent age logic', () => {
      it('should reject mother younger than you', () => {
        const invalid = {
          ...validInput,
          you: { ...validInput.you, age: 40 },
          them: { ...validInput.them, age: 35 },
          relationType: 'mother' as const,
        };

        const result = relationshipInputSchema.safeParse(invalid);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toContain('older than you');
        }
      });

      it('should reject father same age as you', () => {
        const invalid = {
          ...validInput,
          you: { ...validInput.you, age: 30 },
          them: { ...validInput.them, age: 30 },
          relationType: 'father' as const,
        };

        const result = relationshipInputSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });

      it('should allow partner same age or younger', () => {
        const valid = {
          ...validInput,
          you: { ...validInput.you, age: 30 },
          them: { ...validInput.them, age: 28 },
          relationType: 'partner' as const,
        };

        const result = relationshipInputSchema.safeParse(valid);
        expect(result.success).toBe(true);
      });

      it('should allow friend older or younger', () => {
        const validOlder = {
          ...validInput,
          you: { ...validInput.you, age: 30 },
          them: { ...validInput.them, age: 50 },
          relationType: 'friend' as const,
        };

        const validYounger = {
          ...validInput,
          you: { ...validInput.you, age: 50 },
          them: { ...validInput.them, age: 30 },
          relationType: 'friend' as const,
        };

        expect(relationshipInputSchema.safeParse(validOlder).success).toBe(true);
        expect(relationshipInputSchema.safeParse(validYounger).success).toBe(true);
      });

      it('should validate all grandparent types', () => {
        const grandparentTypes = [
          'grandmother_maternal',
          'grandmother_paternal',
          'grandfather_maternal',
          'grandfather_paternal',
        ] as const;

        grandparentTypes.forEach((type) => {
          const valid = {
            ...validInput,
            you: { ...validInput.you, age: 30 },
            them: { ...validInput.them, age: 75 },
            relationType: type,
          };

          expect(relationshipInputSchema.safeParse(valid).success).toBe(true);

          const invalid = {
            ...validInput,
            you: { ...validInput.you, age: 30 },
            them: { ...validInput.them, age: 25 },
            relationType: type,
          };

          expect(relationshipInputSchema.safeParse(invalid).success).toBe(false);
        });
      });
    });

    it('should allow optional frequency fields', () => {
      const withoutOptional = {
        you: { age: 30, sex: 'female' as const, country: 'CHL' },
        them: { age: 55, sex: 'female' as const, country: 'CHL' },
        relationType: 'mother' as const,
        visitsPerYear: 12,
      };

      expect(relationshipInputSchema.safeParse(withoutOptional).success).toBe(true);
    });
  });
});
