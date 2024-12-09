import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { UserModel } from '@xrm-core/models/user/user_model';
import {
	ActivateDeactivateUser,
	GetAllUser,
} from '../actions/user.action';
import { Observable, tap } from 'rxjs';
import { UsersService } from '@xrm-master/user/service/users.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

export class UserStateModel {
	users!: UserModel[];
	user_Loaded!: boolean;
	userById!: UserModel;
	status_code!: string;
}


@State<UserStateModel>({
	name: 'user',
	defaults: {
		users: [],
		user_Loaded: false,
		userById: null as any,
		status_code: '',
	},
})
@Injectable()
export class UserState {
	constructor(public userService: UsersService) { }

  @Selector()
	static getAllUsers(state: UserStateModel) {
		return state.users;
	}

  @Selector()
  static userLoaded(state: UserStateModel) {
  	return state.user_Loaded;
  }

  @Selector()
  static userById(state: UserStateModel) {
  	return state.userById;
  }

  // GET DATA FROM STATE
  @Action(GetAllUser)
  getAllUser({ getState, setState }: StateContext<UserStateModel>) {
  	return this.userService.getUserListByRoleGroupId(magicNumber.zeroDecimalZero).pipe(
  		tap((res: any) => {
  			const state = getState();
  			setState({
  				...state,
  				users: res.Data,
  				user_Loaded: true,
  			});
  			const state1 = getState();
  			// console.log(state1);
  		})
  	);
  }

  // DELETE DATA FROM STATE
  @Action(ActivateDeactivateUser)
  ActivateAndDeactivateUser(
  	{ getState, patchState }: StateContext<UserStateModel>,
  	{ payload }: ActivateDeactivateUser
  ): Observable<UserStateModel> | any {
  	let Id: any = [];
  	for (let i in payload) {
  		let c1 = {
  			ukey: payload[i].ukey,
  			Status: payload[i].status,
  			reasonForChange: payload[i].reasonForChange ?? '',
  		};
  		Id.push(c1);
  	}

  	return this.userService.activateRoleAndDeactivate(Id).pipe(
  		tap((res: any) => {
  			const state = getState();
  			const userList = state.users;

  			let indexArray: any = [];
  			Id.forEach((a: any) => {
  				let index = userList.findIndex((b: any) => b.UKey == a.ukey);
  				indexArray.push(index);
  			});
  			if (res.Succeeded) {
  				// indexArray.forEach(
  				//   (c: any) => (userList[c].UserStatus = Id[0].Status)
  				// );
  			}
  			patchState({
  				...state,
  				users: userList,
  			});
  		})
  	);
  }
}




