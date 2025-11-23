import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilAlumno } from './perfil-alumno';

describe('PerfilAlumno', () => {
  let component: PerfilAlumno;
  let fixture: ComponentFixture<PerfilAlumno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilAlumno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilAlumno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
