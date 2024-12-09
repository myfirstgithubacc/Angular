import { ApiResponseBase } from './api-response-base.model';

export class ApiLoginResponse extends ApiResponseBase {
  refreshToken?: string;
  expiresIn?: Date;
}
