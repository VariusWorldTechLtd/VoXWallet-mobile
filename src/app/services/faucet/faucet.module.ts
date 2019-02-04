import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { FaucetService } from './faucet.service';

// MODULE FACTORY
@NgModule({
  imports: [ CommonModule ],
  providers: [ FaucetService ]
})
export class FaucetModule { }
