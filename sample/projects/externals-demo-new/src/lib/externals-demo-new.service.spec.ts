import { TestBed } from '@angular/core/testing';

import { ExternalsDemoNewService } from './externals-demo-new.service';

describe('ExternalsDemoNewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExternalsDemoNewService = TestBed.get(ExternalsDemoNewService);
    expect(service).toBeTruthy();
  });
});
