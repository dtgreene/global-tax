import { proxy } from 'valtio';

export const globalTaxState = proxy({
  name: '',
  description: '',
  categories: [],
  selectedCategories: [],
});

export const createWizardState = proxy({
  currentStep: 1,
  nextStepDisabled: false,
});
