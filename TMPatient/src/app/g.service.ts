import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, ModalController } from '@ionic/angular';
import { SERVER_URL } from 'src/environments/environment';
//import { LoginPage } from './login/login.page';
import { Router } from '@angular/router';
import { GVars } from './gvars.service';

@Injectable({
  providedIn: 'root'
})
export class G {

  constructor(private aHttpClient: HttpClient,
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private router: Router,
    public gv: GVars) { }

  async post(res, data, formData=false) {
    return new Promise( function(resolve, reject)  {
      let opts = formData ? {} : {withCredentials: true,
      observe: 'response',  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'rejectUnauthorized': 'false' }};
      this.aHttpClient.post(SERVER_URL + res, data, opts).toPromise()
      .then( (ret) => {
        resolve(ret.body);
      })
      .catch( async function(err) {
        if (401 == err.status) {  //need to login
          if (await this.login()) {
            this.aHttpClient.post(SERVER_URL + res, data, opts).toPromise()
            .then( (ret) => resolve(ret.body))
            .catch( (err) => reject(err))
          }
          else {
            reject('not logged');
          }
        }
        else {        
          this.showToast(err.message);
          reject(err);
        }
      }.bind(this))
    }.bind(this)
   )
  }

  async showToast(txt) {
    const alert = await this.toastController.create({
      message: txt,
      duration: 2000,
    });
    await alert.present();
  }

  async showAlert(txt, header="Info") {
    const alert = await this.toastController.create({
      header: header,
      message: txt,
      buttons: ['OK']
    });
    await alert.present();
  }

  /*
  async login_old() {
    const modal = await this.modalCtrl.create({
      component: LoginPage,
      //cssClass: "my-custom-modal-css"
      cssClass: 'auto-height'
    });
    await modal.present();
    let {data} = await modal.onDidDismiss();   
    return data;
   }
   */

   async login() {
    this.router.navigate(['/login']);
   }

   async check_login() { 
    try {
      var ret = await this.aHttpClient.post(SERVER_URL + '/check_login', {}, {withCredentials: true,
        observe: 'response',  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'rejectUnauthorized': 'false' }}).toPromise();
      //await this.post('/check_login', {});
      this.gv.loggedEMail = ret.body['email'];
      return true;
    }
    catch(err) {
      return false;
    };
  }


}
