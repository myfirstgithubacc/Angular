export class ManageGridData {
  static readonly type = '[ManageGridData] ManageGridData';
  constructor(public entityId: any, public gridData: any) { }
}

export class GetGridData {
  static readonly type = '[GetGridData] GetGridData';
  constructor(public entityId: any) { }
}