import { Routes } from '@angular/router';

import { GenericPageComponent } from './components/generic-page/generic-page.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
	{
		path: '', canActivateChild: [authGuard],
		children: [
			{ path: 'login', component: LoginComponent, title: 'Operação Curiosidade - Login' },
			{ path: 'home', component: HomeComponent, title: 'Operação Curiosidade - Home' },
			{ path: 'registration', component: GenericPageComponent, title: 'Operação Curiosidade - Cadastro' },
			{ path: 'new-register', title: 'Operação Curiosidade - Novo Cadastro', component: RegisterComponent },
			{ path: 'edit-register', title: 'Operação Curiosidade - Editar Cadastro', component: RegisterComponent },
			{ path: 'reports', component: GenericPageComponent, title: 'Operação Curiosidade - Relatórios' },
			{ path: 'report-details', component: GenericPageComponent, title: 'Operação Curiosidade - Detalhes do Relatório' },
			{ path: 'logging', component: GenericPageComponent, title: 'Operação Curiosidade - Registros' },
			{ path: '', redirectTo: '/home', pathMatch: 'full' },
			{ path: '**', redirectTo: '/home' }
		]
	}
];
