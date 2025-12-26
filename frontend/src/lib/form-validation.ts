export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean | string; // Can return error message
  message: string;
  validateOnBlur?: boolean; // Only validate on blur
  validateOnChange?: boolean; // Validate on change
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  error: string;
  isDirty: boolean;
}

export interface FieldValidationState {
  value: string;
  error: string;
  touched: boolean;
  isValid: boolean;
}

export function validateField(
  value: string,
  rules: ValidationRule[],
  options?: { skipRequired?: boolean }
): ValidationResult {
  const skipRequired = options?.skipRequired || false;
  
  for (const rule of rules) {
    if (rule.required && !skipRequired && !value.trim()) {
      return { isValid: false, error: rule.message, isDirty: true };
    }
    if (rule.minLength && value.length > 0 && value.length < rule.minLength) {
      return { isValid: false, error: rule.message, isDirty: true };
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return { isValid: false, error: rule.message, isDirty: true };
    }
    if (rule.pattern && value.length > 0 && !rule.pattern.test(value)) {
      return { isValid: false, error: rule.message, isDirty: true };
    }
    if (rule.custom && value.length > 0) {
      const result = rule.custom(value);
      if (result === false) {
        return { isValid: false, error: rule.message, isDirty: true };
      }
      if (typeof result === 'string') {
        return { isValid: false, error: result, isDirty: true };
      }
    }
  }
  return { isValid: true, error: '', isDirty: value.length > 0 };
}

/**
 * Validate entire form
 */
export function validateForm(
  formData: Record<string, string>,
  rules: ValidationRules
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = formData[field] || '';
    const result = validateField(value, fieldRules);
    if (!result.isValid) {
      errors[field] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Real-time validation hook
 */
export function useFieldValidation(
  initialValue: string,
  rules: ValidationRule[],
  options?: { validateOnChange?: boolean; validateOnBlur?: boolean }
) {
  const [value, setValue] = React.useState(initialValue);
  const [touched, setTouched] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isValid, setIsValid] = React.useState(false);

  const validate = React.useCallback(
    (val: string, skipRequired = false) => {
      const result = validateField(val, rules, { skipRequired });
      setError(result.error);
      setIsValid(result.isValid);
      return result;
    },
    [rules]
  );

  const handleChange = React.useCallback(
    (newValue: string) => {
      setValue(newValue);
      if (options?.validateOnChange && (touched || newValue.length > 0)) {
        validate(newValue, !touched);
      }
    },
    [touched, validate, options]
  );

  const handleBlur = React.useCallback(() => {
    setTouched(true);
    if (options?.validateOnBlur !== false) {
      validate(value);
    }
  }, [value, validate, options]);

  React.useEffect(() => {
    if (touched || value.length > 0) {
      validate(value, !touched);
    }
  }, [value, touched, validate]);

  return {
    value,
    error,
    touched,
    isValid,
    setValue: handleChange,
    onBlur: handleBlur,
    validate: () => validate(value),
  };
}

// Fix React import
import React from 'react'

export const commonValidationRules = {
  email: [
    { required: true, message: 'Email is required' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 6, message: 'Password must be at least 6 characters' }
  ],
  name: [
    { required: true, message: 'Name is required' },
    { minLength: 2, message: 'Name must be at least 2 characters' }
  ],
  birthDate: [
    { required: true, message: 'Birth date is required' },
    {
      custom: (value: string) => {
        if (!value) return false;
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      },
      message: 'You must be at least 13 years old'
    }
  ]
};

