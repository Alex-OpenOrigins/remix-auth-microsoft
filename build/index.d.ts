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
    accessToken: string;
    displayName: string;
    username: string;
    emails: [{
        value: string;
    }];
    _json: any;
}
export interface MicrosoftExtraParams extends Record<string, string | number> {
    expires_in: 3599;
    token_type: string;
    scope: string;
    id_token: string;
}
export declare class MicrosoftStrategy<User> extends OAuth2Strategy<User, MicrosoftProfile, MicrosoftExtraParams> {
    name: string;
    private scope;
    private prompt;
    private userFlowID;
    constructor({ clientID, clientSecret, callbackURL, scope, prompt, tenant, baseURL, userFlowID, }: MicrosoftStrategyOptions, verify: StrategyVerifyCallback<User, OAuth2StrategyVerifyParams<MicrosoftProfile, MicrosoftExtraParams>>);
    protected authorizationParams(): URLSearchParams;
    protected getAccessToken(response: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        extraParams: MicrosoftExtraParams;
    }>;
    protected userProfile(accessToken: string, extraParams: MicrosoftExtraParams): Promise<MicrosoftProfile>;
}
