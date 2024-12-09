export interface IActionSetModel {
  Status: string | number | boolean,
  Items:IActionModel[]
  // Items:
}

export interface IActionModel {
  title:string
  // eslint-disable-next-line @typescript-eslint/ban-types
  fn: Function,
  icon:string,
  color?:string
}

