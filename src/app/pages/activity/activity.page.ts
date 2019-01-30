import { Component } from '@angular/core';
import { Router } from '@angular/router';
// import { ModalController } from '@ionic/angular';

import { QRPage } from '../qr/qr.page';

@Component({
  selector: 'app-activity',
  templateUrl: 'activity.page.html',
  styleUrls: ['activity.page.scss']
})
export class ActivityPage {

  // public modalController: ModalController
  constructor(private router: Router) {
  }

  // async
  onQR() {
    // const modal = await this.modalController.create({ component: QRPage });
    // return await modal.present();
    this.router.navigate(['/qr']);
  }
}
