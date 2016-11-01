/// <reference path="../../typings/browser.d.ts" />
import {TextDatasource} from "./jk.Editor.datasource";
import {TextEditor} from "./jk.Editor";

/**
 * https://docs.angularjs.org/guide/component
 */

/**
 * To make a div focusable, add tabindex.
 * http://snook.ca/archives/accessibility_and_usability/elements_focusable_with_tabindex
 *
 * blinking cursor
 * http://stackoverflow.com/questions/13955163/imitating-a-blink-tag-with-css3-animations
 *
 */

export interface ITextEditorControllerBindings {
	textDataSource:TextDatasource;
}
export class TextEditorController {

	// from binding. 
	public textDataSource:TextDatasource;
	private _editor:TextEditor;

	static $inject = ["$element", "$attrs"]

	constructor(private _mainElement:ng.IAugmentedJQuery, private _attributes:ng.IAttributes) {
	}

	$onInit() {
	}

	$postLink() {
		this._editor = new TextEditor(this.textDataSource, this._mainElement, this._attributes);
		this._editor.initialize();
	}
}

export class TextEditorComponent implements ng.IComponentOptions {
	public bindings:any = {
		textDataSource: "=",
	};
	public controller = TextEditorController;
	public controllerAs = "vm";
	public template = `
		<div class="jk editor-area" tabindex="-1">
			<div class="jk text-area">
				<div class="jk margin-area"></div>
				<div class="jk content-area"></div>
				<div class="jk cursor"></div>
			</div>
		</div>
		`;
}

angular.module("jk", [])
	.component("jkTextEditor", new TextEditorComponent())
;
