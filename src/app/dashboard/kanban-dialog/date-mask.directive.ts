import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDateMask]',
  standalone: true
})
export class DateMaskDirective {
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 8) { // Limit to 8 digits (DDMMYYYY)
      value = value.substring(0, 8); 
    }
    
    // Add the slashes
    if (value.length > 4) {
      // Format as DD/MM/YYYY
      value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4); 
    } else if (value.length > 2) {
      // Format as DD/MM
      value = value.substring(0, 2) + '/' + value.substring(2); 
    }
    
    // Update both the input value and the form control value
    input.value = value;
    this.control.control?.setValue(value, { emitEvent: false });

    // Position cursor appropriately after automatic slash insertion
    const cursorPosition = input.selectionStart || 0;
    if ((value.length === 3 && (input.selectionStart || 0) === 2) || 
        (value.length === 6 && (input.selectionStart || 0) === 5)) {
      setTimeout(() => {
        input.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      }, 0);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    const input = this.el.nativeElement as HTMLInputElement;
    
    // Allow navigation keys and digits only
    if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
