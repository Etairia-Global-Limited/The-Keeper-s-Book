import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationClientList } from './application-client-list';

describe('ApplicationClientList', () => {
  let component: ApplicationClientList;
  let fixture: ComponentFixture<ApplicationClientList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationClientList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationClientList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
