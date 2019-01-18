import { TestBed } from '@angular/core/testing';

import { FplTeamServiceService } from './fpl-team-service.service';

describe('FplTeamServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FplTeamServiceService = TestBed.get(FplTeamServiceService);
    expect(service).toBeTruthy();
  });
});
