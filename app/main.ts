/// <reference path="../typings/browser.d.ts" />
import {TextDatasource} from "./jk-textEditor/jk.Editor.datasource";
import {TestRunner} from "./jk-textEditor/tests/testRunner"

export class MainAppCtrl {
	message = "howdy from MainAppCtrl";

	public editorDatasource:TextDatasource = new TextDatasource();

	constructor() {
		console.log('MainAppCtrl');
		new TestRunner().runTests();
	}

	public onClick(select:number) {
		if (select === 1)
			this.loadfileDebug("output/app.js");
		if (select === 2)
			this.loadfileDebug("app/jk-textEditor/jk.Editor.navigation.ts");
		if (select === 3) {
			let txt = "		public onClick(select: number): void { // this is a comment \n\r		// abc";
			this.editorDatasource.set(txt);
		}
	}


	private loadfileDebug(filename:string) {
		this.editorDatasource.clear();
		$.get(filename,
			// success
			(data:any, status:string, jq:JQueryXHR) => {
				console.log("success1");
			}
		).then((data:any, status:string, jq:JQueryXHR) => {
				console.log("success2");
				let txt = jq.responseText;
				this.editorDatasource.set(txt);
			},
			(jq:JQueryXHR, status:string, error:any) => {
				console.log("error");
				let txt = jq.responseText;
				this.editorDatasource.set(txt);
			}
		)
	}
}
