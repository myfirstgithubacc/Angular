/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { UserDetails } from '@xrm-master/user/model/model';
import { UsersService } from '@xrm-master/user/service/users.service';
import { GlobalService } from '@xrm-shared/services/global.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { UserActivationService } from 'src/app/auth/services/user-activation.service';
import { HeaderService } from '@xrm-shared/services/header.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { DataItem, LocationList, PreferenceUpdate, SecurityQuestion, UserStatusUpdate } from '@xrm-master/user/interface/user';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({
	selector: 'app-core-preference',
	templateUrl: './core-preference.component.html',
	styleUrls: ['./core-preference.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorePreferenceComponent implements OnInit, OnDestroy {
	@ViewChild("imageUploads") imageUploads: ElementRef;
	@ViewChild("imagePreview") imagePreview: ElementRef;
	private isImageSelected: boolean;
	public languageList: DataItem[];
	public timeZoneList: DataItem[] | null | undefined;
	public landingPageList: LocationList[];
	public dateFormatList: DataItem[];
	public proxyAuthorizationTypesList: DataItem[];
	public proxyUserDropdownList: DataItem[];
	public notificationpreferenceoptiondropdownList: DataItem[];
	private imageUrl: string;
	public securityQuestionList: SecurityQuestion[];
	public userDetails: UserDetails;
	private newImageUrl = 'assets/images/users/3.jpg';
	public AddEditEventReasonForm: FormGroup;
	public latestFile: File;
	public shouldUpload: boolean = false;
	public removeImage: boolean = false;
	public removeOldImage: boolean = false;
	public InitialImage: string | null;
	private unsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private fb: FormBuilder,
		private localizationService: LocalizationService,
		private usersService: UsersService,
		private userActivationService: UserActivationService,
		private headerService: HeaderService,
		private toasterService: ToasterService,
		private globalService: GlobalService,
		private sessionStorage: SessionStorageService,
		private cd: ChangeDetectorRef
	) {
		this.dateFormatList = this.usersService.getdateFormatListHardCoded();
		this.AddEditEventReasonForm = this.fb.group({
			status: [null]
		});
	}

	ngOnInit(): void {
		this.getDropdownData();
		this.loadInitialImage();
	}

	loadInitialImage() {
		const ProfileDmsId = sessionStorage.getItem('ProfileDmsId'),
			image = document.getElementById("output2") as HTMLImageElement;
		if (ProfileDmsId !== "null" && ProfileDmsId !== null && ProfileDmsId !== '') {
			this.headerService.getClientProfilePicture(ProfileDmsId).pipe(takeUntil(this.unsubscribe$)).
				subscribe((res: GenericResponseBase<string>) => {
					this.isImageSelected = true;
					if (typeof res.Data == 'string') {
						image.src = res.Data;
						this.InitialImage = res.Data;
					}
					this.removeImage = false;
				});
		}
		else {
			image.src = this.newImageUrl;
			this.removeImage = true;
		}
	}

	getDropdownData() {
		forkJoin([
			this.usersService.getUserPreferenceDetailsByUserId(this.globalService.getXUIDValue()),
			this.usersService.getTimeZone(),
			this.userActivationService.getAllSecurityQuestions(),
			this.usersService.getProxyAuthorizationTypesDropdown()
		]).pipe(takeUntil(this.unsubscribe$)).subscribe((res: [
			GenericResponseBase<UserDetails>,
			GenericResponseBase<DataItem[]>,
			GenericResponseBase<SecurityQuestion[]>,
			GenericResponseBase<DataItem[]>,
			// GenericResponseBase<DataItem[]>,
		]) => {
			if (res?.length > Number(magicNumber.zero)) {
				if (res[0]?.Data) this.userDetails = res[0]?.Data;
				this.setLanguageList();
				this.setLandingPageList();
				if (res[1]?.Data) this.timeZoneList = res[1]?.Data;
				if (res[2]?.Data) this.securityQuestionList = res[2]?.Data;

				this.securityQuestionList.map((ques: SecurityQuestion) => {
					ques.Text = this.localizationService.GetLocalizeMessage(ques.Text);
				});
				if (res[3]?.Data) this.proxyAuthorizationTypesList = res[3]?.Data;
				// if(res[4]?.Data) this.notificationpreferenceoptiondropdownList = res[4]?.Data;

			}
		});
	}

	setLanguageList() {
		const countryId = parseInt(this.sessionStorage.get('CountryId') ?? '');
		this.usersService.getLanguageList(countryId).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<DataItem[]>) => {
			if (res.Succeeded && res.Data) {
				this.languageList = res?.Data;
			}
		});
	}
	setLandingPageList() {
		this.usersService.getlandingPageList(this.userDetails?.UserNo).
			pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<LocationList[]>) => {
				if (res.Succeeded && res.Data) {
					this.landingPageList = res.Data;
					this.landingPageList.map((e) =>
						e.Text = this.localizationService.GetLocalizeMessage(e.TextLocalizedKey) ?? e.Text);
				}
				this.cd.markForCheck();
			});
	}

	loadPicture(event: Event): void {
		const inputElement = event.target as HTMLInputElement,
			image = document.getElementById("output2") as HTMLImageElement;
		if (inputElement.files) {
			this.latestFile = inputElement.files[0];
			this.imageUrl = URL.createObjectURL(inputElement.files[0]);
		}
		image.src = this.imageUrl;
		this.removeOldImage = true;
		this.isImageSelected = true;
		this.shouldUpload = true;
		this.removeImage = false;
	}

	removePicture() {
		const image = document.getElementById("output2") as HTMLImageElement,
			input = document.getElementById("ImageUploader") as HTMLInputElement;
		input.value = '';

		if (this.removeOldImage) {
			this.loadInitialImage();
			this.removeOldImage = false;
			this.shouldUpload = false;
		}
		else {
			image.src = this.newImageUrl;
			this.isImageSelected = false;
			this.shouldUpload = false;
			this.removeImage = true;
			const emptyFormData = new FormData();
			this.headerService.removeClientProfilePicture(emptyFormData)
				.pipe(takeUntil(this.unsubscribe$))
				.subscribe((res: UserStatusUpdate) => {
					this.headerService.profilePicture.next(magicNumber.zero);
					sessionStorage.setItem('ProfileDmsId', 'null');
					this.toasterService.showToaster(ToastOptions.Success, 'ProfilePictureHasBeenSuccessfullyRemoved');
				});
		}
	}

	uploadPicture() {

		const payload = this.latestFile,
			formdata = new FormData();
		formdata.append('ImageFile', payload);

		this.headerService.uploadUserProfilePicture(formdata).pipe(takeUntil(this.unsubscribe$)).subscribe((res: GenericResponseBase<number>) => {
			if (res.Succeeded && res.Data) {
				sessionStorage.setItem('ProfileDmsId', res.Data.toString());
				this.headerService.profilePicture.next(res.Data);
				this.toasterService.showToaster(ToastOptions.Success, 'ProfilePictureHasBeenSuccessfullyUploaded');
				this.isImageSelected = false;
				this.shouldUpload = false;
				this.removeImage = false;
				this.removeOldImage = false;
				this.InitialImage = null;
				this.cd.detectChanges();
			}
			else {
				this.toasterService.showToaster(ToastOptions.Error, 'SomethingwentwrongMsg');
			}
		});
	}

	ngAfterViewChecked() {
		document.getElementsByClassName('ImageUploader')[0].id = 'ImageUploader';
	}

	ngOnDestroy(): void {
		this.toasterService.resetToaster();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
