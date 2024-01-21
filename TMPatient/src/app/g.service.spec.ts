import { TestBed } from '@angular/core/testing';

import { G } from './g.service';

describe('GService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: G = TestBed.get(G);
    expect(service).toBeTruthy();
  });
});
