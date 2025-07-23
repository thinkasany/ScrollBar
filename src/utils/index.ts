export const isNumber = (val: any): val is number => typeof val === 'number';
export const isString = (val: any): val is string => typeof val === 'string';

export function isObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object';
}

export const isStringNumber = (val: string): boolean => {
  if (!isString(val)) {
    return false;
  }
  return !Number.isNaN(Number(val));
};

export function addUnit(value?: string | number, defaultUnit = 'px') {
  if (!value) return '';
  if (isNumber(value) || isStringNumber(value)) {
    return `${value}${defaultUnit}`;
  } else if (isString(value)) {
    return value;
  }
  console.error('binding value must be a string or number');
}
export function isClient() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
