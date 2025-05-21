export interface TreeItem {
  id: string
  title: string
  key: string
  fullKey: string
  children?: TreeItem[]
  [key: string]: string | TreeItem[] | undefined
}
