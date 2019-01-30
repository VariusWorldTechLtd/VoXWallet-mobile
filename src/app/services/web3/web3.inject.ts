import { InjectionToken } from '@angular/core';
import Web3 from 'web3';

export const factoryProvider = () => {
    return new Web3( new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7df925ff48cc43f98cfe6548bf7fc678') );
};

export const WEB3 = new InjectionToken<Web3>('web3', {
    providedIn: 'root',
    factory: () => factoryProvider()
});
