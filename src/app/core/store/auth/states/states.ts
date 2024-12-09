import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { LoginService } from "src/app/auth/services/login.service";
import { LoginUser, Logout } from "../actions/actions";

export interface AuthStateModel {
    token: string | null;
    username: string | null;
}

@State<AuthStateModel>({
    name: 'auth',
    defaults: {
        token: null,
        username: null
    }
})
@Injectable()

export class AuthState {

    constructor(private authService: LoginService) { }

    @Selector()
    static token(state: AuthStateModel): string | null {
        return state.token;
    }

    @Selector()
    static isAuthenticated(state: AuthStateModel): boolean {
        return !!state.token;
    }

    @Action(LoginUser)
    LoginUser(ctx: StateContext<AuthStateModel>,  { payload }: LoginUser) {
      return this.authService.Loginfn(payload).pipe(
        tap((res) => {
          ctx.patchState({
            token: res.refreshToken
          });
        })
      );
    }

    @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    //const state = ctx.getState();
    return this.authService.Logout().pipe(
      tap(() => {
        ctx.setState({
          token: null,
          username: null
        });
      })
    );
  }

}