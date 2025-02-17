import { Component, ElementRef, OnInit, signal, Signal, ViewChild, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  @ViewChild('editor', { static: true }) editor!: ElementRef;
  @ViewChild('styledEditor', { static: true }) styledEditor!: ElementRef<HTMLDivElement>;
  text = 'editor';

  private selectionStart: number = 0;
  private selectionEnd: number = 0;

  textEditor: WritableSignal<string> = signal('');

  constructor() {}
  ngOnInit(): void {
    this.textEditor.set(this.text);
    this.styledEditor.nativeElement.innerHTML = this.textEditor();
  }

  setTag(tag: string) {
    if (this.selectionStart === this.selectionEnd) {
      return;
    }

    // Reposiciona para evitar quebrar tags
    const adjustedCursor = this.adjustTextAreaSelectionCursors( this.textEditor(), { cursorStart: this.selectionStart, cursorEnd: this.selectionEnd} );
    this.selectionStart = adjustedCursor.cursorStart;
    this.selectionEnd = adjustedCursor.cursorEnd;

    // Insert a em tag with the selected text
    const start = this.textEditor().slice(0, this.selectionStart);
    const selectedText = this.textEditor().slice(this.selectionStart, this.selectionEnd);
    const end = this.textEditor().slice(this.selectionEnd);
    this.textEditor.set(`${start}<${tag}>${selectedText}</${tag}>${end}`);
    this.styledEditor.nativeElement.innerHTML = this.textEditor();
    this.selectionStart = 0;
    this.selectionEnd = 0;
    const sel = window.getSelection();
    sel?.removeAllRanges();
  }

  setList(outtertag: string = 'ul', innertag: string = 'li') {
    // Reposiciona para evitar quebrar tags
    const adjustedCursor = this.adjustTextAreaSelectionCursors( this.textEditor(), { cursorStart: this.selectionStart, cursorEnd: this.selectionEnd} );
    this.selectionStart = adjustedCursor.cursorStart;
    this.selectionEnd = adjustedCursor.cursorEnd;

    // Insert a em tag with the selected text
    const start = this.textEditor().slice(0, this.selectionStart);
    const selectedText = this.textEditor().slice(this.selectionStart, this.selectionEnd);
    const end = this.textEditor().slice(this.selectionEnd);
    this.textEditor.set(`${start}<${outtertag}><${innertag}>${selectedText}</${innertag}></${outtertag}>${end}`);
    this.styledEditor.nativeElement.innerHTML = this.textEditor();
    this.selectionStart = 0;
    this.selectionEnd = 0;
    const sel = window.getSelection();
    sel?.removeAllRanges();
  }

  setBold() {
    this.setTag('b');
  }

  setItalic() {
    this.setTag('i');
  }

  setUnderline() {
    this.setTag('u');
  }

  setOrderedList() {
    this.setList('ol');
  }

  clearFormat() {
    this.textEditor.update(value => value.replace(/<[^>]*>/g, ''));
    this.styledEditor.nativeElement.innerHTML = this.textEditor();
  }

  selectText(event: Event) {
    this.selectionStart = this.editor.nativeElement.selectionStart;
    this.selectionEnd = this.editor.nativeElement.selectionEnd;
    console.log('selectText', event, this.editor.nativeElement.selectionStart, this.editor.nativeElement.selectionEnd);
  }

  selectTextFormatted(event: Event) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      return;
    }

    const selectionStart = sel?.anchorOffset ?? 0;
    const selectionEnd = sel?.focusOffset ?? 0;
    console.log('selectTextFormatted === ', sel);
    this.selectionStart = selectionStart;
    this.selectionEnd = selectionEnd;
  }

  changeTextFormatted(event: Event) {
    this.textEditor.set(this.styledEditor.nativeElement.innerHTML.replace(/&nbsp\;/g, ''));
  }

  listShortcodes() {
    console.log(this.selectTextInTextArea( this.editor.nativeElement, { start: this.selectionStart, end: this.selectionEnd } ));
    console.log(this.adjustTextAreaSelectionCursors( this.textEditor(), { cursorStart: this.selectionStart, cursorEnd: this.selectionEnd} ));
  }

  private getShortcodesInText( content: string ) {
    let shortcodes = content.match( /\<\/{0,1}(\w)+\>/g ),
      result = [];

    if ( shortcodes ) {
      for (let shortcodeItem of shortcodes) {
        result.push( shortcodeItem );
      }
    }

    return result;
  }

  private getShortCodePositionsInText(content: string) {
    const allShortcodes = this.getShortcodesInText(content);

    if ( allShortcodes.length === 0 ) {
      return [];
    }

    const shortcodeDetailsRegexp = RegExp(`${allShortcodes.join( '|' )}`, 'g');

    let shortcodesDetails: { shortcodeName: any; showAsPlainText: boolean; startIndex: any; endIndex: any; length: any; }[] = [];

    let shortcodeMatch: any;

    while ( shortcodeMatch = shortcodeDetailsRegexp.exec( content ) ) {
      console.log('Shortcode Match :::: ', shortcodeMatch);
      /**
       * Checa pelas tags de abertura e fechamento de shortcodes.
       *
       */
      const showAsPlainText = shortcodeMatch[1] === '<';

      const shortcodeInfo = {
        shortcodeName: shortcodeMatch[2],
        showAsPlainText: showAsPlainText,
        startIndex: shortcodeMatch.index,
        endIndex: shortcodeMatch.index + shortcodeMatch[0].length,
        length: shortcodeMatch[0].length
      };
      console.log('Shortcode Info :::: ', shortcodeMatch, shortcodeInfo);
      shortcodesDetails.push(shortcodeInfo);
    }

    return shortcodesDetails;
  }

  private getShortcodeWrapperInfo( content: string, cursorPosition: number ) {
    let contentShortcodes = this.getShortCodePositionsInText( content );

    for ( let element of contentShortcodes ) {
      if ( cursorPosition >= element.startIndex && cursorPosition <= element.endIndex ) {
        return element;
      }
    }
    return null;
  }

  private adjustTextAreaSelectionCursors( content: string, cursorPositions: {cursorStart: number; cursorEnd:number} ) {

    let cursorStart = cursorPositions.cursorStart;
    let cursorEnd = cursorPositions.cursorEnd;

    // Check if the cursor is in a tag and if so, adjust it.
    const isCursorStartInTag = this.getShortcodeWrapperInfo( content, cursorStart );
    const isCursorEndtInTag = this.getShortcodeWrapperInfo( content, cursorEnd );

    cursorStart = isCursorStartInTag ? isCursorStartInTag.startIndex : cursorStart;
    cursorEnd = isCursorEndtInTag ? isCursorEndtInTag.endIndex : cursorEnd;

    return {
      cursorStart: cursorStart,
      cursorEnd: cursorEnd
    };
  }

  private selectTextInTextArea( textArea: HTMLTextAreaElement, selection: { start: number; end: number; } ) {
    // Only valid in the text area mode and if we have selection.
    if ( ! selection ) {
      return;
    }

    const start = selection.start;
    const end = selection.end || selection.start;

    textArea.setSelectionRange( start, end );
    console.log('selectTextInTextArea', start, end);
  }

}
