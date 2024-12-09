import { UserRole, UserStatus } from "./enums";

export class RoleGroupMessages {

	private static messages: any = {
		[UserRole.Client]: {
			active: 'ClientUserHasBeenActivatedSuccessfully',
			inactive: 'ClientUserHasBeenDeactivatedSuccessfully'
		},
		[UserRole.MSP]: {
			active: 'MSPUserHasBeenActivatedSuccessfully',
			inactive: 'MSPUserHasBeenDeactivatedSuccessfully'
		},
		[UserRole.StaffingAgency]: {
			active: 'StaffingAgencyUserHasBeenActivatedSuccessfully',
			inactive: 'StaffingAgencyUserHasBeenDeactivatedSuccessfully'
		}
	};

	static getMessage(roleGroupId: UserRole, userStatus: UserStatus): string | null {
		const roleMessages = this.messages[roleGroupId];
		if (!roleMessages) return null;

		return userStatus === UserStatus.Inactive ?
			roleMessages.inactive :
			roleMessages.active;
	}
}
