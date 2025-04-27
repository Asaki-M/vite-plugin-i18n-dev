export const changeByPath = (obj: any, fullKey: string, value: string) => {
  const keys = fullKey.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

export const deleteByPath = (obj: any, fullKey: string) => {
  const keys = fullKey.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) return;
    current = current[keys[i]];
  }
  const currentValue = current[keys[keys.length - 1]];
  delete current[keys[keys.length - 1]];
  return currentValue;
}

