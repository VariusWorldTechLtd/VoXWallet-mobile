import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { QRPage } from '../qr/qr.page';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(public modalController: ModalController) {
  }

  async onQR() {
    const modal = await this.modalController.create({ component: QRPage });
    return await modal.present();
  }
}
