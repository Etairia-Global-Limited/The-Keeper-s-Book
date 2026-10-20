import { TestBed } from '@angular/core/testing';

import { ApplicationOwnerService } from './application-owner-service';

describe('ApplicationOwnerService', () => {
  let service: ApplicationOwnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationOwnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
