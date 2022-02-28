import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App, { setBackgroundPort } from './app/App';
import reportWebVitals from './reportWebVitals';
import { PortChannel, CONNECTION_NAME_POPUP, debug } from './common';

function main() {
	bootstrap();
	render();
}

function bootstrap() {
	debug('bootstrapping ui');
	setBackgroundPort(new PortChannel(CONNECTION_NAME_POPUP));
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
