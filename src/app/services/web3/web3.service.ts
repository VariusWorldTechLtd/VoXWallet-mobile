import { Injectable, Inject } from '@angular/core';
// Web3
import { WEB3 } from './web3.inject';
import Web3 from 'web3';
import ethereumjs from 'ethereumjs-tx';

declare var require: any;
declare var Buffer: any;

const contractAbi = require('./ABI.json');
const contractAddress = '';

// RXJS
import { Observable, Subject, pipe, bindNodeCallback, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

const ethereum = (<any>window).ethereum;

const STATE_LOADED = 'LOADED';
const STATE_CONNECTED = 'CONNECTED';
const STATE_UNLOCK = 'UNLOCK ACCOUNT';
const STATE_ERROR = 'ERROR';

// Nets
// networks = {
//     1: 'mainnet',
//     3: 'ropsten',
//     4: 'rinkeby',
//     42: 'koven'
// };

@Injectable({
    providedIn: 'root'
})
export class Web3Service {

    // State
    public state = 'NOT CONNECTED';

    // Accounts
    private accounts: any[] = [];
    public accountsObservable = new Subject<any>();

    // Socket
    socketProvider = null;

    // Contract
    contract: any = null;

    constructor(@Inject(WEB3) public web3: Web3) {
        console.log(`web3: ${web3}`);

        this.accounts[0] = web3.eth.accounts.create('V&6f94&z741v8T9PB9!45]oF62N91T7M');
        console.log(`acc: ${JSON.stringify(this.accounts[0])}`);
        this.defaultAccount = this.accounts[0].address;

        if (this.defaultAccount) {
            this.state = STATE_CONNECTED;

            console.log(`defaultAccount: ${this.defaultAccount}`);

            // Contract
            // , { from: this.defaultAccount, gasPrice: '0', gas: 0 }
            this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
            console.log(`Ethereum - contract: ${this.contract}`);

            // Socket
            this.socketProvider = new Web3.providers.WebsocketProvider('ws://ethtn3owi-dns-reg1-0.eastus.cloudapp.azure.com:8547');
            this.socketProvider.on('connect', () => console.log('WS Connected'));
            this.socketProvider.on('error', e => console.error('WS Error', e));
            this.socketProvider.on('end', e => console.error('WS End', e));

            // Provider
            console.log(`Ethereum - contract: setProvider`);
            this.contract.setProvider(this.socketProvider);
        }
    }

    // Get/Set
    get defaultAccount(): string {
        return this.web3.eth.defaultAccount;
    }

    set defaultAccount(account: string) {
        this.web3.eth.defaultAccount = account;
    }

    // MetaMask - new settings
    private async enableEthereum() {
        if (ethereum) {
            const res = await ethereum.enable();
            return res;
        }
        return false;
    }

    // Enable Metamask
    public async watchEthereum() {
        console.log(`Ethereum - watchEthereum`);
        await this.enableEthereum();
        this.state = this.web3.currentProvider && !this.web3.currentProvider['Error'] ? STATE_LOADED : STATE_ERROR;
        console.log(`Ethereum - state: ${this.state}`);
        if (this.state === STATE_LOADED) {
            // Net
            console.log(`Ethereum - getNet`);
            const id = await this.web3.eth.net.getId();
            console.log(`Ethereum - id: ${id}`);
            if (id && id === 118111120) {
                // Contract
                this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                console.log(`Ethereum - contract: ${this.contract}`);

                console.log('Watching accounts...');
                setInterval(() => this.refreshAccounts(), 1000);
            } else {
                this.state = 'SWITCH TO VOXNET';
            }
        } else {
            this.accountsObservable.next(this.state);
        }
    }

    private refreshAccounts() {
        this.web3.eth.getAccounts((err: any, accs: any) => {
            let localState = this.state;
            if (err != null) {
                localState = STATE_ERROR;
            }

            if (accs.length === 0) {
                localState = STATE_UNLOCK;
            }

            if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
                localState = STATE_CONNECTED;
                this.accounts = accs;
                this.defaultAccount = accs.length > 0 ? accs[0] : accs;
            }

            if (this.state !== localState) {
                this.state = localState;
                this.accountsObservable.next(this.state);
            }
        });
    }

    // Returns all accounts available
    public getAccounts(): Observable<string[]> {
        return bindNodeCallback(this.web3.eth.getAccounts)();
    }

    // Get the current account
    public getCurrentAccount(): Observable<string | Error> {
        if (this.web3.eth.defaultAccount) {
            return of(this.web3.eth.defaultAccount);
        } else {
            return this.getAccounts().pipe(
                tap((accounts: string[]) => {
                    if (accounts.length === 0) { throw new Error('No accounts available!'); }
                }),
                map((accounts: string[]) => accounts[0]),
                tap((account: string) => this.defaultAccount = account),
                catchError((err: Error) => of(err))
            );
        }
    }

    // private async signTransaction(data: any) {
    //     const nonce = await this.web3.eth.getTransactionCount(this.defaultAccount);
    //     // this.web3.utils.toHex(nonce)
    //     const rawTx = {
    //         nonce: nonce || this.web3.utils.toHex(0),
    //         gasPrice: '0x00',
    //         gasLimit: '0x2FAF080',
    //         to: contractAddress,
    //         value: '0x00',
    //         data: data
    //     };
    //     const tx = new ethereumjs(rawTx);
    //     tx.sign(Buffer.from(this.accounts[0].privateKey.replace('0x', ''), 'hex'));

    //     const raw = '0x' + tx.serialize().toString('hex');
    //     const transactionHash = await this.web3.eth.sendSignedTransaction(raw);
    //     return transactionHash;
    // }

    // public async placeBet(index: number, amount: number) {
    //     try {
    //         console.log(`placeBet: ${this.defaultAccount}, ${index}, ${amount}, ${this.contract}`);
    //         const data = await this.contract.methods.placeBet(index, amount).encodeABI();
    //         const tx = this.signTransaction(data);
    //         return tx;
    //     } catch (error) {
    //         console.error('placeBet - error', error);
    //         return error;
    //     }
    // }

    // public async playerReadyToRace() {
    //     try {
    //         console.log(`playerReadyToRace`);
    //         const data = await this.contract.methods.playerReadyToRace().encodeABI();
    //         const tx = this.signTransaction(data);
    //         return tx;
    //     } catch (error) {
    //         console.error('playerReadyToRace - error', error);
    //         return error;
    //     }
    // }
}
