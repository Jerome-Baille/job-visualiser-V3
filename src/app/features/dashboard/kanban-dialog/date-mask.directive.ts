import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDateMask]',
  standalone: true
})
export class DateMaskDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement;
    
    // If there's already a date object from the datepicker, don't interfere
    if (input.value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return;
    }
    
    // Get current cursor position
    const currentCursorPos = input.selectionStart || 0;
    
    // Remove non-digits
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 8 digits (ddmmyyyy)
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    // Format with slashes
    let formattedValue = '';
    if (value.length > 0) {
      formattedValue = value.substring(0, Math.min(2, value.length));
      
      if (value.length > 2) {
        formattedValue += '/' + value.substring(2, Math.min(4, value.length));
        
        if (value.length > 4) {
          formattedValue += '/' + value.substring(4, Math.min(8, value.length));
        }
      }
    }
    
    // Only update the value if it's changed to avoid infinite loops
    if (input.value !== formattedValue) {
      // Store cursor position + any added slashes to determine new position
      let addedChars = 0;
      if (value.length >= 3 && currentCursorPos >= 2 && input.value.charAt(2) !== '/') {
        addedChars++;
      }
      if (value.length >= 5 && currentCursorPos >= 5 && input.value.charAt(5) !== '/') {
        addedChars++;
      }
      
      input.value = formattedValue;
      
      // Restore cursor position accounting for added slashes
      if (currentCursorPos !== null) {
        const newPosition = currentCursorPos + addedChars;
        input.setSelectionRange(newPosition, newPosition);
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow navigation and editing keys
    const allowed = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!allowed.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
}