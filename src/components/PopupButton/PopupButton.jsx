import { Fragment, useState } from 'react';
import clsx from 'clsx';
import {
  useFloating,
  useDismiss,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';

export const PopupButton = ({ className, content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'absolute',
  });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context);

  const handleButtonClick = () => {
    setIsOpen(true);
  };

  const handleMenuClick = () => {
    // "Catch" the bubbling up click events to close the menu when an option is
    // clicked.
    setIsOpen(false);
  };

  return (
    <Fragment>
      <button
        ref={refs.setReference}
        className={className}
        onClick={handleButtonClick}
        {...getReferenceProps()}
      >
        {content}
      </button>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="z-10"
        {...getFloatingProps()}
      >
        {isMounted && (
          <div
            className="border bg-white rounded shadow overflow-y-auto"
            style={transitionStyles}
            onClick={handleMenuClick}
          >
            {children}
          </div>
        )}
      </div>
    </Fragment>
  );
};

PopupButton.Option = ({ className, children, ...otherProps }) => (
  <button
    className={clsx(
      'px-3 py-2 min-w-[200px] text-left hover:bg-zinc-100 transition-colors',
      className
    )}
    {...otherProps}
  >
    {children}
  </button>
);
