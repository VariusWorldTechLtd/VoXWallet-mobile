import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { ModalController } from '@ionic/angular';
// import { QRPage } from '../qr/qr.page';

import { FaucetService } from '../../services/faucet';
import { Web3Service } from '../../services/web3';

@Component({
  selector: 'app-activity',
  templateUrl: 'activity.page.html',
  styleUrls: ['activity.page.scss']
})
export class ActivityPage implements OnInit {

  // Flags
  loading = true;

  // Balance
  loginTokensBalance = 0;

  // public modalController: ModalController
  constructor(private router: Router, private faucet: FaucetService, private web3: Web3Service) {
  }

  ngOnInit() {
    this.web3.watchEthereum();
    this.web3.accountsObservable.subscribe( (data: any) => {
      this.loading = false;
    } );
  }

  // async
  onQR() {
    // const modal = await this.modalController.create({ component: QRPage });
    // return await modal.present();
    this.router.navigate(['/qr']);
  }

  onGetLoginTokens() {
    console.log(`onGetLoginTokens: ${ this.web3.defaultAccount }`);
    this.faucet.requestLoginId(this.web3.defaultAccount).subscribe( (result: any) => {
      console.log(`onGetLoginTokens - result: ${ result }`);
    } );
  }

  async onBalanceLoginTokens() {
    console.log(`onBalanceLoginTokens: ${ this.web3.defaultAccount }`);
    this.loginTokensBalance = await this.web3.getLoginTokensBalance();
  }
}
