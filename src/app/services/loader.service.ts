import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderElement: HTMLElement | null = null;

  show() {
    if (this.loaderElement) return;
    // Create overlay
    this.loaderElement = document.createElement('div');
    Object.assign(this.loaderElement.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.2)',
      zIndex: '9998',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    // Create loading box
    const box = document.createElement('div');
    Object.assign(box.style, {
      background: 'white',
      padding: '32px 48px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      fontSize: '20px',
      fontWeight: 'bold'
    });
    box.textContent = 'Loading...';

    this.loaderElement.appendChild(box);
    document.body.appendChild(this.loaderElement);
  }

  hide() {
    if (this.loaderElement) {
      document.body.removeChild(this.loaderElement);
      this.loaderElement = null;
    }
  }
}
