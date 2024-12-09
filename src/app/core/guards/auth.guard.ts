import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthGuardService } from "src/app/auth/services/auth-guard.service";

export const AuthGuard = () => {
	const router = inject(Router),
		authGuardService = inject(AuthGuardService);

	if (authGuardService.isLoggedInUser()) {
		return true;
	}
	router.navigate(['/auth/login']);
	return false;
};

