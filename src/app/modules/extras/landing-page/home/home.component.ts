import { AfterViewChecked, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ScrollViewComponent } from '@progress/kendo-angular-scrollview';
import { SessionStorageService } from '@xrm-shared/services/TokenManager/session-storage.service';
import { AuthGuardService } from 'src/app/auth/services/auth-guard.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { UserActivationService } from 'src/app/auth/services/user-activation.service';
import { FavoritesService } from '@xrm-shared/services/favorites.service';
import { MessageBoardService } from '@xrm-shared/services/message-board.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { MenuService } from '@xrm-shared/services/menu.service';
import { Subject, firstValueFrom, forkJoin, takeUntil } from 'rxjs';
import { MessageBoardType } from '../constants/message-board-type.enum';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { ActionItemsList, FavoritesList } from '../constants/constants';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { Configuration, MessageBoard } from 'src/app/modules/extras/landing-page/constants/message-board.model';
import { GlobalService } from '@xrm-shared/services/global.service';
import { HttpStatusCode } from '@angular/common/http';
import { ReviewlinkService } from '@xrm-shared/services/reviewlink.service';

@Component({selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewChecked, OnDestroy {

	@ViewChild('myCarousel') private carousel: ScrollViewComponent;

	private interval: ReturnType<typeof setTimeout>;

	private pause: boolean = false;

	isDialogBoxVisible: boolean = false;

	public favoritesList: FavoritesList[] = [];

	public myActionItemsList : ActionItemsList[] = [];

	isUserAcknowledged: boolean = false;

	public UserName: string;

	private roleId: number;

	public containsSingleMessage = false;

	private isSorted: boolean = false;

	private transitionTime: number = magicNumber.thirtyThousand;

	private destroyAllSubscribtion$ = new Subject<void>();

	public items = [{MessageLocalizedKey: '', MessageBoardContentTypeId: 185}];

	public ConfirmationMessage: string;

	// eslint-disable-next-line max-params
	constructor(
    private SStorage: SessionStorageService,
		private router: Router,
    private authService: AuthGuardService,
    private toasterService: ToasterService,
    private userActivationService: UserActivationService,
    private favoritesService: FavoritesService,
		private translate: TranslateService,
    private messageBoardService: MessageBoardService,
		private localizationService: LocalizationService,
		private menuService: MenuService,
		private reviewLinkService: ReviewlinkService,
	private globalSer: GlobalService,
	private cdr: ChangeDetectorRef
	){
		this.UserName = sessionStorage.getItem('UserDisplayName')?.toString().trim()
			.replace(/,/g, '') ?? '';
		this.roleId = this.getRole();
		this.ConfirmationMessage = this.SStorage.get('AcknowledgementKey')??'';

		if(this.SStorage.get('IsAcknowledge')=='true' || this.SStorage.get('roleGroupId') == '5'){
			this.isDialogBoxVisible = this.navigateToLandingPageUrl();
		}
		else{
			this.isDialogBoxVisible = true;
		}
		if(localStorage.getItem('feRouteUkey') && localStorage.getItem('recordUKey')){
			this.navigateToEmailLinkUrl();
		}
	}

	private getRole(){
		const roleGroupId: number = Number(this.SStorage.get('roleGroupId')) || magicNumber.zero;

  	if(roleGroupId == Number(magicNumber.two) || roleGroupId == Number(magicNumber.four)){
  		return MessageBoardType.ClientMspMessageBoard;
  	}
  	else if(roleGroupId == Number(magicNumber.three)){
  		return MessageBoardType.StaffingAgencyMessageBoard;
  	}
  	else if(roleGroupId == Number(magicNumber.five)){
  		return MessageBoardType.ContractorMessageBoard;
  	}
		return MessageBoardType.ClientMspMessageBoard;
	}

	private navigateToLandingPageUrl(){
  	if(!this.menuService.isCameFromLogin)
  		return false;

  	this.menuService.isCameFromLogin = false;
  	const customUrl:string = this.SStorage.get('LandingPageUrl')??'';

  	this.menuService.accessRouteListSubject.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res) => {
		  const item = res.find((entity) =>
				entity.Route === customUrl);
		  if (item) {
			  this.router.navigateByUrl(customUrl);
		  }});

  	return false;
	}

	private navigateToEmailLinkUrl()
	{
		this.getNavigationUrl(localStorage.getItem('feRouteUkey') ?? '', localStorage.getItem('recordUKey') ?? '')
  						.then((url: string) => {
  							if(url != '')
  							{
  								this.router.navigate([url]);
  							}
  							else
  							{
  								this.router.navigate(['/xrm/landing/home']);
  							}
  						});
	}


	ngOnInit(): void {

		forkJoin([
			this.favoritesService.getFavorites(),
			this.messageBoardService.getMessages(this.roleId),
			this.favoritesService.getMyActionItems(),
			this.messageBoardService.getTransitionTime()
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([fav, messageBoard, actionItems, transitionTime]) => {
			this.getAllFavorites(fav);
			this.getMessageBoard(messageBoard);
			this.getMyActionitems(actionItems);
			this.getTransitionTime(transitionTime);
			this.startCarousel();
		});
	}

	private startCarousel(): void {
		this.interval = setInterval(() => {
			if (!this.pause && !this.containsSingleMessage) {
				this.carousel.next();
				this.cdr.markForCheck();
			}
		}, this.transitionTime);
	}

	private getAllFavorites(res: ApiResponse) {
		 if(res.Data){
			 this.favoritesList= res.Data;
			 this.localize();
		 }
	}

	private getMessageBoard(res: GenericResponseBase<MessageBoard[]>){

		if (res.Data && res.Data.length > Number(magicNumber.zero)) {
			this.items = res.Data;
		} else {
			this.items = [];
		}

		this.containsSingleMessage = this.items.length <= Number(magicNumber.one);

	}

	private getTransitionTime(res : GenericResponseBase<Configuration[]>) {
		if (Array.isArray(res.Data) && res.Data.length > Number(magicNumber.zero)) {
			this.transitionTime = parseInt(res.Data[0].ConfigurationValue) * magicNumber.oneThousand;
		} else {
			this.transitionTime = 0;
		}
	}

	private getMyActionitems(res: ApiResponse) {
  		if(res.Data){
  			this.myActionItemsList = res.Data;
  			this.checkingCount();
  		}
	}

	ngAfterViewChecked(): void {
  	if(!this.isSorted && this.favoritesList[0]?.label !== undefined){
		  	this.sort();
  	}
	}

	routerLink(item: ActionItemsList) {
  	this.router.navigateByUrl(
			item.NavigationUrl,
			{
				state: { defaultSelectedTab: item.DefaultSelectedTab, listAdvanceSearchFormControlName: item.ListAdvanceSearchFormControlName }
			}
		);
		this.globalSer.persistTab.next({tabName: item.DefaultSelectedTab, key: item.EntityId});
  	return [];
	}

	private checkingCount(){
  	this.myActionItemsList.forEach((element:ActionItemsList, index:number) => {
  		this.favoritesService.getCountOfEachActionItem(element.GatewayUrl)
  			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((countResponse) => {
				 if(countResponse.Data || countResponse.Data == magicNumber.zero){
  				this.myActionItemsList[index].count = countResponse.Data;
				 }
				 else{
						this.myActionItemsList.splice(index, magicNumber.one);
				 }
					this.cdr.markForCheck();
  		});
		 });
	}

	public isEveryActionItemCountZero(): boolean {
		return this.myActionItemsList.every((item) =>
			item.count === magicNumber.zero);
	}

	public setPauseAndPlay() {
  	this.pause = !this.pause;
	}

	logout() {
  	this.authService.logOut();
	}

	private localize(){
  	this.favoritesList.forEach((data1: FavoritesList, index: number) => {
  		this.translate
  			.stream(this.favoritesList[index].EntityLocalizedKey)
			  .pipe(takeUntil(this.destroyAllSubscribtion$))
  			.subscribe((data : string) => {
  				this.favoritesList[index].label = data;
  			});
  	});
	}
	private async getNavigationUrl(feRouteUkey: string, recordUKey: string): Promise<string> {
  	let feRouteUrl: string = '';
  	try {
  		const data = await firstValueFrom(this.reviewLinkService.getFeRouteUrl(feRouteUkey));
  		if (data.StatusCode === Number(HttpStatusCode.Ok)) {
  			feRouteUrl = `${data.Data}/${recordUKey}`;
  		}
  	} catch (error) {
  		console.log(error);
  	}
  	return feRouteUrl;
	}
	private sort(){
  		this.isSorted = true;
  		this.favoritesList.sort((a: FavoritesList, b: FavoritesList) => {
  			const keyA = a.label?.toLowerCase()??'',
								 keyB = b.label?.toLowerCase()??'';
  			return keyA.localeCompare(keyB);
  		});
	}

	homeFavoriteToggle(index: number): void {

  	this.favoritesList[index].Disabled = !this.favoritesList[index].Disabled;
  	const favoriteEntityId = this.favoritesList[index].EntityId;
  	this.submitFavorites(favoriteEntityId);
	}

	isEmpty() : boolean
	{
  	let a : boolean = false;
  		this.favoritesList.some((data1: FavoritesList) => {
  			a = !data1.Disabled;
  			return a;
  		});

  	return a;
	}

	private submitFavorites(favoriteEntityId: number) {
  	const entityId = { entityId: favoriteEntityId};
  	this.favoritesService.submitFavorites(entityId).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe();
	}

	toggleDisabled() {
  	this.isUserAcknowledged = !this.isUserAcknowledged;
	}

	getObject(object: DynamicParam[]) {
  	if (object.length == Number(magicNumber.zero)) return null;
  	return this.localizationService.GetParamObject(object);
	}

	markAcknowledge(){

  	this.userActivationService.markAcknowledeged("").pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: GenericResponseBase<null>) => {
  		if(res.Succeeded)
  			{
  			this.SStorage.set('IsAcknowledge', 'true');
  			this.isDialogBoxVisible = false;
  			this.navigateToLandingPageUrl();
  		}
  		else
			{
  			this.toasterService.showToaster(ToastOptions.Error, res.Message);
			}
			this.cdr.detectChanges();
  	});
	}
	private clearFeRouteUkeyAndRecordUKey() {
		localStorage.removeItem('feRouteUkey');
		localStorage.removeItem('recordUKey');
	}

	ngOnDestroy(){
  	this.toasterService.resetToaster();
  	this.destroyAllSubscribtion$.next();
  	this.destroyAllSubscribtion$.complete();
  	clearInterval(this.interval);
		this.clearFeRouteUkeyAndRecordUKey();
	}
}
