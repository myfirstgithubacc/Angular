import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NotificationService } from 'src/app/services/masters/notification.service';
import { DatePipe } from '@angular/common';
import { NavigationPaths } from '../routes/routeConstants';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';
import { EmailTemplateService } from 'src/app/services/masters/email-template.service';
import { EmailList } from '@xrm-core/models/recent-alert.model';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';
import { AttachmentsData } from '@xrm-master/email-template/constants/models';
import { HttpResponse } from '@angular/common/http';


@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent {

	public emailContent: EmailList;
	public emailAttachments: AttachmentsData[];
	private destroyAllSubscribtion$ = new Subject<void>();

	constructor(
		private activatedRoute: ActivatedRoute,
		private messageService: NotificationService,
		private router: Router,
		private emailTemplateService: EmailTemplateService
	) {

	}

	ngOnInit(): void {
		this.activatedRoute.params
			.pipe(
				switchMap((param: Params) => {
					if (param['id']) {
						this.getEmailNotificationByUkey(param['id']);
					}
					return of(null);
				}),
				catchError((error: Error) => {
					return EMPTY;
				}),
				takeUntil(this.destroyAllSubscribtion$)
			)
			.subscribe();
	}

	private getEmailNotificationByUkey(Ukey: string){
		this.messageService.fetchEmailNotificationByUkey(Ukey).pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: GenericResponseBase<EmailList>) => {
				if(isSuccessfulResponse(data)){
					this.emailContent= data.Data;
					this.emailAttachments = data.Data.emailAttachments ?? [];
				}
			});
	}

	public getIconUrl(extension: string): string {
		if (extension === '.docx') {
			return 'assets/images/docx.png';
		} else if (extension === '.pdf') {
			return 'assets/images/pdf.png';
		} else if(extension === '.doc'){
			return 'assets/images/doc.png';
		}else if(extension === '.txt'){
			return 'assets/images/txt.png';
		}else if(extension === '.xlsx'){
			return '';
		}else if(extension === '.xls'){
			return '';
		}else{
			return '';
		}
	}

	public getAltText(extension: string): string {
		if (extension === 'docx') {
			return 'DOCX';
		} else if (extension === 'pdf') {
			return 'PDF';
		} else if(extension === 'doc'){
			return 'DOC';
		}else if(extension === 'txt'){
			return 'TXT';
		}else if(extension === 'xlsx'){
			return 'XLSX';
		}else if(extension === 'xls'){
			return 'XLS';
		}else{
			return 'ALT';
		}
	}

	public dateTimeTransform(data: Date){
		const datePipe = new DatePipe('en-US'),
			 formattedDate = datePipe.transform(data, 'MM/dd/yyyy'),
			 formattedTime = datePipe.transform(data, 'hh:mm a');
		return `${formattedDate } ${ formattedTime}`;

	}

	downloadRecords(dataitem: AttachmentsData){
		this.emailTemplateService.downloadRecords(dataitem.DocumentManagemenstSystemId)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: HttpResponse<Blob>) => {
				if(res.body){
					const url = window.URL.createObjectURL(res.body),
						a = document.createElement('a'),
						fileNameWithExtension = `${dataitem.FileName }.${ dataitem.FileExtension}`;
					a.href = url;
					a.download = fileNameWithExtension;
					a.click();
					window.URL.revokeObjectURL(url);
				}
			});
	}

	public navigateToList(){
		this.router.navigate([NavigationPaths.list]);
	}

	ngOnDestroy(){
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}


