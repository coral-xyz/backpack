import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App, { setBackgroundClient } from './app/App';
import reportWebVitals from './reportWebVitals';
import {
	debug,
	PortChannel,
	Notification,
	UI_RPC_NOTIFICATIONS_SUBSCRIBE,
	CONNECTION_POPUP_RPC,
	CONNECTION_POPUP_NOTIFICATIONS,
} from './common';

function main() {
	bootstrap();
	render();
}

function bootstrap() {
	debug('bootstrapping ui');

	// Client to communicate from the UI to the background script.
	const backgroundClient = PortChannel.client(CONNECTION_POPUP_RPC);
	setBackgroundClient(backgroundClient);

	// Setup notifications.
	PortChannel
		.notifications(CONNECTION_POPUP_NOTIFICATIONS)
		.onNotification((notif: Notification) => {
			console.log('ui received background script notification', notif);
		});
	backgroundClient.request({ method: UI_RPC_NOTIFICATIONS_SUBSCRIBE });
}

function render() {
	ReactDOM.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
		document.getElementById('root')
	);
}

main();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
