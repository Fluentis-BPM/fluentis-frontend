import { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
    clientId: "cbd0adaf-be24-4605-942b-d64ace0763a7",
    authority: "https://login.microsoftonline.com/846e3824-7539-4a0d-bfb6-00745fba3165",
    redirectUri: "http://localhost:5173",
    },
    cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
    },
};

export const loginRequest: PopupRequest = {
    scopes: [
    "https://asofarmabpm.onmicrosoft.com/badd1a2d-8427-4f00-b56d-ddbbd9f1883e/access_as_user",
    "openid",
    "profile",
    "email",
    ],
};