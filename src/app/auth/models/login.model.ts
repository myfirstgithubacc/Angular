import { ToJson } from 'src/app/core/models/responseTypes/to-json.model';

export class Login extends ToJson {
  loginId?: string = '';
  password?: string = '';
  rememberMe?: boolean;
}
