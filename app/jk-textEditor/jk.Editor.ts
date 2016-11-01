/// <reference path="../../typings/browser.d.ts" />
/// <reference path="./jk.Editor.context.ts" />
import {ITextEditorData, ITextEditorLineInfo} from "./jk.Editor.interfaces";
import {TextArea} from "./jk.Editor.textarea";
import {TextEditorLineRender, TextEditorRender} from "./jk.Editor.render";
import {TextEditorNavigation} from "./jk.Editor.navigation";
import {Debug} from "./jk.Debug";
import {Formatter} from "./jk.Editor.formatter";
import {TextEditorInput} from "./jk.Editor.input";
import {TextEditorData} from "./jk.Editor.data";
import {Context} from "./jk.Editor.context";
import {TextDatasource} from "./jk.Editor.datasource";

export class TextEditor {
	private _context:Context;

	constructor(private _dataSource:TextDatasource,
	            private _mainElement:ng.IAugmentedJQuery,
	            private _attributes:ng.IAttributes) {
	}

	public initialize() {
		this._context = new Context();
		this._context.data = this._context.data || new TextEditorData();
		this._context.formatter = this._context.formatter || new Formatter();
		this._context.input = this._context.input || new TextEditorInput(this._context, this._context.formatter);
		this._context.navigation = this._context.navigation || new TextEditorNavigation();

		this._context.render = new TextEditorRender(this._context, new TextEditorLineRender());
		this._context.textArea = new TextArea(this._context, $(".editor-area", this._mainElement), this._context.render);

		if (this._dataSource)
			this._dataSource.context = this._context;

		let views = this._context.views;
		views.cursor = $(".cursor", this._mainElement);

		$(window).resize((event:JQueryEventObject) => {
			this.onResize();
		});
		this._context.debug = new Debug(this._context);
		this._context.navigation.setup(this._context);
		this._context.textArea.setup();
		this.onResize();
		this.onResize();
	}

	private onResize() {

		this._context.textArea.resize();
		this._context.debug.update();
	}
}
