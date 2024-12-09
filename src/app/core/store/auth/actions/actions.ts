import { Login } from "src/app/auth/models/login.model";


export class LoginUser {
    static readonly type = '[Auth] Login';
    constructor(public payload: Login) {}
  }
  
export class Logout {
    static readonly type = '[Auth] Logout';
  }