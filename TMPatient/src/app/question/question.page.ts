import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss'],
})
export class QuestionPage implements OnInit {

  q;

  constructor(private modalCtrl: ModalController,
    private navParam: NavParams) { }

  ngOnInit() {
    this.q = this.navParam.get('q'); 
  }

  click(o) {
    this.modalCtrl.dismiss(o);
  }

}
