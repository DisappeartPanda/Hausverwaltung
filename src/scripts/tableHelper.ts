export const compareValues = (a: any, b: any) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;

  const aDate = Date.parse(a);
  const bDate = Date.parse(b);
  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) return aDate - bDate;

  return String(a).localeCompare(String(b), 'de', { sensitivity: 'base' });
};

export const makeSorter = (initialKey: string, initialDir: 'asc' | 'desc' = 'asc') => {
  let sortKey = initialKey;
  let sortDir = initialDir;

  return {
    getState: () => ({ sortKey, sortDir }),
    sortRows: <T extends Record<string, any>>(rows: T[], key: string) => {
      if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else {
        sortKey = key;
        sortDir = 'asc';
      }

      return [...rows].sort((a, b) => {
        const result = compareValues(a[sortKey], b[sortKey]);
        return sortDir === 'asc' ? result : -result;
      });
    }
  };
};