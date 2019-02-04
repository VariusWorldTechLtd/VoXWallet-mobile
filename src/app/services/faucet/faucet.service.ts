import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RXJS
import { Observable, of, pipe, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FaucetService {

  constructor(private http: HttpClient) { }

  sendRequest(entryPoint: string): Observable<any> {
    console.log('-- sendRequest --', entryPoint);
    return this.http.get<any>(entryPoint).pipe(
      tap( (res: any) => console.log(`sendRequest: ${ JSON.stringify(res) }`) ),
      catchError( (error: any) => throwError(error) )
    );
  }

  public requestLoginId(address: any): Observable<any> {
    return this.sendRequest(`https://voxwallet.vwtbet.com:8080?address=${address}`);
  }
}
