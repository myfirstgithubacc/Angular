/* eslint-disable prefer-template */
/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export abstract class SignalrBaseService<T> {
	protected baseUrl = `${environment.GATEWAY_URL}/${environment.APIVERSION}`;
	protected hubConnection: signalR.HubConnection;
	private messageSubject = new BehaviorSubject<T | null>(null);
  	public message$: Observable<T | null> = this.messageSubject.asObservable();

	/* BehaviorSubject<boolean> to track the connection status (connectionStatusSubject),
	which can be subscribed to by other parts of your Angular app to react to connection changes
	(e.g., showing a loading spinner if disconnected).*/
  	private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  	public connectionStatus$ = this.connectionStatusSubject.asObservable();

  	constructor(private hubUrl: string, private hubName: string) {}

	public startConnection = () => {
		this.hubConnection = new signalR.HubConnectionBuilder()
			.withUrl('https://nvxrm-dev.acrocorp.com/devtest_api/xrm-common-hub', {
				withCredentials: true
			})

			/* The withAutomaticReconnect([0, 2000, 10000, 30000]) method enables automatic reconnection
			with increasing delays on retry attempts (0 ms, 2 seconds, 10 seconds, 30 seconds).*/
			// eslint-disable-next-line no-magic-numbers
			.withAutomaticReconnect([0, 2000, 10000, 30000])
			.build();

		this.hubConnection
			.start()
			.then(() => {
			  console.log(`${this.hubName} SignalR Connection Started`);
			  this.connectionStatusSubject.next(true);
			})
			.catch((err) => {
			  console.error('Error while starting connection: ' + err);
			  this.connectionStatusSubject.next(false);
			});

		this.registerHandlers();
		this.setupConnectionMonitoring();
	};

	// Stop connection
	public stopConnection = () => {
		this.hubConnection.stop()
		  .then(() => {
				console.log(`${this.hubName} SignalR Connection Stopped`);
				this.connectionStatusSubject.next(false);
		  })
		  .catch((err) => {
				console.error('Error while stopping connection: ' + err);
			});
	  };

	// Method to handle connection status changes and errors
	private setupConnectionMonitoring() {
		this.hubConnection.onreconnected((connectionId) => {
		  console.log(`Reconnected with connectionId: ${connectionId}`);
		  this.connectionStatusSubject.next(true);
		});

		this.hubConnection.onreconnecting((err) => {
		  	console.warn(`Reconnecting: ${err}`);
		  	this.connectionStatusSubject.next(false);
		});

		this.hubConnection.onclose((err) => {
			console.error(`Connection closed: ${err}`);
		  	this.connectionStatusSubject.next(false);
		});
	  }

	// Handlers for child classes to implement
	protected abstract registerHandlers(): void;

	// Generic message receiving method
	protected onMessageReceived = (message: T) => {
	  this.messageSubject.next(message);
	};

	// Send method (can be overridden by child classes)
	public sendMessage(method: string, message: T) {
	  this.hubConnection.invoke(method, message)
			.catch((err) => {
				console.error('Error while sending message: ' + err);
			});
	}

	// Method to join a SignalR group
	public joinGroup(userId: string, roleGroupName: string) {
		const connectionId = this.hubConnection.connectionId;
	  	this.hubConnection.invoke('RegisterUser', connectionId, roleGroupName)
			.then(() => {
				this.setConnectionIdToStorage(userId, this.hubConnection.connectionId);
				console.log(`Joined group: ${roleGroupName}`);
			})
			.catch((err) => {
				console.error('Error while joining group: ' + err);
			});
	}

	// Method to leave a SignalR group
	public leaveGroup(roleGroupName: string) {
	  this.hubConnection.invoke('LeaveGroup', roleGroupName)
			.then(() => {
				this.removeConnectionIdFromStorage();
				console.log(`Left group: ${roleGroupName}`);
			})
			.catch((err) => {
				console.error('Error while leaving group: ' + err);
			});
	}

	// Method to retrieve the connection ID from the server if needed
	public getConnectionId(): Promise<string> {
	  return this.hubConnection.invoke('GetConnectionId')
			.then((connectionId: string) => {
				return connectionId;
			})
			.catch((err) => {
		  		console.error('Error while getting connection ID: ' + err);
		  		return '';
			});
	}

	// Store User ConnectionId in local storage
	private setConnectionIdToStorage(userid: string, connectionid: string | null): void {
		localStorage.setItem('ConnectionId', `${userid} ${connectionid}`);
	  }

	  // Get the JWT token from local storage
	private removeConnectionIdFromStorage(): void {
		localStorage.removeItem('ConnectionId');
	  }
}
