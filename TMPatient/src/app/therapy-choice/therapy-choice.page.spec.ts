import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TherapyChoicePage } from './therapy-choice.page';

describe('TherapyChoicePage', () => {
  let component: TherapyChoicePage;
  let fixture: ComponentFixture<TherapyChoicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TherapyChoicePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TherapyChoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
