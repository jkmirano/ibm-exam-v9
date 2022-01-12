import { TestBed } from '@angular/core/testing';

import { FormDataSourceService } from './form-data-source.service';

describe('FormDataSourceService', () => {
  let service: FormDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
