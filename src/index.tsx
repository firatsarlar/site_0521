/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import preact, { h, render } from 'preact';
import routes from "../data/pages";


declare global {
	interface Window {
		__ctx: any;
	}


}
// const d = () => ( <a popi />);
window.__ctx = {};
window.__ctx.routes = routes;

if (process.env.NODE_ENV !== 'production' /*&& navigator.userAgent.indexOf("Explorer") == -1*/) {
	require("preact/debug");
	require('preact-devtools');  // auto-patches.

	window.__ctx.isDev = true;
}
else {
	window.__ctx.isDev = false;
}

let root;


if ((module as any).hot) {

	(module as any).hot.accept("./app", () => requestAnimationFrame(init));


}


const init = () => {
	const App = require("./app").default;
	root = render(<App userName="Beveloper"> </App>, document.body, root);

}
init();

/*
function init() {
	adjustFontSize();
	fetch("/strings.json")
		.then(r => r.json())
		.then(v => {
			window.__ctx.strings = v
			let baseUrl = window.__ctx.isDev ? "http://localhost:290" : "http://test.go-ex.net";
			const portfolioUrl = (location.hash.startsWith("#preview")) ? baseUrl + "/php/portfolio.prev.json?" + Date.now() : "/portfolio.json";

			// if (location.hash == "#preview") location.hash = "";
			fetch(portfolioUrl)
				.then(r => r.json())
				.then(v => {
					// console.log("inittt");
					window.__ctx.portfolio = v;
					const App = require("./pages/generic/app").default;
					root = render(<App name=""> </App>, document.body, root);
					// console.log("hash ", location.hash);

					window.onresize = (e => adjustFontSize());
					ready(adjustFontSize);

				});
		});
}
function ready(fn) {
	if (document.readyState != 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}
function adjustFontSize() {
	const ratios = [
		3 / 4, 9 / 16, 10 / 16, 9 / 21
	];
	const ratioNames = ["3y4", "9y16", "10y16", "9y21"];

	const currentRatio = window.screen.height / window.screen.width;
	let rtName;
	ratios.forEach((el, ix) => { if (currentRatio <= el + 0.01 && currentRatio >= el - 0.01) rtName = ratioNames[ix] });

	const baseFontSize = 16; //px
	let fontSize = 16;
	if (window.screen.width >= 1025) {
		switch (rtName) {
			case "3y4":
				fontSize = window.screen.width / 1920 * baseFontSize;
				break;
			case "10y16":
				fontSize = window.screen.width / 1920 * baseFontSize;
				break;
			case "9y21":
				fontSize = window.screen.height / 1080 * baseFontSize;
				break;
			default: //9y16
				fontSize = window.screen.width / 1920 * baseFontSize;
				break;
		}

		(document.getElementsByTagName("html") as HTMLCollectionOf<HTMLHtmlElement>)[0].style.fontSize = fontSize + "px";
		document.getElementsByTagName("BODY")[0].classList.add("x" + rtName);
		// const particles = (document.getElementById("particles") as HTMLElement);
		window.__ctx.isMobile = false;
		window.__ctx.isTablet = false;
	}
	else if (window.screen.width >= 767 && window.screen.width < 1025) {
		window.__ctx.isMobile = false;
		window.__ctx.isTablet = true;
	}
	else {
		window.__ctx.isMobile = true;
		window.__ctx.isTablet = false;

	}
	// console.log(rtName,Math.round(window.__ctx.fontRatio));
	window.__ctx.fontRatio = fontSize / baseFontSize;

}
*/