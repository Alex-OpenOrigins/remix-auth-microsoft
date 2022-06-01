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
    }
    authorizationParams() {
        return new URLSearchParams({
            scope: this.scope,
            prompt: this.prompt,
            p: this.userFlowID
        });
    }
    async getAccessToken(response) {
        const { access_token, id_token, token_type, scope, expires_in } = await response.json();
        return {
            accessToken: access_token,
            refreshToken: '',
            extraParams: { token_type, id_token, scope, expires_in },
        };
    }
    async userProfile(accessToken, extraParams) {
        let data = parseJwt(extraParams.id_token);
        let profile = {
            provider: "microsoft",
            displayName: data.username || data.name,
            username: data.username,
            id: data.oid,
            emails: data.emails,
            _json: data,
        };
        return profile;
    }
}
exports.MicrosoftStrategy = MicrosoftStrategy;
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
;
