import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { SessionStorageService } from "@xrm-shared/services/TokenManager/session-storage.service";


export const MasterGuard = () => {
	const sessionSrv = inject(SessionStorageService)
	const router = inject(Router),
		user = sessionSrv.get('loggedIn')
			? false
			: true;
	if (!user) {
		router.navigate(['/xrm/landing']);
	}
	return true;
};

