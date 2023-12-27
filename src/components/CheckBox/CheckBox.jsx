import React from 'react';
import clsx from 'clsx';

import CheckMarkIcon from '@icons/CheckMark';

export const CheckBox = ({ value, onChange, disabled }) => (
  <label
    className={clsx(
      'w-5 h-5 flex justify-center items-center border-2 overflow-hidden rounded flex-shrink-0 transition-all',
      {
        'opacity-50': disabled,
        'hover:opacity-50 cursor-pointer': !disabled,
        'bg-emerald-600 border-transparent': value,
        '__border-color': !value
      }
    )}
  >
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="sr-only"
      type="checkbox"
    />
    <span className={clsx('text-white', { block: value, hidden: !value })}>
      <CheckMarkIcon className="w-5 h-5" />
    </span>
  </label>
);
