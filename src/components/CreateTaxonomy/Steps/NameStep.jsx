import { Fragment, useEffect } from 'react';
import { useSnapshot } from 'valtio';

import { TextInput } from '@components/TextInput';

import { globalTaxState, createWizardState } from '../state';

const handleNameChange = (event) => {
  globalTaxState.name = event.target.value;
};

const handleDescriptionChange = (event) => {
  globalTaxState.description = event.target.value;
};

export const NameStep = () => {
  const { name, description } = useSnapshot(globalTaxState);

  useEffect(() => {
    createWizardState.nextStepDisabled = !name;
  }, [name]);

  return (
    <Fragment>
      <TextInput
        value={name}
        onChange={handleNameChange}
        label="Name Taxonomy Type"
        className="mb-4"
      />
      <TextInput
        value={description}
        onChange={handleDescriptionChange}
        label="Description"
      />
    </Fragment>
  );
};
