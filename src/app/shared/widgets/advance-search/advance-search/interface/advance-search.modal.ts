export interface advancesearch {
  control: string;
  controlName: string;
  label: string;
  list?: list[];
  switchbtnText?: switchButton;
  selected?:any;
  controlName2?: string;
}
interface list {
  Text: string;
  Value: string;
}
interface switchButton {
  onLabel: string;
  offLabel: string;
}
