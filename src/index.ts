import { StrategyVerifyCallback, AuthorizationError } from "remix-auth";

import {
  OAuth2Profile,
  OAuth2Strategy,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";

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
  emails: [{ value: string }];
  id_token: string,
  _json: any
  /*_json: {
    objectId: string;
    displayName: string;
    surname: string;
    givenName: string;
    'signInNames.emailAddress': string;
  };*/
}

export interface MicrosoftExtraParams extends Record<string, string | number> {
  expires_in: 3599;
  token_type: string;
  scope: string;
  id_token: string;
}

export class MicrosoftStrategy<User> extends OAuth2Strategy<
  User,
  MicrosoftProfile,
  MicrosoftExtraParams
> {
  name = "microsoft";

  private scope: string;
  private prompt: string;
  private userFlowID: string;
  private userInfoURL: string;

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope,
      prompt,
      tenant = "common",
      baseURL = "login.microsoftonline.com",
      userFlowID,
    }: MicrosoftStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<MicrosoftProfile, MicrosoftExtraParams>
    >
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        authorizationURL: `https://${baseURL}/${tenant}/oauth2/v2.0/authorize`,
        tokenURL: `https://${baseURL}/${tenant}/oauth2/v2.0/token?p=${userFlowID}&client_secret=${clientSecret}`,
      },
      verify
    );
    this.scope = scope ?? "openid profile email";
    this.prompt = prompt ?? "none";
    this.userFlowID = userFlowID ?? "";
    this.userInfoURL = `https://${baseURL}/${tenant}/${userFlowID}/openid/v2.0/userinfo`;
  }

  protected authorizationParams() {
    return new URLSearchParams({
      scope: this.scope,
      prompt: this.prompt,
      p: this.userFlowID
    });
  }

  protected async getAccessToken(response: Response): Promise<{
		accessToken: string;
		refreshToken: string;
		extraParams: MicrosoftExtraParams;
	}> {
		
    const { access_token, id_token, token_type, scope, expires_in } =
			await response.json();

		return {
			accessToken: access_token,
			refreshToken: '',
			extraParams: { token_type, id_token, scope, expires_in },
		} as const;
	}

  protected async userProfile(accessToken: string, extraParams: MicrosoftExtraParams): Promise<MicrosoftProfile> {
    /*let response = await fetch(this.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let data: MicrosoftProfile["_json"] = await response.json();*/

    let data: any = parseJwt(extraParams.id_token);

    let profile: MicrosoftProfile = {
      provider: "microsoft",
      displayName: data.name,
      id: data.oid,
      name: {
        familyName: data.surname,
        givenName: data.givenName,
      },
      emails: data.emails,
      id_token: extraParams.id_token,
      _json: data,
    };

    return profile;

  }
}

function parseJwt (token:string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};