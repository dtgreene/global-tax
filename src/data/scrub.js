function getId() {
  return '_' + Math.random().toString(36).slice(2, 9);
}

function scrub(input) {
  let idMap = {};
  let lineageMap = {};

  function recurse(json) {
    return json.map((data) => {
      const {
        id,
        parent_id,
        name,
        status,
        category_type,
        level,
        children_count,
        url_slug,
        children,
        lineage,
        ancestors,
      } = data;

      const mappedId = idMap[id] ?? getId();
      const mappedParentId = parent_id === 0 ? 0 : idMap[parent_id];

      if (mappedParentId === undefined) {
        throw new Error(`Missing parent id: ${parent_id}`);
      }

      idMap[id] = mappedId;
      lineageMap[`${id}_${name}`] = `${mappedId}_${name}`;

      const result = {
        id: mappedId,
        parent_id: mappedParentId,
        name,
        status,
        category_type,
        level,
        children_count,
        url_slug,
      };

      if (children) {
        result.children = recurse(children, idMap);
      }

      if (lineage) {
        result.lineage = lineage
          .split('>')
          .map((value) => {
            const trimmed = value.trim();
            if (trimmed === '>') {
              return trimmed;
            } else if (lineageMap[trimmed] === undefined) {
              throw new Error(`Missing lineage: ${trimmed}`);
            } else {
              return lineageMap[trimmed];
            }
          })
          .join(' ');
      }

      if (ancestors) {
        result.ancestors = ancestors.map((ancestor) => {
          if (!idMap[ancestor]) {
            throw new Error(`Missing ancestor: ${ancestor}`);
          }

          return idMap[ancestor];
        });
      }

      return result;
    });
  }

  console.log(recurse(input));
}
