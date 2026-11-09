import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationClientForm } from './application-client-form';

describe('ApplicationClientForm', () => {
  let component: ApplicationClientForm;
  let fixture: ComponentFixture<ApplicationClientForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationClientForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationClientForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
