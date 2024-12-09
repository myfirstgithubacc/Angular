import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreJobOrderComponent } from './core-job-order.component';

const routes: Routes = [
	{
		path: '',
		component: CoreJobOrderComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'candidate-pool' },
			{
				path: 'candidate-pool',
				data: { breadcrumb: 'Candidate Pool', title: 'Candidate Pool' },
				loadChildren: () =>
					import('./candidate-pool/candidate-pool.module').then((m) =>
						m.CandidatePoolModule)
			},
			{
				path: 'light-industrial',
				data: { breadcrumb: 'Light Industrial Request', title: 'Light Industrial Request' },
				loadChildren: () =>
					import('./light-industrial/light-industrial.module').then((m) =>
						m.LightIndustrialModule)
			},
			{
				path: 'review-candidates',
				data: { breadcrumb: 'Review Candidates', title: 'Review Candidates' },
				loadChildren: () =>
					import('./review-candidates/review-candidates.module').then((m) =>
						m.ReviewCandidatesModule)
			},
			{
				path: 'professional',
				data: { breadcrumb: 'Professional Request', title: 'Professional Request' },
				loadChildren: () =>
					import('./professional/professional.module').then((m) =>
						m.ProfessionalModule)
			},
			{
				path: 'submittals',
				data: { breadcrumb: 'Submittal', title: 'Submittal' },
				loadChildren: () =>
					import('./submittals/submittals.module').then((m) =>
						m.SubmittalsModule)
			},
			{
				path: 'interview',
				data: { breadcrumb: 'Interview Request', title: 'Interview Request' },
				loadChildren: () =>
					import('./professional/interview/interview.module').then((m) =>
						m.InterviewModule)
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class JobOrderRoutingModule { }
