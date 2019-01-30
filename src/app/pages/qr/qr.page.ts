import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';

import { Web3Service } from '../../services/web3';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.page.html',
  styleUrls: ['./qr.page.scss'],
})
export class QRPage implements OnInit {

  constructor(private qrScanner: QRScanner, private router: Router, private web3: Web3Service) { }

  ngOnInit() {
    console.log('Scan QR...');
    this.onScan();
  }

  onBack() {
    console.log('Destroying QR scanner...');
    this.qrScanner.destroy();
    this.router.navigate(['/']);
  }

  onScan() {
    this.qrScanner.prepare().then((status: QRScannerStatus) => {
      if (status.authorized) {
        // camera permission was granted
        // start scanning
        console.log('Scan QR - start scanning');
        this.qrScanner.show();
        // window.document.querySelector('app-root > ion-app').classList.add('hide');

        const scanSub = this.qrScanner.scan().subscribe((qr: any) => {
          console.log('Scanned code:', qr['result']);
          this.web3.login(qr['result']);

          this.qrScanner.hide(); // hide camera preview
          // window.document.querySelector('app-root > ion-app').classList.remove('hide');
          scanSub.unsubscribe(); // stop scanning
          this.qrScanner.destroy();
          this.router.navigate(['/']);
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
    }).catch((e: any) => console.log('Error:', e));
  }
}
