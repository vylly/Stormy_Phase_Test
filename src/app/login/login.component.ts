import { Component, ElementRef, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page, isUserInteractionEnabledProperty } from "tns-core-modules/ui/page";
import { DataService, User } from "../core/data.service";
import { TextField } from "tns-core-modules/ui/text-field";
import { request, getJSON, HttpRequestOptions } from "tns-core-modules/http";
import { ISpace } from "../core/data.service";
import * as EmailValidator from 'email-validator';
//import * as Https from 'nativescript-https'

@Component({
    moduleId: module.id,
    selector: "login-page",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"]
})
export class LoginComponent {

    isLoggingIn = true; // tell if the user is trying to log in or to sign up so we can display the right elements
    user: User;
    @ViewChild("password") password: ElementRef;
    @ViewChild("confirmPassword") confirmPassword: ElementRef;

    // Constructor
    constructor(private routerExtension: RouterExtensions, private page: Page, private dataService: DataService) {
        this.page.actionBarHidden = true;
        this.user = new User();
        this.user.spaces = new Array<ISpace>();
    };

    // Toggle isLoggingIn depending on if the user try to log in or to sign up
    toggleForm() {
        this.isLoggingIn = !this.isLoggingIn;
    }

    // Sign up or Log in
    submit() {
        // Check if an email and a pwd have been entered
        if (!this.user.email || !this.user.password) {
            alert("Please provide both an email address and password.");
            return;
        }

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
                    message: "Sorry, this has not been implemented yet :(",
                    okButtonText: "Ok"
                })
            }
        });
    }

    // Test the password and email and log in the user
    login() {
        request({
            url: "http://" + this.dataService.getIPServer() + "/login",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                email: this.user.email,
                password: this.user.password
            })
            // body: {
            //     "content" : JSON.stringify({
            //         email: this.user.email,
            //         password: this.user.password
            //     })
            // }
        }).then((response) => {
            let id = response.content.toJSON().id;
            let name = response.content.toJSON().name;
            let space = response.content.toJSON().space;
            if (id == -1) {
                alert("Wrong email or password. Please retry.");
            } else {
                this.user.id = id;
                this.user.name = name;
                this.user.token = response.content.toJSON().token;
                let listSpaces = response.content.toJSON().spaces;
                listSpaces.forEach(sp => this.user.spaces.push({ id: sp.id, name: sp.name })); // need to get the name here from the back end
                this.dataService.setCurrentUser(this.user);
                this.routerExtension.navigate(["../spaces"], { clearHistory: true });
            }
        }, (e) => { });
    }

    // Create the user in the backend and go to login again
    register() {
        // Check if the email is actually a valid email address
        if (EmailValidator.validate(this.user.email)) {
            if(this.user.confirmPassword == this.user.password) {
                request({
                    url: "http://" + this.dataService.getIPServer() + "/signup",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        email: this.user.email,
                        password: this.user.password,
                        name: this.user.name
                    })
                    // body: {
                    //     "content" : JSON.stringify({
                    //         email: this.user.email,
                    //         password: this.user.password,
                    //         name: this.user.name
                    //     })
                    // }
                }).then((response) => {
                    let id = response.content.toJSON().id;
                    if (id == -1) {
                        alert("Email already in use.");
                    } else {
                        let listSpaces = response.content.toJSON().spaces;
                        listSpaces.forEach(sp => this.user.spaces.push({ id: sp.id, name: sp.name })); // need to get the name here from the back end
                        this.user.id = id;
                        this.user.token = response.content.toJSON().token;
                        this.dataService.setCurrentUser(this.user);
                        this.routerExtension.navigate(["../spaces"], { clearHistory: true });
                    }
                }, (e) => { });
            } else {
                alert("The two passwords are not the same");
                return;
            }
            
        } else {
            alert("Please enter a valid email address.");
            return;
        }
    }

    focusPassword() {
        this.password.nativeElement.focus();
    }
    focusConfirmPassword() {
        if (!this.isLoggingIn) {
            this.confirmPassword.nativeElement.focus();
        }
    }

    // Handle text fields
    onChangeEmail(args) {
        let textField = <TextField>args.object;
        this.user.email = textField.text;
    }
    onChangeName(args) {
        let textField = <TextField>args.object;
        this.user.name = textField.text;
    }
    onChangePwd(args) {
        let textField = <TextField>args.object;
        this.user.password = textField.text;

    }
    onChangeConfPwd(args) {
        let textField = <TextField>args.object;
        this.user.confirmPassword = textField.text;
    }
}