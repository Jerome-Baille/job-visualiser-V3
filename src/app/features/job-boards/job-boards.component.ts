import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

interface JobBoard {
  name: string;
  link: string;
  logo: string;
}

@Component({
  selector: 'app-job-boards',
  standalone: true,
  imports: [NgFor],
  templateUrl: './job-boards.component.html',
  styleUrls: ['./job-boards.component.scss']
})
export class JobBoardsComponent {
  jobBoardsData: JobBoard[] = [
    { name: 'LinkedIn', link: 'https://www.linkedin.com/jobs/', logo: 'assets/linkedin-icon.svg' },
    { name: 'Indeed', link: 'https://fr.indeed.com/?r=us', logo: 'assets/indeed-logo.svg' },
    { name: 'Hello Work', link: 'https://www.hellowork.com/fr-fr/candidat/offres.html', logo: 'assets/hello-work-logo.svg' },
    { name: 'Welcome to the Jungle', link: 'https://www.welcometothejungle.com/fr/jobs', logo: 'assets/wttj-logo.png' },
    { name: 'Apec', link: 'https://www.apec.fr/candidat/recherche-emploi.html/emploi?motsCles=d%C3%A9veloppeur%20front&typesTeletravail=20767&niveauxExperience=101881', logo: 'assets/apec-logo.png' },
    { name: 'Bevopr', link: 'https://bevopr.io/explorer-jobs', logo: 'assets/bevopr-logo.png' },
    { name: 'Circular', link: 'https://circular.io/candidates/', logo: 'assets/circular-logo.jpg' },
    { name: 'Jean Paul', link: 'https://www.jean-paul.io/profil', logo: 'assets/jean-paul-logo.jpg' },
    { name: 'Kicklok', link: 'https://app.kicklox.com/matches', logo: 'assets/kicklox-logo.png' }
  ];
}
