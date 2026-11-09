import { TestBed } from '@angular/core/testing';

import { ApplicationClientService } from './application-client-service';

describe('ApplicationClientService', () => {
  let service: ApplicationClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
