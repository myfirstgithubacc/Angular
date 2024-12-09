export interface IMassActionButton {
  tabName: string,
  button: IMassButton[]
}

export interface IMassButton {
  id: string | number,
  icon: string,
  title: string,
  isActiveType: boolean,
  color : string
}

export interface IMassAction {
  'actionName': string,
  'rowIds': string[],
  'clickedTabName': string
}

