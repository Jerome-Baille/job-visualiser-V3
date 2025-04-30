
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginFormComponent } from "./login-form.component";
import { RegisterFormComponent } from "./register-form.component";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, RegisterFormComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isLogin = true;

  toggleForm() {
    this.isLogin = !this.isLogin;
  }
}
