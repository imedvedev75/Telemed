import { Component, OnInit } from '@angular/core';
import { G } from '../g.service';
import { NavController } from '@ionic/angular';
import { GVars } from '../gvars.service';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.page.html',
  styleUrls: ['./docs.page.scss'],
})
export class DocsPage implements OnInit {

  docs = [
    {
      name: 'Alexander Meier',
      img: 'assets/images/doc1.jpg',
      specs: ['Clinical Psychology', 'Cognitive and Perceptual Psychology', 'Counseling Psychology', 'Developmental Psychology']
    },
    {
      name: 'Gerd Wendel',
      img: 'assets/images/doc2.jpg',
      specs: ['Educational Psychology', 'Engineering Psychology', 'Experimental Psychology']
    },
    {
      name: 'Heleha Steinhauser',
      img: 'assets/images/doc3.jpg',
      specs: ['Neuropsychology', 'School Psychology']
    },
  ]

  constructor(
    private navCtrl: NavController,
    private g: G,
    public gv: GVars
  ) { 
    console.log('DocsPage constructor');
  }

  ngOnInit() {
  }

  click(doc) {
    this.gv.doc = doc;
    this.navCtrl.navigateForward(['/doc']);
  }

  logout() {
    this.g.post('/logout', {});
  }
}
