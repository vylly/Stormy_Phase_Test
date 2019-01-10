import { Component, ElementRef, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { DataService } from "../core/data.service";

@Component({
    moduleId: module.id,
    selector: "login-page",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"]
})
export class LoginComponent {

    isLoggingIn = true; // tell if the user is trying to log in or to sign up so we can display the right elements
    user: {email: string, password: string, confirmPassword: string}
    @ViewChild("password") password: ElementRef;
    @ViewChild("confirmPassword") confirmPassword: ElementRef;

    // Constructor
    constructor(private routerExtension: RouterExtensions, private page: Page, private dataService: DataService) {
        this.page.actionBarHidden = true;
        this.user = {email: "", password: "", confirmPassword: ""};
    };

    // Toggle isLoggingIn depending on if the user try to log in or to sign up
    toggleForm() {
        this.isLoggingIn = !this.isLoggingIn;
    }

    // Sign up or Log in
    submit() {
        /*
        // Check if an email and a pwd have been entered
        if (!this.user.email || !this.user.password) {
            alert("Please provide both an email address and password.");
            return;
        }
        */

        if (this.isLoggingIn) {
            this.login();
        } else {
            this.register();
        }
    }

    // Display a prompt to enter the email address and find the password
    forgotPassword() {
    prompt({
        title: "Forgot Password",
        message: "Enter the email address you used to register.",
        defaultText: "",
        okButtonText: "Ok",
        cancelButtonText: "Cancel"
    }).then((data) => {
        if (data.result) {
        // Call the backend to reset the password
        alert({
            title: "APP NAME",
            message: "Your password has been sent to your email address.",
            okButtonText: "Ok"
        })
        }
    });
    }

    // Test the password and email and log in the user
    login() {
        // Need to send request to backend here to try to log in
        this.routerExtension.navigate(["../tabs/default"])
    }

    // Create the user in the backend and go to login again
    register() {
        // Need to send request to backend here to create user
        this.isLoggingIn = true;
    }
}