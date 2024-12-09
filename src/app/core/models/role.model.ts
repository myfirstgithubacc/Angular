import { ToJson } from "./responseTypes/to-json.model";

export class Role extends ToJson{

  id: string| undefined| null;
  roleNo : number| undefined| null;
  roleName: string| undefined| null;
  roleGroupId: number| undefined| null;
  roleCode : string| undefined| null;
  roleGroupName: string| undefined| null;
  Disabled: boolean| undefined| null;
  createdBy: number| undefined| null;
  createdOn: Date| undefined| null;
  lastModifiedBy: number| undefined| null;
  lastModifiedOn: Date| any | undefined| null;
  createdByUserName: string| undefined| null;
  lastModifiedByUserName: string| undefined| null;

  constructor(init?: Partial<Role>) {
    super();
    let a = Object.assign(this, init);
}
}
