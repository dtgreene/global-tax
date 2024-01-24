import { Fragment, useEffect, useRef, useState, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import clsx from 'clsx';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Beer from '@data/beer.json';
import Wine from '@data/wine.json';

import { AutoComplete } from '@components/AutoComplete';
import { CheckBox } from '@components/CheckBox';
import { TextInput } from '@components/TextInput';

import EllipsisVerticalIcon from '@icons/EllipsisVertical';
import ChevronRightIcon from '@icons/ChevronRight';
import TrashIcon from '@icons/Trash';

import { globalTaxState, createWizardState } from '../state';
import styles from './CategoryLineageStep.module.css';
import { PopupButton } from '@src/components/PopupButton';
import { ConfirmModal } from '@src/components/ConfirmModal';

const dragId = 'category-row';
const data = Beer.concat(Wine);
const options = data.map(({ name, id, category_type }) => ({
  name,
  id,
  description: category_type,
}));

const CategoryRow = ({ category, depth = 0 }) => {
  const rowRef = useRef();
  const expandRef = useRef();
  const [isExpanded, setIsExpanded] = useState(false);
  const [childrenMargin, setChildrenMargin] = useState(0);
  const { selectedCategories } = useSnapshot(globalTaxState);

  const [collectedDrag, drag] = useDrag(() => ({
    type: dragId,
    item: { id: category.id },
  }));

  const [collectedDrop, drop] = useDrop(() => ({
    accept: dragId,
    collect: (monitor) => ({ hovered: monitor.isOver() }),
    drop: (item) => {
      const dropCategory = getDropCategory(item, category);

      if (dropCategory) {
        const message = `Are you sure you want to make ${dropCategory.name} (ID: ${dropCategory.id}) a descendant of ${category.name} (ID: ${category.id})?`;
        globalTaxState.pendingMove = {
          from: dropCategory.id,
          to: category.id,
          message,
        };
        globalTaxState.showPendingMove = true;
      }
    },
  }));

  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const nextDepth = depth + 1;
  const isBottom = depth === 0;
  const isSelected = selectedCategories.includes(category.id);

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);

    if (rowRef.current && expandRef.current) {
      const rowRect = rowRef.current.getBoundingClientRect();
      const expandRect = expandRef.current.getBoundingClientRect();

      const checkBoxOffset = -10;
      const borderOffset = !isBottom ? 4 : 0;
      setChildrenMargin(
        expandRect.x - rowRect.x + checkBoxOffset + borderOffset
      );
    }
  };

  const handleCheckBoxChange = () => {
    const { selectedCategories } = globalTaxState;

    if (isSelected) {
      globalTaxState.selectedCategories = selectedCategories.filter(
        (id) => id !== category.id
      );
    } else {
      selectedCategories.push(category.id);
    }
  };

  const handleSelectClick = () => {
    if (!isSelected) {
      globalTaxState.selectedCategories.push(category.id);
    }
  };

  const handleSelectWithClick = () => {
    selectDescendants(category);
  };

  const handleRemoveClick = () => {
    const { categories } = globalTaxState;
    globalTaxState.categories = removeCategories(categories, [category.id]);
    deselectDeleted();
  };

  return (
    <div
      ref={rowRef}
      className={clsx('min-w-fit overflow-hidden transition-colors', {
        'border-l-4 border-zinc-400': isBottom && isExpanded,
        'border-l-4 border-transparent': isBottom && !isExpanded,
        'bg-emerald-50': isSelected,
      })}
    >
      <div ref={drop} className="flex items-center gap-4 p-2">
        <div className="relative">
          {!isBottom && (
            <div className={clsx('__border-color', styles.hierarchyLine)}></div>
          )}
          <CheckBox value={isSelected} onChange={handleCheckBoxChange} />
        </div>
        <div
          ref={drag}
          className={clsx(
            'bg-zinc-100 border border-zinc-400 rounded px-2 py-1 flex items-center gap-1 transition-colors',
            {
              'bg-zinc-300': collectedDrop.hovered,
            }
          )}
          {...collectedDrag}
        >
          <div>
            {category.name} (ID: {category.id})
          </div>
          <PopupButton
            className="__icon-button"
            content={<EllipsisVerticalIcon />}
          >
            <div className="flex flex-col">
              <PopupButton.Option onClick={handleSelectClick}>
                Select Category
              </PopupButton.Option>
              {hasChildren && (
                <PopupButton.Option onClick={handleSelectWithClick}>
                  Select Category (with descendants)
                </PopupButton.Option>
              )}
              <PopupButton.Option onClick={handleRemoveClick}>
                Remove Category {hasChildren && '(with descendants)'}
              </PopupButton.Option>
            </div>
          </PopupButton>
        </div>
        {hasChildren && (
          <button
            className="__icon-button flex items-center gap-1"
            onClick={handleExpandClick}
            ref={expandRef}
          >
            <ChevronRightIcon
              className={clsx('transition-transform w-6 h-6', {
                'rotate-90': isExpanded,
              })}
            />
            <div className="text-xs __text-muted">
              ({children.length} {children.length > 1 ? 'children' : 'child'})
            </div>
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div style={{ marginLeft: childrenMargin }}>
          {children.map((child) => (
            <CategoryRow key={child.id} category={child} depth={nextDepth} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryLineageStep = () => {
  const { categories, selectedCategories, showPendingMove, pendingMove } =
    useSnapshot(globalTaxState);
  const [category, setCategory] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    createWizardState.nextStepDisabled = categories.length === 0;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchValue) {
      return categories;
    }

    return searchCategories(categories, searchValue.toLowerCase());
  }, [categories, searchValue]);

  const metaData = useMemo(
    () => ({
      lineageCount: categories.length,
      categoryCount: getCategoryCount(categories),
    }),
    [categories]
  );

  const handleCategoryChange = (value) => {
    setCategory(value);

    const { categories } = globalTaxState;
    const foundCategory = data.find(({ id }) => id === value.id);

    if (!categories.find(({ id }) => id === foundCategory.id)) {
      globalTaxState.categories = categories.concat(foundCategory);
    }
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handlePendingMoveClose = () => {
    globalTaxState.showPendingMove = false;
  };

  const handlePendingMoveConfirm = () => {
    try {
      const {
        categories,
        pendingMove: { from, to },
      } = globalTaxState;

      const fromCategory = findCategory(categories, from);
      const parentCategory = findCategory(categories, fromCategory.parent_id);
      const toCategory = findCategory(categories, to);

      if (!fromCategory || !toCategory || !parentCategory) {
        throw new Error('Could not locate all categories');
      }

      if (toCategory.children) {
        toCategory.children.push(fromCategory);
      } else {
        toCategory.children = [fromCategory];
      }

      // Remove the child from the original parent
      parentCategory.children = parentCategory.children.filter(
        (child) => child.id !== fromCategory.id
      );
    } catch (error) {
      console.error(`DND move failed: ${error}`);
    }

    globalTaxState.showPendingMove = false;
  };

  return (
    <Fragment>
      <ConfirmModal
        active={showPendingMove}
        onClose={handlePendingMoveClose}
        onConfirm={handlePendingMoveConfirm}
      >
        {pendingMove && pendingMove.message}
      </ConfirmModal>
      <AutoComplete
        value={category}
        onChange={handleCategoryChange}
        options={options}
        placeholder="Search Taxonomy Type"
        className="mb-4"
      />
      <div className="border __border-color rounded whitespace-nowrap flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-4">
            <TextInput
              placeholder="Search Categories"
              value={searchValue}
              onChange={handleSearchChange}
            />
            <button
              className="__icon-button"
              disabled={selectedCategories.length === 0}
              // onClick={removeSelectedCategories}
            >
              <TrashIcon />
            </button>
          </div>
          <div className="flex gap-2">
            <span>{metaData.categoryCount} categories</span>
            <span>|</span>
            <span>{metaData.lineageCount} lineages</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          {filteredCategories.length === 0 ? (
            <div className="__text-muted">Nothing to see here</div>
          ) : (
            <DndProvider backend={HTML5Backend}>
              <div className="border border-zinc-300 w-min min-w-full">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border-b border-zinc-300 last:border-none even:bg-zinc-50"
                  >
                    <CategoryRow category={category} />
                  </div>
                ))}
              </div>
            </DndProvider>
          )}
        </div>
      </div>
    </Fragment>
  );
};

function getDropCategory(dropItem, toCategory) {
  // Look up the full category object from the thinner, dropped item
  const { categories } = globalTaxState;
  const dropCategory = findCategory(categories, dropItem.id);
  const isValid =
    dropCategory &&
    dropCategory.id !== toCategory.id &&
    dropCategory.parent_id !== toCategory.id &&
    !isChild(dropCategory, toCategory.id);

  // - Cant drop on self
  // - Cant drop to same parent
  // - Cant drop into own descendants

  return isValid ? dropCategory : null;
}

function isChild(category, id) {
  return Boolean(flattenCategory(category).find((child) => child.id === id));
}

function findCategory(categories, id) {
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    if (category.id === id) return category;
    if (category.children) {
      const childrenResult = findCategory(category.children, id);
      if (childrenResult) return childrenResult;
    }
  }
}

function getCategoryCount(categories) {
  if (categories.length === 0) {
    return 0;
  }

  return categories.reduce((result, current) => {
    if (current.children) {
      result += getCategoryCount(current.children);
    }

    return result + 1;
  }, 0);
}

function flattenCategory(category) {
  if (category.children) {
    return category.children.reduce(
      (result, current) => result.concat(flattenCategory(current)),
      [category]
    );
  } else {
    return [category];
  }
}

function selectDescendants(category) {
  const { selectedCategories } = globalTaxState;
  const flattenedCategory = flattenCategory(category);

  if (!selectedCategories.includes(category.id)) {
    selectedCategories.push(category.id);
  }

  flattenedCategory.forEach((child) => {
    if (!selectedCategories.includes(child.id)) {
      selectedCategories.push(child.id);
    }
  });
}

// Removes any selected categories that no longer exist
function deselectDeleted() {
  const { selectedCategories, categories } = globalTaxState;

  const flattenedCategories = categories.reduce(
    (result, category) => result.concat(flattenCategory(category)),
    []
  );

  globalTaxState.selectedCategories = selectedCategories.filter((id) =>
    flattenedCategories.find((child) => id === child.id)
  );
}

function removeCategories(categories, ids) {
  return categories.reduce((result, current) => {
    // Stop here if the current category is matched
    if (ids.includes(current.id)) return result;
    if (current.children) {
      const children = removeCategories(current.children, ids);

      if (children.length > 0) {
        result.push({ ...current, children });
      }
    } else {
      result.push(current);
    }

    return result;
  }, []);
}

function searchCategories(categories, searchValue) {
  return categories.reduce((result, current) => {
    const { id, name } = current;
    const currentMatch =
      id.toLowerCase().includes(searchValue) ||
      name.toLowerCase().includes(searchValue);

    if (current.children) {
      const children = searchCategories(current.children, searchValue);

      if (children.length > 0) {
        result.push({ ...current, children });
      }
    } else if (currentMatch) {
      result.push(current);
    }

    return result;
  }, []);
}
