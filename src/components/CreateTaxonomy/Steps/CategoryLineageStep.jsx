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

import XMarkIcon from '@icons/XMark';
import ChevronRightIcon from '@icons/ChevronRight';
import TrashIcon from '@icons/Trash';

import { globalTaxState, createWizardState } from '../state';
import styles from './CategoryLineageStep.module.css';

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
    item: { id: category.id, name: category.name },
  }));

  const [collectedDrop, drop] = useDrop(() => ({
    accept: dragId,
    collect: (monitor) => ({ hovered: monitor.isOver() }),
    drop: (item) => {
      if (item.id !== category.id) {
        console.log(
          `You dropped "${item.name} (ID: ${item.id})" onto "${category.name} (ID: ${category.id})"`
        );
      }
    },
  }));

  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const nextDepth = depth + 1;
  const isBottom = depth === 0;
  const isChecked = selectedCategories.includes(category.id);

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
    if (isChecked) {
      globalTaxState.selectedCategories =
        globalTaxState.selectedCategories.filter((id) => id !== category.id);
    } else {
      globalTaxState.selectedCategories.push(category.id);
    }
  };

  const handleDeleteClick = () => {
    deleteCategory(category.id);
  };

  return (
    <div
      ref={rowRef}
      className={clsx('min-w-fit', {
        'border-l-4 border-zinc-400': isBottom && isExpanded,
        'border-l-4 border-transparent': isBottom && !isExpanded,
        'bg-emerald-50': isChecked,
        'bg-zinc-100': collectedDrop.hovered,
      })}
    >
      <div ref={drop} className="flex items-center gap-4 p-2">
        <div className="relative">
          {!isBottom && (
            <div className={clsx('__border-color', styles.hierarchyLine)}></div>
          )}
          <CheckBox value={isChecked} onChange={handleCheckBoxChange} />
        </div>
        <div
          ref={drag}
          className="bg-zinc-100 border border-zinc-400 rounded px-2 py-1 flex items-center gap-2"
          {...collectedDrag}
        >
          <div>
            {category.name} (ID: {category.id})
          </div>
          <button className="__icon-button" onClick={handleDeleteClick}>
            <XMarkIcon />
          </button>
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
  const { categories, selectedCategories } = useSnapshot(globalTaxState);
  const [category, setCategory] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    createWizardState.nextStepDisabled = categories.length === 0;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchValue) {
      return categories;
    }

    const lowerSearch = searchValue.toLowerCase();
    return recurseCategories(categories, (category) =>
      getSearchedCategory(category, lowerSearch)
    );
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

    const foundCategory = data.find(({ id }) => id === value.id);
    // TODO?: recursive duplicate checking
    if (!globalTaxState.categories.find(({ id }) => id === foundCategory.id)) {
      globalTaxState.categories =
        globalTaxState.categories.concat(foundCategory);
    }
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <Fragment>
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
              onClick={deleteSelectedCategories}
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
              <div className="border border-zinc-300">
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

function getCategoryCount(categories) {
  if (categories.length === 0) {
    return 0;
  }

  return categories.reduce((result, category) => {
    if (category.children) {
      result += getCategoryCount(category.children);
    }

    return result + 1;
  }, 0);
}

function deleteCategory(categoryId) {
  const { selectedCategories, categories } = globalTaxState;

  globalTaxState.categories = recurseCategories(categories, (category) =>
    getDeletedCategory(category, [categoryId])
  );
  globalTaxState.selectedCategories = selectedCategories.filter(
    (id) => id !== categoryId
  );
}

function deleteSelectedCategories() {
  const { selectedCategories, categories } = globalTaxState;

  if (selectedCategories.length > 0) {
    globalTaxState.categories = recurseCategories(categories, (category) =>
      getDeletedCategory(category, selectedCategories)
    );
    globalTaxState.selectedCategories = [];
  }
}

function recurseCategories(categories, operation) {
  return categories.reduce((result, category) => {
    const value = operation(category);

    if (value) {
      result.push(value);
    }

    return result;
  }, []);
}

function getSearchedCategory(category, value) {
  const { id, name, children, ...other } = category;
  const selfMatch =
    id.toLowerCase().includes(value) || name.toLowerCase().includes(value);
  const result = { id, name, ...other };

  if (children) {
    result.children = recurseCategories(children, (child) =>
      getSearchedCategory(child, value)
    );

    if (result.children.length === 0) {
      delete result.children;
    }
  }

  if (selfMatch || result.children) {
    return result;
  }

  return null;
}

function getDeletedCategory(category, ids) {
  const { id, name, children, ...other } = category;
  const result = { id, name, ...other };

  if (ids.includes(id)) {
    return null;
  }

  if (children) {
    result.children = recurseCategories(children, (child) =>
      getDeletedCategory(child, ids)
    );

    if (result.children.length === 0) {
      delete result.children;
    }
  }

  return result;
}

function getCategory(category, id) {
  if (category.id === id) {
    return category;
  }

  if (category.children) {
    for (let i = 0; i < category.children.length; i++) {
      const childResult = getCategory(category.children[i]);

      if (childResult) {
        return childResult;
      }
    }
  }

  return null;
}
