import { Fragment, useEffect, useState } from 'react';
import {
  useFloating,
  useDismiss,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import clsx from 'clsx';

import { TextInput } from '../TextInput';

const AutoCompleteOption = ({ children, className, ...otherProps }) => (
  <div
    className={clsx('p-2 cursor-pointer w-[300px]', className)}
    {...otherProps}
  >
    {children}
  </div>
);

const filterOptions = (options, searchValue) => {
  const lowerSearch = searchValue.toLowerCase();
  return options.filter((option) =>
    option.name.toLowerCase().includes(lowerSearch)
  );
};

export const AutoComplete = ({
  value,
  onChange,
  options,
  className,
  ...otherProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
  });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context);

  useEffect(() => {
    if (value) {
      setSearchValue(value.name);
    }
  }, [value]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const inputProps = { onFocus: handleFocus };
  const filteredOptions = searchValue
    ? filterOptions(options, searchValue)
    : options;

  return (
    <div className={className}>
      <TextInput
        ref={refs.setReference}
        value={searchValue}
        onChange={handleSearchChange}
        inputProps={inputProps}
        {...otherProps}
        {...getReferenceProps()}
      />
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="z-10"
        {...getFloatingProps()}
      >
        {isMounted && (
          <div
            className="border bg-white rounded shadow max-h-[300px] overflow-y-auto"
            style={transitionStyles}
          >
            {filteredOptions.length === 0 && (
              <AutoCompleteOption>No options found</AutoCompleteOption>
            )}
            {filteredOptions.map((option) => (
              <AutoCompleteOption
                className="hover:bg-zinc-100 transition-colors"
                onClick={() => handleOptionClick(option)}
                key={option.id}
              >
                <div className="font-bold">{option.name}</div>
                <div className="__text-muted">{option.description}</div>
              </AutoCompleteOption>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
