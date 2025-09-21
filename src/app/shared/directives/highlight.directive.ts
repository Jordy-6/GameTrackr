import { Directive, ElementRef, HostListener, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  private elementRef = inject(ElementRef);

  @Input() highlightColor = '#e3f2fd'; // Bleu clair par défaut
  @Input() defaultColor = 'transparent'; // Transparent par défaut
  @Input() highlightText = '#1976d2'; // Couleur du texte au survol

  private originalTextColor = '';

  ngOnInit(): void {
    // Sauvegarder la couleur de texte originale
    this.originalTextColor = this.elementRef.nativeElement.style.color || '';
    // Appliquer la couleur de fond par défaut
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
