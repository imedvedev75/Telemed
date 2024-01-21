import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from 'src/environments/environment';
import { Router } from '@angular/router';
import { G } from '../g.service';
import { GVars } from '../gvars.service';

const KEY_EMAIL = "EMAIL";
const KEY_PASSWORD = "PASSWORD";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  @ViewChild('emailField', {static: false}) emailField: any;
  @ViewChild('nameField', {static: false}) nameField: any;
  @ViewChild('passwordField', {static: false}) passwordField: any;
  @ViewChild('confirmPasswordField', {static: false}) confirmPasswordField: any;
  public emailText: string;
  public nameText: string;
  public passwordText: string;
  public confirmPasswordText: string;
  public footer: string;

  constructor(private modalCtrl: ModalController,
    private storage: Storage,
    private aHttpClient: HttpClient,
    private router: Router,
    public gv: GVars
    ) {
  }

  ngOnInit() {}

  ionViewDidEnter(): void {
    setTimeout(async function()  {
      this.emailText = await this.storage.get(KEY_EMAIL);
      this.nameText = await this.storage.get('NAME');
      this.passwordText = await this.storage.get(KEY_PASSWORD);
      if (!this.emailText) {
        this.emailField.setFocus();
      }
      else if (!this.nameText)
        this.nameField.setFocus();      
      else if (!this.passwordText)
        this.passwordField.setFocus();
      else
        this.confirmPasswordField.setFocus();
    }.bind(this), 200);
  }

  async register() {
    if (this.passwordText != this.confirmPasswordText) {
      this.footer = "Passwords do not match!";
      return;
    }

    let input = {
      email: this.emailText,
      name: this.nameText,
      password: this.passwordText
    };

    this.storage.set(KEY_EMAIL, this.emailText);
    this.storage.set('NAME', this.nameText);

    try {
      var resp = await this.aHttpClient.post(SERVER_URL + "/new_user", input, 
        {withCredentials: true, observe: 'response',  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}).toPromise();
      //this.modalCtrl.dismiss(resp);
      this.gv.loggedEmail = this.emailText;
      this.router.navigate(['/home']);
    }
    catch(error) {
      if (error.status == 400) { //user exists
        this.footer = "User already exists";
      }
      else {
        this.footer = "Error registering new user";
      }
    };
  }

  close() {
    //this.modalCtrl.dismiss(null);
  }  
}
