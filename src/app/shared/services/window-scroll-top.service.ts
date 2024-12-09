import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class WindowScrollTopService {

	public scrollTop(){
		return window.scrollTo({ top: 0, behavior: 'smooth' });
	}
}
