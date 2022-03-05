import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import {
	debug,
	PortChannel,
	Notification,
	UI_RPC_METHOD_NOTIFICATIONS_SUBSCRIBE,
	UI_RPC_METHOD_KEYRING_STORE_STATE,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
	CONNECTION_POPUP_RPC,
	CONNECTION_POPUP_NOTIFICATIONS,
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
} from './common';
import { setBackgroundClient } from './background/client';
import { KeyringStoreState } from './keyring/store';

async function main() {
	const state = await bootstrap();
	render(state);
}

async function bootstrap(): Promise<KeyringStoreState> {
	debug('bootstrapping ui');

	// Client to communicate from the UI to the background script.
	const backgroundClient = PortChannel.client(CONNECTION_POPUP_RPC);
	setBackgroundClient(backgroundClient);

	// Setup notifications.
	PortChannel
		.notifications(CONNECTION_POPUP_NOTIFICATIONS)
		.onNotification(notificationsHandler);
	const [, state] = await Promise.all([
		backgroundClient.request({ method: UI_RPC_METHOD_NOTIFICATIONS_SUBSCRIBE, params: [] }),
		backgroundClient.request({
			method: UI_RPC_METHOD_KEYRING_STORE_STATE,
			params: [],
		}),
	]);

	// Keep the keyring store unlocked with a continuous poll.
	setInterval(() => {
		backgroundClient.request({
			method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
			params: [],
		});
  }, 5*60*1000);

	return state;
}

function notificationsHandler(notif: Notification) {
	switch (notif.name) {
		case NOTIFICATION_KEYRING_STORE_LOCKED:
			handleKeyringStoreLocked();
			break;
		case NOTIFICATION_KEYRING_STORE_UNLOCKED:
			handleKeyringStoreUnlocked();
			break;
		default:
			break;
	}
}

function handleKeyringStoreLocked() {
	// TODO
	console.log('keyring store locked!');
}

function handleKeyringStoreUnlocked() {
	// TODO
	console.log('notification keyring store unlocked!');
}

function render(state: KeyringStoreState) {
	debug(`keyring store state: ${JSON.stringify(state)}`);
	ReactDOM.render(
		<React.StrictMode>
			<App state={state} />
		</React.StrictMode>,
		document.getElementById('root')
	)
}

main();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
