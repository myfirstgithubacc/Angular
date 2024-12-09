export interface Idropdown {
  Text: string;
  Value: string;
}

export interface dropdownModel extends Idropdown{
  disabled?: false;
  group?: string;
  selected?: boolean;
  items?: dropdownModel[];
}

export type DynamicObject = Record<string, unknown>; 
export interface dropdownWithExtras extends Idropdown {
  TextLocalizedKey?: string;
  IsSelected?: boolean;
  [key: string]: any;
}


