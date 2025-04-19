import type { TreeItem } from "./components/TreeJSON";

export const formatJsonToTreeItems = (json: Record<string, any>, parentKey: string = ''): TreeItem[] => {
  return Object.entries(json).map(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      return {
        title: key,
        key: key,
        fullKey: fullKey,
        value: '',
        children: formatJsonToTreeItems(value, fullKey)
      };
    }

    return {
      title: key,
      key: key,
      fullKey: fullKey,
      value: String(value),
      children: undefined
    };
  });
};