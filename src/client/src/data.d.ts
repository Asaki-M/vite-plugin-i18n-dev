export interface TreeItem {
  title: string
  key: string
  fullKey: string
  children?: TreeItem[]
  [key: string]: string
}
