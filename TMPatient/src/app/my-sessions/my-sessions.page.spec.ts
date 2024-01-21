import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MySessionsPage } from './my-sessions.page';

describe('MySessionsPage', () => {
  let component: MySessionsPage;
  let fixture: ComponentFixture<MySessionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MySessionsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MySessionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
