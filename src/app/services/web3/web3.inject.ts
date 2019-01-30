import { InjectionToken } from '@angular/core';
import Web3 from 'web3';

const ethereum = (<any>window).ethereum;

export const factoryProvider = () => {
    if (ethereum) {
        console.log(`factoryProvider - ethereum: ${ ethereum }`);
        return new Web3(ethereum);
    } else if ( (<any>window).web3 ) {
        console.log(`factoryProvider - givenProvider: ${ (<any>window).web3 }`);
        return new Web3( Web3.givenProvider || 'ws://localhost:8546' );
    } else {
        // console.log(`factoryProvider - Error: NOT CONNECTED.`);
        // return { Error: 'Install https://metamask.io/ and/or unlock your wallet!' };
        console.log(`factoryProvider - AZURA POA!`);
        return new Web3( new Web3.providers.HttpProvider('http://ethtn3owi-dns-reg1.eastus.cloudapp.azure.com:8540') );
        // return new Web3( new Web3.providers.WebsocketProvider('ws://ethtn3owi-dns-reg1-0.eastus.cloudapp.azure.com:8547') );
    }
};

// new Web3( factoryProvider() )
export const WEB3 = new InjectionToken<Web3>('web3', {
    providedIn: 'root',
    factory: () => factoryProvider()
});
