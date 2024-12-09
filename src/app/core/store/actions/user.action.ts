//SECTION - To Create User............
export class AddUser {
  static readonly type = '[User] Add';
  constructor(public payload: any) { }
}

//SECTION - To Update User............
export class UpdateUser{
  static readonly type = '[User] Update';
  constructor(public payload: any, public id: any) { }
}

//SECTION - To Activate User............
export class ActivateDeactivateUser {
  static readonly type = '[User] Activate_Deactivate';
  constructor(public payload: any) { }
}

//SECTION - To Get All User.........
export class GetAllUser {
  static readonly type = '[User] GetAll';
}

//SECTION - To Get User by id.........
export class GetUserById {
  static readonly type = '[User] GetById';
  constructor(public id: string) { }
}

export class GetMSPFilter {
  static readonly type = '[User] GetMSPUser';
}

export class GetClientFilter {
  static readonly type = '[User] GetMSPUser';
}

export class GetStaffingFilter {
  static readonly type = '[User] GetMSPUser';
}

export class AddMSPFilter {
  static readonly type = '[User] AddUserByType';
  constructor(public filterPayload: any, public userList: any) { }
}

export class AddClientFilter {
  static readonly type = '[User] AddUserByType';
  constructor(public filterPayload: any, public userList: any) { }
}

export class AddStaffingFilter {
  static readonly type = '[User] AddUserByType';
  constructor(public filterPayload: any, public userList: any) { }
}
