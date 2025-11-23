import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SesionesAgendadas } from './sesiones-agendadas';

describe('SesionesAgendadas', () => {
  let component: SesionesAgendadas;
  let fixture: ComponentFixture<SesionesAgendadas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SesionesAgendadas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SesionesAgendadas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
