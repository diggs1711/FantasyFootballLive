import { TestBed } from '@angular/core/testing';

import { FplDataService } from './fpl-data.service';

describe('FplDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FplDataService = TestBed.get(FplDataService);
    expect(service).toBeTruthy();
  });
});
