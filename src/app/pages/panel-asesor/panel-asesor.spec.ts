import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAsesor } from './panel-asesor';

describe('PanelAsesor', () => {
  let component: PanelAsesor;
  let fixture: ComponentFixture<PanelAsesor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAsesor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAsesor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
