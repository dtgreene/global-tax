import { Wizard } from '../Wizard';
import { NameStep, CategoryLineageStep } from './Steps';
import { createWizardState } from './state';

const steps = [
  {
    label: 'Name',
    component: NameStep,
  },
  {
    label: 'Category Lineages',
    component: CategoryLineageStep,
  },
  {
    label: 'Retailers',
    component: () => <div>Nothing to see here</div>,
  },
  {
    label: 'Review',
    component: () => <div>Nothing to see here</div>,
  },
];

export const CreateTaxonomy = () => {
  const handleCancel = () => {};
  const handleSave = () => {};

  return (
    <Wizard
      state={createWizardState}
      title="Create a new taxonomy type"
      steps={steps}
      className="h-[100vh]"
      onCancel={handleCancel}
      onSave={handleSave}
    />
  );
};
