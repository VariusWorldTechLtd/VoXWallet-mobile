import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.page.html',
  styleUrls: ['./qr.page.scss'],
})
export class QRPage implements OnInit {

  constructor(private modalController: ModalController, private qrScanner: QRScanner) { }

  ngOnInit() {
    this.onScan();
  }

  onClose(data: any = null) {
    this.modalController.dismiss(data);
  }

  onScan() {
    this.qrScanner.prepare().then((status: QRScannerStatus) => {
      if (status.authorized) {
        // camera permission was granted
        // start scanning
        this.qrScanner.show();
        // window.document.querySelector('app-root > ion-app').classList.add('hide');

        const scanSub = this.qrScanner.scan().subscribe((text: string) => {
          console.log('Scanned something', text);
          this.qrScanner.hide(); // hide camera preview
          // window.document.querySelector('app-root > ion-app').classList.remove('hide');

          scanSub.unsubscribe(); // stop scanning
        });
      } else if (status.denied) {
        // camera permission was permanently denied
        // you must use QRScanner.openSettings() method to guide the user to the settings page
        // then they can grant the permission from there
        console.log('Status denied');
      } else {
        // permission was denied, but not permanently. You can ask for permission again at a later time.
        console.log('Status auth');
      }
    })
      .catch((e: any) => console.log('Error is', e));
  }
}
