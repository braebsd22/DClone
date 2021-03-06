import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { DashboardOverviewComponent } from './dashboard/dashboard-overview/dashboard-overview.component';
import { GuildComponent } from './dashboard/guild/guild.component';
import { DashboardAuthGuard } from './guards/dashboard-auth.guard';
import { GuildAuthGuard } from './guards/guild-auth.guard';
import { DocsComponent } from './docs/docs.component';
import { CanDeactivateDashboard } from './guards/can-deactivate-dashboard.guard';
import { SignUpComponent } from './sign-up/sign-up.component';
import { TextChannelComponent } from './dashboard/text-channel/text-channel.component';
import { GuildSettingsComponent } from './dashboard/guild-settings/overview/guild-settings.component';
import { InvitesComponent } from './dashboard/guild-settings/invites/invites.component';
import { RolesComponent } from './dashboard/guild-settings/roles/roles.component';
import { DMChannelAuthGuard } from './dmchannel-auth.guard';
import { DMChannelComponent } from './dashboard/dmchannel/dmchannel.component';
import { UserSettingsComponent } from './dashboard/user-settings/user-settings.component';
import { BotListComponent } from './dashboard/bot-list/bot-list.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'docs',
    component: DocsComponent
  },
  {
    path: 'docs/:page',
    component: DocsComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    path: 'logout',
    component: LogoutComponent
  },
  {
    path: 'channels/@me',
    component: DashboardOverviewComponent,
    canActivate: [DashboardAuthGuard]
  },
  {
    path: 'channels/@me/settings',
    component: UserSettingsComponent,
    canActivate: [DashboardAuthGuard]
  },
  {
    path: 'channels/@me/:channelId',
    component: DMChannelComponent,
    canActivate: [DMChannelAuthGuard, DashboardAuthGuard]
  },
  {
    path: 'channels/:guildId',
    component: GuildComponent,
    canActivate: [DashboardAuthGuard, GuildAuthGuard],
    canDeactivate: [CanDeactivateDashboard]
  },
  {
    path: 'channels/:guildId/settings',
    component: GuildSettingsComponent,
    canActivate: [DashboardAuthGuard, GuildAuthGuard],
    canDeactivate: [CanDeactivateDashboard]
  },
  {
    path: 'channels/:guildId/roles',
    component: RolesComponent,
    canActivate: [DashboardAuthGuard, GuildAuthGuard],
    canDeactivate: [CanDeactivateDashboard]
  },
  {
    path: 'channels/:guildId/bots',
    component: BotListComponent,
    canActivate: [DashboardAuthGuard, GuildAuthGuard],
    canDeactivate: [CanDeactivateDashboard]
  },
  {
    path: 'channels/:guildId/invites',
    component: InvitesComponent,
    canActivate: [DashboardAuthGuard, GuildAuthGuard],
    canDeactivate: [CanDeactivateDashboard]
  },
  {
    path: 'channels/:guildId/:channelId',
    component: TextChannelComponent,
    canActivate: [DashboardAuthGuard, GuildAuthGuard],
    canDeactivate: [CanDeactivateDashboard]
  },
  // {
  //   path: 'channels/:guildId/:channelId/settings',
  //   component: SettingsModuleComponent,
  //   canActivate: [GuildAuthGuard],
  //   canDeactivate: [CanDeactivateDashboard]
  // },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
