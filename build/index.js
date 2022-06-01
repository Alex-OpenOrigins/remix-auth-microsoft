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
            tokenURL: `https://${baseURL}/${tenant}/oauth2/v2.0/token?p=${userFlowID}&client_secret=${clientSecret}`,
        }, verify);
        this.name = "microsoft";
        this.scope = scope !== null && scope !== void 0 ? scope : "openid profile email";
        this.prompt = prompt !== null && prompt !== void 0 ? prompt : "none";
        this.userFlowID = userFlowID !== null && userFlowID !== void 0 ? userFlowID : "";
        this.userInfoURL = `https://${baseURL}/${tenant}/${userFlowID}/openid/v2.0/userinfo`;
    }
    authorizationParams() {
        return new URLSearchParams({
            scope: this.scope,
            prompt: this.prompt,
            p: this.userFlowID
        });
    }
    async getAccessToken(response) {
        const { access_token, id_token, token_type } = await response.json();
        return {
            accessToken: access_token,
            refreshToken: '',
            extraParams: { token_type },
        };
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
            displayName: data.displayName,
            id: data.objectId,
            name: {
                familyName: data.surname,
                givenName: data.givenName,
            },
            emails: [{ value: data["signInNames.emailAddress"] }],
            _json: data,
        };
        return profile;
    }
}
exports.MicrosoftStrategy = MicrosoftStrategy;
