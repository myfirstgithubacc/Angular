/**
  * popup buttons: which contain dynamic array of button formation along with dedicated values
  * the value those are used here
  * @param value = 0 => Ok
  *
  * @param value = 1 => Yes Add
  * @param value = 2 => No Add
  *
  * @param value = 3 => Yes update
  * @param value = 4 => No update
  *
  * we are using same value for yes activate and yes deactivate: i.e., 5
  * their is not any requirement for different value in our function
  * @param value = 5 => YesActivate
  * @param value = 6 => NoActivate
  *
  * we are using same value for no activate and no deactivate: i.e., 6
  * their is not any requirement for different value in our function
  * @param value = 5 => YesDeactivate
  * @param value = 6 => NoDeactivate
  *
  * @param value = null => Yescopy
  * @param value = null => Nocopy
  */

export const PopupDialogButtons = {
	Ok: [{ text: 'Ok', value: 0, themeColor: 'primary' }],
	YesNo: [
		{ text: 'Yesadd', value: 1, themeColor: 'primary' },
		{ text: 'Noadd', value: 2 }
	],
	Update: [
		{ text: 'Yesadd', value: 3, themeColor: 'primary' },
		{ text: 'Noadd', value: 4 }
	],
	Activate: [
		{ text: 'YesActivate', value: 5, themeColor: 'primary' },
		{ text: 'NoActivate', value: 6 }
	],
	Deactivate: [
		{ text: 'YesDeactivate', value: 5, themeColor: 'primary' },
		{ text: 'NoDeactivate', value: 6 }
	],
	Lock: [
		{ text: 'YesLock', value: 9, themeColor: 'primary' },
		{ text: 'NoLock', value: 10 }
	],
	CopyYesNo: [
		{ text: 'Yescopy', value: 11, themeColor: "primary" },
		{ text: 'Nocopy', value: 12 }
	],
	UpdateWithCancel: [
		{ text: 'Yesupdate', value: 3, themeColor: 'primary' },
		{ text: 'Noupdate', value: 4 },
		{ text: 'Cancel', value: 0 }
	],
	SaveWithCancel: [
		{ text: 'Yessave', value: 3, themeColor: 'primary' },
		{ text: 'Nosave', value: 4 },
		{ text: 'Cancel', value: 0 }
	],
	ConfigurePreference: [
		{ text: 'Configurepreference', value: 7, themeColor: 'primary' },
		{ text: 'No', value: 8 }
	],
	OkError: [{ text: 'OK', value: 11, themeColor: 'primary' }],
	ActivateProxy: [
		{ text: 'YesActivate', value: 12, themeColor: 'primary' },
		{ text: 'NoActivate', value: 13 }
	],
	YesNoOnly: [
		{ text: 'Yes', value: 14, themeColor: 'primary' },
		{ text: 'No', value: 15 }
	],
	YesNoDelete: [
		{ text: 'Yes', value: 16, themeColor: 'primary' },
		{ text: 'No', value: 17 }
	],
	PageNavigation: [
		{ text: 'Ok', value: 18, themeColor: 'primary' },
		{ text: 'Cancel', value: 19 }
	],
	Withdram: [
		{ text: 'YesWithdraw', value: 20, themeColor: 'primary' },
		{ text: 'NoWithdraw', value: 21 }
	],
	Remove: [
		{ text: 'YesRemove', value: 22, themeColor: 'primary' },
		{ text: 'NoRemove', value: 21 }
	],
	proceedYesNo: [
		{ text: "Yes, proceed", value: 24, themeColor: 'primary' },
		{ text: "No, don't proceed", value: 23 }
	],
	discardYesNo: [
		{ text: "Yes, discard", value: 26, themeColor: 'primary' },
		{ text: "No, don't discard", value: 25 }
	],
	agreeYesNo: [
		{ text: "Yes, agree", value: 28, themeColor: 'primary' },
		{ text: "No, don't agree", value: 27 }
	],
	YesAndNo: [
		{ text: 'Yes', value: 25, themeColor: 'primary' },
		{ text: 'No', value: 26 }
	],
	YesDeleteDontDelete: [
		{ text: 'YesDelete', value: 23, themeColor: 'primary' },
		{ text: 'NoDontDelete', value: 24 }
	]
};

