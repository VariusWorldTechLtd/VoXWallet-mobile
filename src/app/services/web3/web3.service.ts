import { Injectable, Inject } from '@angular/core';
import { Storage } from '@ionic/storage';

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

import * as moment from 'moment';

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

    // Contract
    contract: any = null;

    constructor(@Inject(WEB3) public web3: Web3,
        private storage: Storage) {

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
        }
    }

    // Get/Set
    get defaultAccount(): string {
        return this.web3.eth.defaultAccount;
    }

    set defaultAccount(account: string) {
        this.web3.eth.defaultAccount = account;
    }

    // Watch web3
    public async watchEthereum() {
        console.log(`Ethereum - watchEthereum`);
        this.state = this.web3.currentProvider && !this.web3.currentProvider['Error'] ? STATE_LOADED : STATE_ERROR;
        console.log(`Ethereum - state: ${this.state}`);
        if (this.state === STATE_LOADED) {
            // Net
            console.log(`Ethereum - getNet`);
            const id = await this.web3.eth.net.getId();
            console.log(`Ethereum - id: ${id}`);
            if (id && id === 4) {
                // Contract
                this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                console.log(`Ethereum - contract: ${this.contract}`);

                console.log('Watching accounts...');
                setInterval(() => this.refreshAccounts(), 1000);
            } else {
                this.state = 'SWITCH TO RINKEBY';
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

    private async saveSession(address: string) {
        if (address) {
            let sessions: Array<any> = await this.storage.get('sessions');
            if (!sessions) {
                sessions = [];
            }
            sessions.push({ address: address, timestamp: moment().format('x') });
            this.storage.set('sessions', sessions);
            console.log('saveSession - after', JSON.stringify(sessions));
        }
    }

    public async login(address: string) {
        this.saveSession(address);
        try {
            const count = await this.web3.eth.getTransactionCount(this.defaultAccount);
            const nonce = this.web3.utils.toHex(count);
            const txValue = this.web3.utils.toHex(1);

            const from = this.web3.utils.toChecksumAddress(this.defaultAccount);
            const to = this.web3.utils.toChecksumAddress(address);

            // chainId: '0x03'
            const rawTx = {
                nonce: nonce,
                from: from,
                to: to,
                value: '0x0',
                gasLimit: '0x0',
                gasPrice: '0x0',
                data: this.contract.methods.transfer(to, txValue).encodeABI()
            };

            const privateKey = Buffer.from(this.accounts[0].privateKey.replace('0x', ''), 'hex');
            const tx = new ethereumjs(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();

            const receipt = await this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
            console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
            console.log(`From\'s balance after transfer: ${await this.contract.methods.balanceOf(from).call()}`);
            console.log(`To\'s balance after transfer: ${await this.contract.methods.balanceOf(to).call()}`);
        } catch (err) {
            console.log(err);
        }
    }
}
