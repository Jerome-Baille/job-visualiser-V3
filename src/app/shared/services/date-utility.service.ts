import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

// Custom date adapter that ensures leading zeros
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: object): string {
    void displayFormat;
    if (!this.isValid(date)) {
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}

// Custom date formats
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Injectable({
  providedIn: 'root'
})
export class DateUtilityService {

  /**
   * Format date to DD/MM/YYYY string format
   */
  formatDateToDDMMYYYY(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Format date to YYYY-MM-DD string format (for API)
   * Use local date parts to avoid timezone shifts caused by toISOString()
   */
  formatDateForApi(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse date string to Date object
   * Supports both ISO format (YYYY-MM-DD) and DD/MM/YYYY format
   */
  parseStringToDate(dateString: string): Date | string {
    if (!dateString) {
      return dateString;
    }

    try {
      let dateObject: Date | null = null;
      
      // Check if date is in ISO format (YYYY-MM-DD)
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('T')[0].split('-');
        dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } 
      // Check if date is in DD/MM/YYYY format
      else if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
      
      // Return date object if valid, otherwise return original string
      return (dateObject && !isNaN(dateObject.getTime())) ? dateObject : dateString;
    } catch (e) {
      console.error('Date parsing failed:', e);
      return dateString;
    }
  }

  /**
   * Normalize job type values (case insensitive)
   */
  normalizeJobType(value: string): string {
    const jobTypeOptions = ['Remote', 'Hybrid', 'On Site'];
    if (!value) return 'Remote';
    
    const normalizedValue = value.trim();
    const foundOption = jobTypeOptions.find(option => 
      option.toLowerCase() === normalizedValue.toLowerCase()
    );
    
    return foundOption || 'Remote';
  }

  /**
   * Normalize decision values (case insensitive)
   */
  normalizeDecision(value: string): string {
    const decisionOptions = ['positive', 'negative', 'in progress', 'expired', 'unknown'];
    if (!value) return 'unknown';
    
    const normalizedValue = value.trim();
    const foundOption = decisionOptions.find(option => 
      option.toLowerCase() === normalizedValue.toLowerCase()
    );
    
    return foundOption || 'unknown';
  }
}
