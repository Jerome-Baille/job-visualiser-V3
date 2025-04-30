import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderElement: HTMLElement | null = null;

  show() {
    if (this.loaderElement) return;
    this.loaderElement = document.createElement('div');
    this.loaderElement.innerHTML = `<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.2);z-index:9998;display:flex;align-items:center;justify-content:center;"><div style='background:white;padding:32px 48px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:20px;font-weight:bold;'>Loading...</div></div>`;
    document.body.appendChild(this.loaderElement);
  }

  hide() {
    if (this.loaderElement) {
      document.body.removeChild(this.loaderElement);
      this.loaderElement = null;
    }
  }
}
