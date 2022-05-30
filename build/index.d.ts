import { StrategyVerifyCallback } from "remix-auth";
import { OAuth2Profile, OAuth2Strategy, OAuth2StrategyVerifyParams } from "remix-auth-oauth2";
export interface MicrosoftStrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string;
    tenant?: string;
    prompt?: string;
    baseURL?: string;
    userFlowID?: string;
    responseType?: string;
}
export interface MicrosoftProfile extends OAuth2Profile {
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    emails: [{
        value: string;
    }];
    _json: {
        sub: string;
        name: string;
        family_name: string;
        given_name: string;
        email: string;
    };
}
export interface MicrosoftExtraParams extends Record<string, string | number> {
    expires_in: 3599;
    token_type: "Bearer";
    scope: string;
    id_token: string;
}
export declare class MicrosoftStrategy<User> extends OAuth2Strategy<User, MicrosoftProfile, MicrosoftExtraParams> {
    name: string;
    private scope;
    private prompt;
    private responseType;
    private userFlowID;
    private userInfoURL;
    constructor({ clientID, clientSecret, callbackURL, scope, prompt, tenant, baseURL, responseType, userFlowID, }: MicrosoftStrategyOptions, verify: StrategyVerifyCallback<User, OAuth2StrategyVerifyParams<MicrosoftProfile, MicrosoftExtraParams>>);
    protected authorizationParams(): URLSearchParams;
    protected userProfile(accessToken: string): Promise<MicrosoftProfile>;
}
