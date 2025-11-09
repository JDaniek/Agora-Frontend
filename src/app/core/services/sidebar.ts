import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  // 1. Un "Subject" que guarda el estado actual. Inicia en 'false' (cerrado).
  private readonly _isOpen = new BehaviorSubject<boolean>(false);

  // 2. Un "Observable" público para que los componentes se suscriban y escuchen
  public readonly isOpen$ = this._isOpen.asObservable();

  constructor() { }

  /** Alterna el estado actual del sidebar (abierto/cerrado) */
  toggle(): void {
    this._isOpen.next(!this._isOpen.value);
  }

  /** Abre el sidebar */
  open(): void {
    this._isOpen.next(true);
  }

  /** Cierra el sidebar */
  close(): void {
    this._isOpen.next(false);
  }
}