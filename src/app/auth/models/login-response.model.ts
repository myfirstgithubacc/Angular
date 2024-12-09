import { ToJson } from 'src/app/core/models/responseTypes/to-json.model';

export class LoginResponse extends ToJson {
	statusCode?: number;
	succeeded?: boolean;
	message?: string;
	refreshToken?: string;
	expiresIn?: Date;
}
