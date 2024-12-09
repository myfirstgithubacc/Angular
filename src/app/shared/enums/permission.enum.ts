/* eslint-disable no-magic-numbers */
// eslint-disable-next-line no-shadow
export enum Permission {

	CREATE_EDIT__CREATE = 2,
	CREATE_EDIT__EDIT = 3,
	CREATE_EDIT__ACTIVATE = 4,
	CREATE_EDIT__DEACTIVATE = 5,
	CREATE_EDIT__UPLOAD = 6,
	CREATE_EDIT__VIEW = 104,
	VIEW_ONLY = 25,

	REVIEW_ONLY = 7,
	REVIEW_APPROVE = 8,
	REVIEW_DECLINE = 9,

	REVIEW_OFFER_APPROVE = 11,
	REVIEW_OFFER_DECLINE = 12,

	REVIEW__ACCEPT = 14,
	REVIEW__DECLINE = 15,

	CANCELCLOSE_CANCEL = 17,
	CANCELCLOSE_CLOSE = 18,

	CANCELRECALL_CANCEL = 20,
	CANCELRECALL_RECALL = 21,

	TIME_ENTRY = 23,
	EXPENSE_ENTRY = 24,

	Edit = 26,

	MANAGE_CLP_BADGE = 27,

	MANAGE_DNU_List = 28,

	MOVE_LI_CLP = 29,

	UPDATE_CLP_BILL_RATE = 30,

	UPDATE_CLP_MISC_Data = 31,

	Process = 32,

	COMPLETE_IN_PROCESS = 33,

	CONFIRM_SOW_CR = 34,

	ON_BOARD_RESOURCE = 35,

	Complete = 36,

	Skip = 37,

	Submit = 38,

	COMPARE_SUBMITTAL = 39,

	CANCEL_INTERVIEW = 40,

	CANDIDATE_NOT_AVAILABLE = 41,

	CONFIRM_A_SUBMITTAL = 42,

	CONFIRM_ONBOARDING = 43,

	CONFIRM_INTERVIEW_AVAILABILITY = 44,

	DEFER_A_CANDIDATE = 45,

	FINISH_INTERVIEW = 46,

	FORWARD = 47,

	IN_PROCESS_A_CLP_BY_MSP = 48,

	REQUEST_INTERVIEW = 49,

	RETURN_CANDIDATE = 50,

	REVIEW_CANDIDATE_OFFER = 51,

	SELECT_A_CANDIDATE = 52,

	SHORTLIST_A_CANDIDATE = 53,

	SUBMIT_ALTERNATE_SCHEDULE = 54,

	SUBMITTAL_RECEIVED_BY_MSP = 55,

	WITHDRAW = 56,

	FILL_CANDIDATE = 57,

	PROCESS_AND_BROADCAST = 58,

	CANCEL = 59,

	CONFIRM = 60,

	DECLINE_BY_MSP = 61,

	RE_INSTATE_PSR = 62,

	REVIEW_AND_CONFIRM_OFFER = 63,

	REVIEW_FOR_IN_PROCESS = 64,

	HOLD_ANY_NEW_SUBMITTAL = 65,

	PROCESS_AND_BROADCAST_BY_MSP = 66,

	REASSIGN_REQUISITION_BY_MSP = 67,

	PROCESS_SUBMITAL_BY_MSP = 68,

	REVIEW_SUBMITAL = 69,

	CONFIRM_FOR_IN_PROCESS = 70,

	CONFIRM_BY_MSP = 71,

	RESPOND_BY_STAFFING = 72,

	PROCESS_ICS_BY_MSP = 73,

	REPORT_DASHBOARD_TBD = 74,

	MISCELLANEOUS_EXPENSE_ENTRY = 75,

	MODIFY_ENTRY = 76,

	GENERATE = 77,

	UPLOAD = 78,

	IMPERSONATION = 79,

	PRE_SCREENING = 80,

	CREATE_EDIT_MSP_USER__CREATE = 82,
	CREATE_EDIT_MSP_USER__EDIT = 83,
	CREATE_EDIT_MSP_USER__ACTIVATE = 84,
	CREATE_EDIT_MSP_USER__DEACTIVATE = 85,
	CREATE_EDIT_MSP_USER__UPLOAD = 86,
	CREATE_EDIT_MSP_USER__VIEW = 105,

	VIEW_MSP_USER = 87,
	IMPERSONATE = 88,

	CREATE_EDIT_CLIENT_USER__CREATE = 90,
	CREATE_EDIT_CLIENT_USER__EDIT = 91,
	CREATE_EDIT_CLIENT_USER__ACTIVATE = 92,
	CREATE_EDIT_CLIENT_USER__DEACTIVATE = 93,
	CREATE_EDIT_CLIENT_USER__UPLOAD = 94,
	CREATE_EDIT_CLIENT_USER__VIEW = 106,

	VIEW_CLIENT_USER = 95,

	CREATE_EDIT_STAFFING_AGENCY_USER__CREATE = 98,
	CREATE_EDIT_STAFFING_AGENCY_USER__EDIT = 99,
	CREATE_EDIT_STAFFING_AGENCY_USER__ACTIVATE = 100,
	CREATE_EDIT_STAFFING_AGENCY_USER__DEACTIVATE = 101,
	CREATE_EDIT_STAFFING_AGENCY_USER__UPLOAD = 102,
	CREATE_EDIT_STAFFING_AGENCY_USER__VIEW = 107,

	VIEW_STAFFING_AGENCY_USER = 103,
	Download = 111,
	VIEW_SHIFT_SCHEDULE = 112,

  MSP_PROCESS = 114,
  MSP_DECLINE = 115,
  Edit_Predefined_Report = 118,
  Execute_Report = 119,
  Copy_Report = 120,
  ManageFolder = 126,
  CREATE_EDIT_STAFFING_AGENCY_USER_PROFESSIONAL_SUBMITTAL = 117,

  	Process_Submittal = 121,
  	Decline = 123,
  	Receive = 122,

	MANAGE_COUNTRY_ACTIVATE = 129,
	MANAGE_COUNTRY_DEACTIVATE = 130,

	AUTO_PROCESS_EXECUTE = 127,
	

}
