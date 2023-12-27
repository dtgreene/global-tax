import { Fragment } from 'react';
import clsx from 'clsx';

import CheckMarkIcon from '@icons/CheckMark';

const StepperStep = ({ value, label, currentStep }) => (
  <div className="relative">
    <div
      className={clsx(
        'flex justify-center items-center text-white rounded-full w-[25px] h-[25px]',
        {
          'bg-emerald-600': value <= currentStep,
          'bg-zinc-300 text-zinc-600': value > currentStep,
        }
      )}
    >
      {value < currentStep ? <CheckMarkIcon /> : value + 1}
    </div>
    <div className="absolute -bottom-[25px] left-1/2 whitespace-nowrap -translate-x-1/2">
      {label}
    </div>
  </div>
);

export const Stepper = ({ className, steps, currentStep }) => {
  const lastIndex = steps.length - 1;

  return (
    <div className={clsx('flex items-center', className)}>
      {steps.map(({ label }, index) => (
        <Fragment key={label}>
          <StepperStep label={label} value={index} currentStep={currentStep} />
          {index !== lastIndex && (
            <div className="border-b border-b-zinc-300 w-[150px] h-[1px]"></div>
          )}
        </Fragment>
      ))}
    </div>
  );
};
