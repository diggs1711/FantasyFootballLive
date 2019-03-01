import { TestBed } from '@angular/core/testing';

import { Static.DataService } from './static.data.service';

describe('Static.DataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Static.DataService = TestBed.get(Static.DataService);
    expect(service).toBeTruthy();
  });
});
