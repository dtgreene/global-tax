import clsx from 'clsx';
import { useSnapshot } from 'valtio';

import ChevronLeftIcon from '@icons/ChevronLeft';
import ChevronRightIcon from '@icons/ChevronRight';

import { Button } from '../Button';
import { Stepper } from '../Stepper';

export const Wizard = ({
  state,
  title,
  steps,
  className,
  onCancel,
  onSave,
}) => {
  const { currentStep, nextStepDisabled } = useSnapshot(state);

  const handlePrevClick = () => {
    state.currentStep = Math.max(0, currentStep - 1);
  };

  const handleNextClick = () => {
    state.currentStep = Math.min(steps.length - 1, currentStep + 1);
  };

  const StepComponent = steps[currentStep].component;
  const prevStep = steps[currentStep - 1];
  const nextStep = steps[currentStep + 1];

  return (
    <div className={clsx('flex flex-col', className)}>
      <div className="flex flex-col items-center py-4 border-b border-b-zinc-300">
        <div className="mb-4">{title}</div>
        <Stepper className="mb-10" steps={steps} currentStep={currentStep} />
      </div>
      <div className="p-8 flex-1 overflow-hidden flex flex-col">
        {StepComponent ? <StepComponent /> : 'Invalid step component'}
      </div>
      <div className="p-8 border-t border-zinc-300 flex justify-between">
        <div className="flex gap-4">
          {prevStep && (
            <Button
              variant="outlined"
              onClick={handlePrevClick}
              className="flex gap-2 items-center"
            >
              <ChevronLeftIcon />
              {prevStep.label}
            </Button>
          )}
          <Button variant="link" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <div className="flex gap-4">
          <Button variant="outlined" onClick={onSave}>
            Save and exit
          </Button>
          {nextStep && (
            <Button
              variant="primary"
              onClick={handleNextClick}
              disabled={nextStepDisabled}
              className="flex gap-2 items-center"
            >
              {nextStep.label}
              <ChevronRightIcon />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
