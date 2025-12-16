import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _visible = signal(false);

  readonly visible = computed(() => this._visible());

  show() {
    this._visible.set(true);
  }

  hide() {
    this._visible.set(false);
  }
}
