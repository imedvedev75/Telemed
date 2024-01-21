import { TestBed } from '@angular/core/testing';

import { GVars } from './gvars.service';

describe('GVars', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GVars = TestBed.get(GVars);
    expect(service).toBeTruthy();
  });
});
