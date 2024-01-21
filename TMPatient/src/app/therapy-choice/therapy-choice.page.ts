import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-therapy-choice',
  templateUrl: './therapy-choice.page.html',
  styleUrls: ['./therapy-choice.page.scss'],
})
export class TherapyChoicePage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  one2one() {
    this.router.navigate(['/docs']);
  }
}
