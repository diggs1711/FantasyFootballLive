import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceChangesPage } from './price-changes.page';

describe('PriceChangesPage', () => {
  let component: PriceChangesPage;
  let fixture: ComponentFixture<PriceChangesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceChangesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceChangesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
