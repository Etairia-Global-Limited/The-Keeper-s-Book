import { TestBed } from '@angular/core/testing';

import { ApplicationRoleService } from './application-role-service';

describe('ApplicationRoleService', () => {
  let service: ApplicationRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
