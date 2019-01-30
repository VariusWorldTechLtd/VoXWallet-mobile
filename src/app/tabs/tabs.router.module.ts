import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'activity',
        children: [
          {
            path: '',
            loadChildren: '../pages/activity/activity.module#ActivityPageModule'
          }
        ]
      },
      {
        path: 'deposit',
        children: [
          {
            path: '',
            loadChildren: '../pages/deposit/deposit.module#DepositPageModule'
          }
        ]
      },
      {
        path: 'transfer',
        children: [
          {
            path: '',
            loadChildren: '../pages/transfer/transfer.module#TransferPageModule'
          }
        ]
      },
      {
        path: 'withdraw',
        children: [
          {
            path: '',
            loadChildren: '../pages/withdraw/withdraw.module#WithdrawPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/activity',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/activity',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
