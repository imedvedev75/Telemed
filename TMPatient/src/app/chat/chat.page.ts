import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { QuestionPage } from '../question/question.page';
import { AlertContext } from 'twilio/lib/rest/monitor/v1/alert';
import { Router } from '@angular/router';
import { ProtractorExpectedConditions } from 'protractor';
import { G } from '../g.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  questions = [
    {
      ind: 0,
      q: 'Do you experience experience depression or low mood?',
      opts: ['Never', 'Sometimes', 'Always']
    },
    {
      ind: 1,
      q: 'Do you feel completely alone?',
      opts: ['Yes', 'A little', 'No']
    },
    {
      q: 'Do you have communication difficulties?',
      opts: ['Not at all', 'From time to time', 'Often']
    },
    /*{
      q: 'Do you prefer to apprear anonymous to the therapist?',
      opts: ['Yes', 'No']
    },*/
  ];

  answers = [];
  q;
  currQ = -1;
  editQ = -1;
  finished = false;
  animation = false;
  
  constructor(private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private router: Router,
    private g: G) { }

  async ngOnInit() {
    this.ask(0);
  }

  /*
  getClass(item) {
    return (item.q) ? 'q' : 'a';
  }
  
  align(item) {
    return (item.q) ? 'left' : 'right';
  }
  */

  async askQuestion(q) {
    const modal = await this.modalCtrl.create({
      component: QuestionPage,
      cssClass: 'auto-height',
      componentProps: {q: q}
    });
    await modal.present();
    var {data} =  await modal.onDidDismiss();
    return data;
   }  

  async edit_answer(i) {
    if (this.finished) {
      this.currQ = i;
    }
  }

  getQAClass(i) {
    return (i==this.currQ && this.finished) ? 'qa_highlighted' : 'qa_normal';
  }

  sel_answer(i) {
    this.answers[this.currQ] = i; 
    if (!this.finished) {
      this.currQ++;
      if (this.currQ >= this.questions.length) {
        this.finish();
        return;
      }
      this.ask(this.currQ);
    }
    else {  // we r editing answer
      this.currQ = -1;
    }
  }

  async finish() {
    this.currQ = -1;
    this.finished = true;
  
    /*
    const alert = await this.alertCtrl.create({
      header: 'Completed',
      message: 'You have completed your profile.',
      buttons: ['Proceed']
    });
    await alert.present();    
    await alert.onDidDismiss();

    this.router.navigate(['/therapy-choice']);
    */
  }

  async proceed() {
    await this.g.post('/save_profile', this.answers);
    this.router.navigate(['dashboard']);
  }

  ask(ind) {
    this.currQ = -1;
    this.animation = true;
    setTimeout(function() {
      this.animation = false;
      this.answers.push(-1)
      this.currQ = ind;  
    }.bind(this), 1000);
  }



}
