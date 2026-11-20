export const getPageCount = (total: number, take: number): number =>
  Math.max(1, Math.ceil(total / take));

/** Zero-based page index, pulled back inside the range that `total` still covers. */
export const clampPage = (page: number, total: number, take: number): number =>
  Math.min(Math.max(0, page), getPageCount(total, take) - 1);
