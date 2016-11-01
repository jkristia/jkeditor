/// <reference path="../typings/browser.d.ts" />
/// <reference path="./jk-textEditor/jk.Editor.ts" />
/// <reference path="main.ts" />
import {MainAppCtrl} from "./main"
import {TextEditorComponent} from "./jk-textEditor/jk.Editor.component";

// have to add this dummy for 'jk' to load.
let _dummy :TextEditorComponent = new TextEditorComponent();

angular.module("app", ['jk'])
	.controller("mainCtrl", MainAppCtrl)
;

angular.element(document).ready(() => {
	angular.bootstrap(document, ['app']);
})