import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { MassComparsionService } from '../services/mass-comparsion.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { SubmittalResponse, SelectedCandidate, Candidate, ActionResponse, Document } from '../interfaces/mass-candidate';
import { DropdownItem } from '@xrm-shared/models/tree-dropdown.model';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { Dropdown } from 'src/app/modules/acrotrac/Time/timesheet/adjustment-manual/enum';
import { UserRole } from '@xrm-master/user/enum/enums';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { DmsImplementationService } from '@xrm-shared/services/dms-implementation.service';
import { ApiResponseBase } from '@xrm-core/models/responseTypes/api-response-base.model';
import { Location } from '@angular/common';

@Component({
	selector: 'app-submittal-mass-comparison',
	templateUrl: './mass-comparison.component.html',
	styleUrls: ['./mass-comparison.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MassComparison implements OnInit, OnDestroy {
	public massComparisonForm: FormGroup;
	public isMSP: boolean = false;
	public isClient: boolean = false;
	private destroyAllSubscriptions$: Subject<void> = new Subject<void>();
	public declineReason: DropdownItem[]| null|undefined = [];
	public selectionReason: DropdownItem[] | null | undefined = [];
	public minCandidates = Number(magicNumber.two);
	private sectorId: number|undefined;
	private selectedCandidate: SelectedCandidate ={SubmittalIds: []};
	public submittalObject: SubmittalResponse|null|undefined;
	public actions: Dropdown[];

	// eslint-disable-next-line max-params
	constructor(
    private fb: FormBuilder,
    private toasterServc: ToasterService,
    private cd: ChangeDetectorRef,
    private massComparisonService : MassComparsionService,
    private customValidator: CustomValidators,
    private dmsImplementationService: DmsImplementationService,
    private renderer: Renderer2,
    private location: Location
	) {
	}

	ngOnInit(): void {
		this.toasterServc.resetToaster();
		this.setUserRoleFlags();
		this.selectedCandidate.SubmittalIds = history.state.SubmittalIds;
		this.massComparisonService.getCandidates(this.selectedCandidate).pipe(takeUntil(this.destroyAllSubscriptions$)).
			subscribe((response) => {
				if (response.Succeeded) {
					this.submittalObject = response.Data;
					this.sectorId = this.submittalObject?.CandidatesList[0].SectorId;
					this.loadCombinedData();
					this.createDynamicForm(this.submittalObject?.CandidatesList ?? []);
				}
			});
	}

	ngOnDestroy(): void {
		this.destroyAllSubscriptions$.next();
		this.destroyAllSubscriptions$.complete();
	}

	private setUserRoleFlags(): void {
		const role = Number(window.sessionStorage.getItem('RoleGroupId'));
		this.isMSP = role === Number(UserRole.MSP);
		this.isClient = role === Number(UserRole.Client);
		this.actions = this.isMSP
			? this.createActionsForMSP()
			: this.createActionsForClient();
	}

	private createActionsForMSP(): Dropdown[] {
		return [
			{ Text: 'Receive', Value: Number(magicNumber.sixHundred) },
			{ Text: 'Forward', Value: Number(magicNumber.sixHundredTwo) },
			{ Text: 'Decline', Value: Number(magicNumber.sixHundredOne) }
		];
	}

	private createActionsForClient(): Dropdown[] {
		return [
			{ Text: 'Select', Value: Number(magicNumber.sixHundredFortyOne) },
			{ Text: 'Defer', Value: Number(magicNumber.sixHundredFortyTwo) },
			{ Text: 'Shortlist', Value: Number(magicNumber.sixHundredFortyThree) },
			{ Text: 'Decline', Value: Number(magicNumber.sixHundredOne)}
		];
	}


	public getRequestID(): string|undefined{
		return this.submittalObject?.RequestDetail.RequestCode??'';
	}

	public getRequestStBillRate(): number | undefined | string {
		return this.submittalObject?.RequestDetail.StBillRate ?? '';
	}

	public getInterviewAvailability(): number | undefined | string {
		return this.submittalObject?.RequestDetail.InterviewAvailability ?? '';
	}

	public getStartAvailabililty(): number | undefined | string {
		return this.submittalObject?.RequestDetail.StartAvailabililty ?? '';
	}

	public getWorkHistory(): number | undefined | string {
		return this.submittalObject?.RequestDetail.WorkHistory ?? '';
	}

	public getSkillsRequired(): number | undefined | string {
		return this.submittalObject?.RequestDetail.SkillsRequired ?? '';
	}

	public getSkillsPrefered(): number | undefined | string {
		return this.submittalObject?.RequestDetail.SkillsPrefered ?? '';
	}

	public getWorkExperienceRequired(): number | undefined | string {
		return this.submittalObject?.RequestDetail.WorkExperienceRequired ?? '';
	}

	public getWorkExperiencePreferred(): number | undefined | string {
		return this.submittalObject?.RequestDetail.WorkExperiencePrefered ?? '';
	}

	public getEducationRequired(): number | undefined | string {
		return this.submittalObject?.RequestDetail.EducationRequired ?? '';
	}

	public getEducationPrefered(): number | undefined | string {
		return this.submittalObject?.RequestDetail.EducationPrefered ?? '';
	}


	private loadCombinedData(): void {
		forkJoin([
			this.massComparisonService.getDeclineReason(this.sectorId ?? 0),
			this.massComparisonService.getSelectionReason(this.sectorId ?? 0)
		])
			.pipe(takeUntil(this.destroyAllSubscriptions$))
			.subscribe(([declineReasons, selectionReasons]) => {
				this.declineReason = declineReasons.Data;
				this.selectionReason = selectionReasons.Data;
				this.callCD();
			});
	}

	private callCD(){
		this.cd.markForCheck();
		this.cd.detectChanges();
	}

	scroollToTop() {
		window.scrollTo(Number(magicNumber.zero), Number(magicNumber.zero));
	}

	// Updated Code Starts here *************

	private createDynamicForm(candidates: Candidate[]): void {
		const formGroup = this.fb.group({}),
		 candidateCounts = Math.min(Math.max(this.minCandidates, candidates.length), Number(magicNumber.four));

		candidates.slice(Number(magicNumber.zero), candidateCounts).forEach((candidate, index) => {
			formGroup.addControl(`${index + Number(magicNumber.one) }`, this.createCandidateGroup(candidate));
		});

		this.massComparisonForm = formGroup;
		this.massComparisonForm.markAsUntouched();
		this.updateFormValidity();
	}

	private updateFormValidity(): void {
		this.massComparisonForm.updateValueAndValidity();
		this.updateView();
	}

	private updateView(): void {
		this.cd.markForCheck();
		this.cd.detectChanges();
	}

	private createCandidateGroup(candidate: Candidate): FormGroup {
		return this.fb.group({
			SubmittalId: [candidate.SubmittalId],
			SubmittalCode: [candidate.SubmittalCode],
			CandidateName: [candidate.CandidateName],
			StBillRate: [candidate.StBillRate],
			InterviewAvailability: [candidate.InterviewAvailability],
			StartAvailabililty: [candidate.StartAvailabililty],
			WorkHistory: [candidate.WorkHistory],
			SkillsRequired: [candidate.SkillsRequired],
			SkillsPrefered: [candidate.SkillsPrefered],
			WorkExperienceRequired: [candidate.WorkExperienceRequired],
			WorkExperiencePrefered: [candidate.WorkExperiencePrefered],
			EducationRequired: [candidate.EducationRequired],
			EducationPrefered: [candidate.EducationPrefered],
			Action: [this.getActionBasedOnStatus(candidate)]
		});
	}

	private getActionBasedOnStatus(candidate: Candidate): number | undefined {
		// Need to update this according to client
		switch (candidate.StatusId) {
			case Number(magicNumber.twoHundredTwentyFive):
				return Number(magicNumber.sixHundredOne);
			case Number(magicNumber.twoHundredTwentySix):
				return Number(magicNumber.sixHundredTwo);
			case Number(magicNumber.twoHundredFifty):
				return Number(magicNumber.sixHundred);
			default:
				return undefined;
		}
	}


	public getControl() {
		return Object.keys(this.massComparisonForm?.controls || {});
	}


	public getControlValueByIndex(index: number, control: string): any {
		const formGroup = this.massComparisonForm.controls[`${index + 1}`];
		return formGroup.get(control)?.value;
	}

	public getDocuments(index: number): { DocumentTitle: string; DocumentUrl: string; file: Document }[] {
		const candidate = this.submittalObject?.CandidatesList?.[index];
		return candidate?.Documents.map((document: Document) =>
			({
				DocumentTitle: document.DocumentName,
				DocumentUrl: document.DocumentFile,
				file: document
			})) ?? [];
	}

	public onChangeAction(index: number): void {
		const formGroup = this.massComparisonForm.controls[`${index + 1}`] as FormGroup,
		  isDeclined = formGroup.get('Action')?.value === Number(magicNumber.sixHundredOne),
			isShortlisted = formGroup.get('Action')?.value === Number(magicNumber.sixHundredOne);

		// eslint-disable-next-line no-unused-expressions
		isDeclined
			? this.addDeclinedReasonControls(formGroup)
			: this.removeDeclinedReasonControls(formGroup);
		isShortlisted
			? this.addSelectionReasonControls(formGroup)
			: this.removeSelectionReasonControls(formGroup);
		formGroup.markAsTouched();
		this.updateFormValidity();
	}

  	private addDeclinedReasonControls(control: FormGroup) {
		control.addControl(
			'DeclineReason',
			new FormControl(null, this.customValidator.RequiredValidator('PleaseSelectDeclineReason'))
		);
		control.addControl('Comment', new FormControl(null, this.customValidator.RequiredValidator('PleaseEnterDeclineComment')));
	}

	private removeDeclinedReasonControls(control: FormGroup) {
		if (control.contains('DeclineReason')) {
			control.removeControl('DeclineReason');
		}
		if (control.contains('Comment')) {
			control.removeControl('Comment');
		}
	}

  	private addSelectionReasonControls(control: FormGroup) {
		control.addControl(
			'SelectionReason',
			new FormControl(null, this.customValidator.RequiredValidator('PleaseSelectSelectionReason'))
		);
		control.addControl('Comment', new FormControl(null, this.customValidator.RequiredValidator('PleaseEnterSelectionComment') ));
	}
	private removeSelectionReasonControls(control: FormGroup) {
		if (control.contains('SelectionReason')) {
			control.removeControl('SelectionReason');
		}
		if (control.contains('Comment')) {
			control.removeControl('Comment');
		}
	}

	private hasActionValue(actionValue: number): boolean {
		return Object.keys(this.massComparisonForm?.controls).some((key: string) => {
			const control = this.massComparisonForm.get(key);
			return control && control.get('Action')?.value === actionValue;
		});
	}

	public shouldShowReasonRow(): boolean {
		return (this.submittalObject?.CandidatesList?.length ?? Number(magicNumber.zero)) > Number(magicNumber.zero) &&
      this.hasActionValue(Number(magicNumber.sixHundredOne));
	}

	public shouldShowCommentRow(): boolean {
		return (this.submittalObject?.CandidatesList?.length ?? Number(magicNumber.zero)) > Number(magicNumber.zero) &&
      this.hasActionValue(Number(magicNumber.sixHundredOne));
	}


	public getActionValue(control: string): boolean {
		const formGroup = this.massComparisonForm?.get(control) as FormGroup;
		if (!formGroup) {
			return false;
		}

		// eslint-disable-next-line one-var
		const actionValue = formGroup.get('Action')?.value;
		return actionValue === Number(magicNumber.sixHundredOne);
	}

	public submitForm() {
		this.massComparisonForm.markAllAsTouched();
		if (this.massComparisonForm.valid) {
			const payload: ActionResponse[] = this.buildPayload();
			this.massComparisonService.submitCandidates(payload).pipe(takeUntil(this.destroyAllSubscriptions$))
				.subscribe((response: ApiResponseBase) => {
					this.handleResponse(response);
				});
		}
		else
			this.massComparisonForm.markAllAsTouched();
	}

	private buildPayload(): ActionResponse[] {
		return Object.keys(this.massComparisonForm.controls).map((key: string) => {
			const formGroup = this.massComparisonForm.controls[key],
			 action = formGroup.get('Action')?.value;

			if (action === Number(magicNumber.sixHundredOne)) {
				return {
					SubmittalAction: action,
					ActionData: {
						SubmittalId: formGroup.get('SubmittalId')?.value,
						DeclineReasonId: formGroup.get('DeclineReason')?.value?.Value,
						AddToDnr: false,
						DnrOptions: null,
						Comment: formGroup.get('Comment')?.value
					}
				};
			} else if ([Number(magicNumber.sixHundredTwo), Number(magicNumber.sixHundred)].includes(action)) {
				return {
					SubmittalAction: action,
					ActionData: {
						SubmittalIds: [formGroup.get('SubmittalId')?.value]
					}
				};
			}
			return undefined;
		}).filter((payload) =>
			payload !== undefined) as ActionResponse[];
	}

	private handleResponse(response: ApiResponseBase): void {
		if (response.Succeeded) {
			this.toasterServc.showToaster(ToastOptions.Success, response.Message ?? '');
			this.cancel();
		} else {
			const errorMessage = response?.ValidationMessages?.[0] ?? response.Message ?? '';
			this.toasterServc.showToaster(ToastOptions.Error, errorMessage);
		}
	}
	public cancel(){
		this.location.back();
	}

	public actionReset(index: number){
		const formGroup= this.massComparisonForm.controls[`${index + 1}`] as FormGroup;
		formGroup.get('Action')?.setValue(null);
		formGroup.updateValueAndValidity({emitEvent: false, onlySelf: true});
	}

	public downloadFile(file: Document): void {
		if (!file.DocumentFile) {
			return;
		}
		const filePath = (file.DocumentFile).split('.')[0],
			fileExtension = file.FileExtension;
		this.dmsImplementationService.downloadFile(filePath, fileExtension).pipe(takeUntil(this.destroyAllSubscriptions$)).subscribe((blob: Blob) => {
			const url = window.URL.createObjectURL(blob),
				fileNameWithExtension = file.DocumentFile.endsWith(`.${fileExtension}`)
					? file.DocumentName
					: `${file.EncryptedFileName}.${fileExtension}`,
				anchor = this.renderer.createElement('a');
			this.renderer.setAttribute(anchor, 'href', url);
			this.renderer.setAttribute(anchor, 'download', fileNameWithExtension);
			anchor.click();
			window.URL.revokeObjectURL(url);
		});
	}
}
