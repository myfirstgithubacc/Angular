import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';


@Injectable()

export class ListingResolver implements Resolve<null> {
  constructor(
    private _Router: Router

  ) { }
  resolve(): Promise<any> {
    let data =window.localStorage.getItem('data');
    if(!!data){
        window.localStorage.removeItem('data');
        return Promise.resolve(JSON.parse(data));
    }

    return Promise.resolve(null);

  }
}
