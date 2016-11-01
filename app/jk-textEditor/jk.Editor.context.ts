import {IDebug} from "./jk.Debug";
import {
	ITextEditorRender, ITextEditorData, ITextEditorInput, ITextEditorNavigation, IFormatter, 
	EditorViews
} from "./jk.Editor.interfaces";
import {ITextArea} from "./jk.Editor.textarea";

export class Context {
	
	public debug: IDebug;

	public render: ITextEditorRender;
	public textArea: ITextArea;
	public data: ITextEditorData;
	public input: ITextEditorInput;
	public formatter: IFormatter;
	public navigation: ITextEditorNavigation;

	public views: EditorViews = new EditorViews();
}
