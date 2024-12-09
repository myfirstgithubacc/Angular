import { Injectable } from '@angular/core';
import { LoginService } from 'src/app/auth/services/login.service';
import { magicNumber } from '../common-constants/magic-number.enum';
import { StorageKeys } from '@xrm-shared/enums/storage-keys.enum';
import { SessionStorageService } from './session-storage.service';

@Injectable({
	providedIn: 'root'
})
export class TokenManagerService {

	constructor(private loginService: LoginService, private sessionSrv: SessionStorageService) { }

	AddToken(key: string, token: string) {
		this.sessionSrv.set(key, token);
	}

	GetToken(key: string): string {
		return this.sessionSrv.get(key) ?? "";
	}

	HasToken(key: string): boolean {
		return Boolean(this.sessionSrv.get(key));
	}

	Clear() {
		this.loginService.clearStorage();
	}


	getTokenInfo() {
		const dateString = this.sessionSrv.get(StorageKeys[StorageKeys.TokenGeneratedOn]) ?? '',
			tokenGeneratedTime = new Date(dateString),
			currentTime = new Date(),
			tokenExpiresInMinutes = this.sessionSrv.get(StorageKeys[StorageKeys.TokenExpiresInMinutes]) ?? magicNumber.zero,
			tokenExpireTime = new Date(tokenGeneratedTime.getTime() + Number(tokenExpiresInMinutes) * magicNumber.sixtyThousand),
			isTokenExpire = currentTime > tokenExpireTime,
			refreshTokenExpiresInMinutes = this.sessionSrv.get(StorageKeys[StorageKeys.RefreshTokenExpiresInMinutes]) ?? magicNumber.zero,
			refreshTokenExpireTime = new Date(tokenGeneratedTime.getTime() + Number(refreshTokenExpiresInMinutes) * magicNumber.sixtyThousand),
			isRefreshTokenExpire = currentTime > refreshTokenExpireTime;

		if (tokenGeneratedTime.toString() === 'Invalid Date')
			return { isTokenExpire: true, isRefreshTokenExpire: true };

		return { isTokenExpire: isTokenExpire, isRefreshTokenExpire: isRefreshTokenExpire };
	}

}
