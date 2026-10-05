/**
 * @file src/utils/formatters.ts
 * Number & String Formatting Utility Functions
 */

export const formatPercentage = (val: number, decimals = 1): string => {
  return `${val.toFixed(decimals)}%`;
};

export const formatMicros = (val: number): string => {
  return `${val.toFixed(1)} μs`;
};

export const truncateHash = (hash: string, lead = 6, tail = 4): string => {
  if (hash.length <= lead + tail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-tail)}`;
};
