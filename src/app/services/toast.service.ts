import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  private show(message: string, type: 'success' | 'error' | 'info') {
    // Simple browser toast fallback
    // You can replace this with a more advanced UI toast if you wish
    const color = type === 'success' ? '#38a169' : type === 'error' ? '#e53e3e' : '#3182ce';
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '32px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = color;
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '6px';
    toast.style.fontSize = '16px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toast.style.opacity = '0.95';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s';
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 2500);
  }
}
