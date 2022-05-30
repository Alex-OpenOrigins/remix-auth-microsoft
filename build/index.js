"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicrosoftStrategy = void 0;
const remix_auth_oauth2_1 = require("remix-auth-oauth2");
class MicrosoftStrategy extends remix_auth_oauth2_1.OAuth2Strategy {
    constructor({ clientID, clientSecret, callbackURL, scope, prompt, tenant = "common", baseURL = "login.microsoftonline.com", userFlowID, }, verify) {
        super({
            clientID,
            clientSecret,
            callbackURL,
            authorizationURL: `https://${baseURL}/${tenant}/oauth2/v2.0/authorize`,
            tokenURL: `https://${baseURL}/${tenant}/oauth2/v2.0/token`,
        }, verify);
        this.name = "microsoft";
        this.userInfoURL = "https://graph.microsoft.com/oidc/userinfo";
        this.scope = scope !== null && scope !== void 0 ? scope : "openid profile email";
        this.prompt = prompt !== null && prompt !== void 0 ? prompt : "none";
        this.userFlowID = userFlowID !== null && userFlowID !== void 0 ? userFlowID : "";
        this.clientSecret = clientSecret !== null && clientSecret !== void 0 ? clientSecret : "";
    }
    authorizationParams() {
        return new URLSearchParams({
            scope: this.scope,
            prompt: this.prompt,
            p: this.userFlowID
        });
    }
    tokenParams() {
        return new URLSearchParams({
            p: this.userFlowID,
            client_secret: this.clientSecret
        });
    }
    async userProfile(accessToken) {
        let response = await fetch(this.userInfoURL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        let data = await response.json();
        let profile = {
            provider: "microsoft",
            displayName: data.name,
            id: data.sub,
            name: {
                familyName: data.family_name,
                givenName: data.given_name,
            },
            emails: [{ value: data.email }],
            _json: data,
        };
        return profile;
    }
}
exports.MicrosoftStrategy = MicrosoftStrategy;
