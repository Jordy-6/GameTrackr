import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HighlightDirective } from './highlight.directive';

@Component({
  template: `
    <div id="default" appHighlight>Default Highlight</div>
    <div
      id="custom"
      appHighlight
      highlightColor="#ff0000"
      highlightText="#00ff00"
      defaultColor="#0000ff"
    >
      Custom Highlight
    </div>
    <button id="button" appHighlight>Button with Highlight</button>
  `,
  standalone: true,
  imports: [HighlightDirective],
})
class TestComponent {}

describe('HighlightDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let defaultElement: DebugElement;
  let customElement: DebugElement;
  let buttonElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, HighlightDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

    defaultElement = fixture.debugElement.query(By.css('#default'));
    customElement = fixture.debugElement.query(By.css('#custom'));
    buttonElement = fixture.debugElement.query(By.css('#button'));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply directive to elements', () => {
    expect(defaultElement).toBeTruthy();
    expect(customElement).toBeTruthy();
    expect(buttonElement).toBeTruthy();

    const defaultDirective = defaultElement.injector.get(HighlightDirective);
    const customDirective = customElement.injector.get(HighlightDirective);
    const buttonDirective = buttonElement.injector.get(HighlightDirective);

    expect(defaultDirective).toBeTruthy();
    expect(customDirective).toBeTruthy();
    expect(buttonDirective).toBeTruthy();
  });

  it('should apply default colors on initialization', () => {
    const defaultEl = defaultElement.nativeElement;
    expect(defaultEl.style.backgroundColor).toBe('transparent');
  });

  it('should apply custom default color on initialization', () => {
    const customEl = customElement.nativeElement;
    expect(customEl.style.backgroundColor).toBe('rgb(0, 0, 255)'); // #0000ff
  });

  describe('Mouse Events', () => {
    it('should change background color on mouseenter', () => {
      const defaultEl = defaultElement.nativeElement;

      defaultElement.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      expect(defaultEl.style.backgroundColor).toBe('rgb(227, 242, 253)'); // #e3f2fd
      expect(defaultEl.style.color).toBe('rgb(25, 118, 210)'); // #1976d2
    });

    it('should restore original colors on mouseleave', () => {
      const defaultEl = defaultElement.nativeElement;

      // Trigger mouseenter first
      defaultElement.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      // Then trigger mouseleave
      defaultElement.triggerEventHandler('mouseleave', null);
      fixture.detectChanges();

      expect(defaultEl.style.backgroundColor).toBe('transparent');
      expect(defaultEl.style.color).toBe('');
    });

    it('should apply custom colors on mouseenter', () => {
      const customEl = customElement.nativeElement;

      customElement.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      expect(customEl.style.backgroundColor).toBe('rgb(255, 0, 0)'); // #ff0000
      expect(customEl.style.color).toBe('rgb(0, 255, 0)'); // #00ff00
    });

    it('should restore custom default color on mouseleave', () => {
      const customEl = customElement.nativeElement;

      // Trigger mouseenter first
      customElement.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      // Then trigger mouseleave
      customElement.triggerEventHandler('mouseleave', null);
      fixture.detectChanges();

      expect(customEl.style.backgroundColor).toBe('rgb(0, 0, 255)'); // #0000ff
    });
  });

  describe('Focus Events', () => {
    it('should change background color on focus', () => {
      const buttonEl = buttonElement.nativeElement;

      buttonElement.triggerEventHandler('focus', null);
      fixture.detectChanges();

      expect(buttonEl.style.backgroundColor).toBe('rgb(227, 242, 253)'); // #e3f2fd
      expect(buttonEl.style.color).toBe('rgb(25, 118, 210)'); // #1976d2
    });

    it('should restore original colors on blur', () => {
      const buttonEl = buttonElement.nativeElement;

      // Trigger focus first
      buttonElement.triggerEventHandler('focus', null);
      fixture.detectChanges();

      // Then trigger blur
      buttonElement.triggerEventHandler('blur', null);
      fixture.detectChanges();

      expect(buttonEl.style.backgroundColor).toBe('transparent');
      expect(buttonEl.style.color).toBe('');
    });
  });

  describe('Input Properties', () => {
    it('should have default highlight color', () => {
      const directive = defaultElement.injector.get(HighlightDirective);
      expect(directive.highlightColor).toBe('#e3f2fd');
    });

    it('should have default text color', () => {
      const directive = defaultElement.injector.get(HighlightDirective);
      expect(directive.highlightText).toBe('#1976d2');
    });

    it('should have default background color', () => {
      const directive = defaultElement.injector.get(HighlightDirective);
      expect(directive.defaultColor).toBe('transparent');
    });

    it('should accept custom colors', () => {
      const directive = customElement.injector.get(HighlightDirective);
      expect(directive.highlightColor).toBe('#ff0000');
      expect(directive.highlightText).toBe('#00ff00');
      expect(directive.defaultColor).toBe('#0000ff');
    });
  });

  describe('Color Preservation', () => {
    it('should preserve original text color when element has inline style', () => {
      const testEl = defaultElement.nativeElement;
      testEl.style.color = 'rgb(255, 128, 0)'; // Set original color

      // Re-initialize directive to capture original color
      const directive = defaultElement.injector.get(HighlightDirective);
      directive.ngOnInit();

      // Trigger hover
      defaultElement.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();
      expect(testEl.style.color).toBe('rgb(25, 118, 210)'); // highlight color

      // Leave hover
      defaultElement.triggerEventHandler('mouseleave', null);
      fixture.detectChanges();
      expect(testEl.style.color).toBe('rgb(255, 128, 0)'); // original color restored
    });
  });
});
