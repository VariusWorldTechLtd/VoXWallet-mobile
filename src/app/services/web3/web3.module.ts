// , ModuleWithProviders, Type
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var require: any;

// Web3
import { WEB3, factoryProvider } from './web3.inject';
const Web3 = require('web3');

// Services
import { Web3Service } from './web3.service';

// MODULE FACTORY
@NgModule({
  imports: [ CommonModule ],
  providers: [ Web3Service, { provide: WEB3, useFactory: () => new Web3( factoryProvider() )} ]
})
export class Web3Module { }
