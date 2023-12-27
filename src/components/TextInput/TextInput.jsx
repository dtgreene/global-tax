import { forwardRef } from 'react';
import clsx from 'clsx';

export const TextInput = forwardRef(
  (
    {
      value,
      onChange,
      placeholder,
      disabled,
      className,
      label,
      type = 'text',
      inputProps = {},
    },
    ref
  ) => {
    const { className: inputClassName, ...otherInputProps } = inputProps;

    return (
      <div className={className}>
        {label && <label className="mb-1 block">{label}</label>}
        <div className="relative">
          <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            ref={ref}
            className={clsx(
              'bg-transparent rounded px-3 py-2 border-2 __border-color transition-opacity w-[300px]',
              { 'opacity-50': disabled, 'hover:opacity-75': !disabled },
              inputClassName
            )}
            type={type}
            {...otherInputProps}
          />
        </div>
      </div>
    );
  }
);
