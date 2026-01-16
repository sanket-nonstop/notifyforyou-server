export const cleanObject = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  );

export const objectValuesToPipeString = (obj: any) =>
  Object.values(obj)
    .filter((value) => value !== undefined)
    .join("|");

export const formatRemainingTime = (ms: number): string => {
  const minutes = Math.ceil(ms / 60000);

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours > 1 ? "s" : ""}`;
};

export const removeDuplicates = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};
