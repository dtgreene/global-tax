import { proxy } from 'valtio';

export const globalTaxState = proxy({
  name: '',
  description: '',
  categories: [],
  selectedCategories: [],
  pendingMove: null,
  showPendingMove: false
});

export const createWizardState = proxy({
  currentStep: 1,
  nextStepDisabled: false,
});
