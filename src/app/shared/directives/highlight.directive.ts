import { Directive, ElementRef, HostListener, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  private elementRef = inject(ElementRef);

  @Input() highlightColor = '#e3f2fd'; // Blue background by default
  @Input() defaultColor = 'transparent'; // Transparent by default
  @Input() highlightText = '#1976d2'; // Text color on hover

  private originalTextColor = '';

  ngOnInit(): void {
    // Save the original text color
    this.originalTextColor = this.elementRef.nativeElement.style.color || '';
    // Apply the default background color
    this.setBackgroundColor(this.defaultColor);
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.setBackgroundColor(this.highlightColor);
    this.setTextColor(this.highlightText);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.setBackgroundColor(this.defaultColor);
    this.setTextColor(this.originalTextColor);
  }

  @HostListener('focus') onFocus() {
    this.setBackgroundColor(this.highlightColor);
    this.setTextColor(this.highlightText);
  }

  @HostListener('blur') onBlur() {
    this.setBackgroundColor(this.defaultColor);
    this.setTextColor(this.originalTextColor);
  }

  private setBackgroundColor(color: string): void {
    this.elementRef.nativeElement.style.backgroundColor = color;
  }

  private setTextColor(color: string): void {
    this.elementRef.nativeElement.style.color = color;
  }
}
