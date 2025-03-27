/**
 * Formats list response with pagination metadata
 */
export const formatListResponse = <T extends { id: number }>(list: T[], total: number, limit: number) => {
  let nextCursor: number | undefined;

  if (list.length > limit) {
    const nextItem = list.pop();
    nextCursor = nextItem?.id;
  }

  return {
    data: list,
    meta: { total, nextCursor },
  };
};
