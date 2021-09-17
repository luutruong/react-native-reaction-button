export function isValidObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object';
}

export function isNumber(val: any): boolean {
  return typeof val === 'number';
}
