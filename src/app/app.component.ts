import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('styledEditor', { static: true }) styledEditor!: ElementRef;
  text = 'editor';

  private selectionStart: number = 0;
  private selectionEnd: number = 0;

  textEditor: any;

  constructor() {}
  ngOnInit(): void {
    this.textEditor = this.text;
    this.styledEditor.nativeElement.innerHTML = this.textEditor;
  }

  setTag(tag: string) {
    if (this.selectionStart === this.selectionEnd) {
      return;
    }
    console.log('Element ::: ', this.textEditor);
    console.log('setBold', this.selectionStart, this.selectionEnd);
    // Insert a em tag with the selected text
    const start = this.textEditor.slice(0, this.selectionStart);
    const selectedText = this.textEditor.slice(this.selectionStart, this.selectionEnd);
    const end = this.textEditor.slice(this.selectionEnd);
    this.textEditor = `${start}<${tag}>${selectedText}</${tag}>${end}`;
    this.styledEditor.nativeElement.innerHTML = this.textEditor;
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

  cleaeFormat() {
    this.textEditor = this.textEditor.replace(/<[^>]*>/g, '');
    this.styledEditor.nativeElement.innerHTML = this.textEditor;
  }

  selectText(event: Event) {
    this.selectionStart = this.editor.nativeElement.selectionStart;
    this.selectionEnd = this.editor.nativeElement.selectionEnd;
    console.log('selectText', event, this.editor.nativeElement.selectionStart, this.editor.nativeElement.selectionEnd);
  }

  selectTextFormatted(event: Event) {
    this.selectionStart = this.styledEditor.nativeElement.selectionStart;
    this.selectionEnd = this.styledEditor.nativeElement.selectionEnd;
    console.log('Styled ::::::::::', event, this.editor.nativeElement.selectionStart, this.editor.nativeElement.selectionEnd);
  }

  changeTextFormatted(event: Event) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      for (let i = 0; i < selection.rangeCount; ++i) {
        console.log('Formatted === ', selection.getRangeAt(i), selection.getRangeAt(i).commonAncestorContainer);
      }
    }
  }

}
