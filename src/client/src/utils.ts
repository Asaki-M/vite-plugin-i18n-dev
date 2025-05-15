import type { TreeItem } from './data.d'
export const VITE_PLUGIN_I18N_DEV_KEY_PREFIX = 'vite-plugin-i18n-dev'

type LanguageData = {
  [key: string]: string | LanguageData;
}

type I18nData = {
  [locale: string]: LanguageData;
}

type TransformedI18nData = {
  [key: string]: string | {
    [locale: string]: string;
  } | TransformedI18nData;
}

export const formatI18nData = (data: I18nData): TransformedI18nData => {
  const locales = Object.keys(data);

  // 递归处理对象
  const processObject = (objects: { [locale: string]: LanguageData | string | undefined }): TransformedI18nData => {
    const result: TransformedI18nData = {};

    // 如果所有值都是字符串，则返回语言映射
    if (Object.values(objects).every(value => typeof value === 'string' || value === undefined)) {
      const languageMap: { [locale: string]: string } = {};
      locales.forEach(locale => {
        languageMap[locale] = (objects[locale] as string) || '';
      });
      return languageMap;
    }

    // 获取所有可能的键
    const allKeys = new Set<string>();
    Object.values(objects).forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => allKeys.add(key));
      }
    });

    // 递归处理每个键
    Array.from(allKeys).forEach(key => {
      const nextLevel: { [locale: string]: any } = {};
      locales.forEach(locale => {
        const obj = objects[locale];
        if (obj && typeof obj === 'object') {
          nextLevel[locale] = obj[key];
        }
      });
      result[key] = processObject(nextLevel);
    });

    return result;
  };

  // 开始处理
  const initialObjects: { [locale: string]: LanguageData } = {};
  locales.forEach(locale => {
    if (data[locale]) {
      initialObjects[locale] = data[locale];
    }
  });

  return processObject(initialObjects);
};

export const formatJsonToTreeItems = (json: Record<string, any>, parentKey: string = ''): TreeItem[] => {
  return Object.entries(json).map(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      const isLanguageValueObject = Object.keys(value).every(k =>
        typeof value[k] === 'string' || value[k] === ''
      );

      if (isLanguageValueObject) {
        return {
          title: key,
          key: key,
          fullKey: fullKey,
          ...value,
          children: undefined
        };
      }
      return {
        title: key,
        key: key,
        fullKey: fullKey,
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