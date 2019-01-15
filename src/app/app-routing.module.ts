import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { LoginComponent } from "./login/login.component";
import { SpacesComponent } from "./spaces/spaces.component";

export const COMPONENTS = [LoginComponent, SpacesComponent];
const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    {
        path: "login", component: LoginComponent
    },
    {
        path: "spaces", component: SpacesComponent,
    },
    {
        path: "tabs",
        loadChildren: "~/app/tabs/tabs.module#TabsModule"
    }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes), NativeScriptModule],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
