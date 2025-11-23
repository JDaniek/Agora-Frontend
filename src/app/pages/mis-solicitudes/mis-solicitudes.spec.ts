import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisSolicitudes } from './mis-solicitudes';

describe('MisSolicitudes', () => {
  let component: MisSolicitudes;
  let fixture: ComponentFixture<MisSolicitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisSolicitudes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisSolicitudes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
