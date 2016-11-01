/// <reference path="../../typings/browser.d.ts" />
import {ITextEditorInput, IFormatter} from "./jk.Editor.interfaces";
import {Context} from "./jk.Editor.context";

export class TextEditorInput implements ITextEditorInput {

	constructor(private _context:Context,
	            private _tokenizer:IFormatter) {
	}

	public clear():void {
		this._context.data.clear();
		this._context.textArea.refresh();
	}

	public set(text:string) {
		this._context.data.clear();
		this._tokenizer.append(this._context, text);
		this._context.textArea.refresh();
	}
} 
