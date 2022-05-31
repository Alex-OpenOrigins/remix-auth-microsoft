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
  _json: {
    sub: string;
    name: string;
    family_name: string;
    given_name: string;
    email: string;
  };
}

export interface MicrosoftExtraParams extends Record<string, string | number> {
  //expires_in: 3599;
  token_type: string;
  //scope: string;
  //id_token: string;
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
  private userInfoURL = "https://graph.microsoft.com/oidc/userinfo";

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
		const data = await response.text();

		const accessToken = new URLSearchParams(data).get('id_token');
		if (!accessToken) throw new AuthorizationError('Missing access token.');

		const token_type = new URLSearchParams(data).get('token_type');
		if (!token_type) throw new AuthorizationError('Missing token type.');

		return {
			accessToken,
			refreshToken: '',
			extraParams: { token_type },
		} as const;
	}

  protected async userProfile(accessToken: string): Promise<MicrosoftProfile> {
    let response = await fetch(this.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let data: MicrosoftProfile["_json"] = await response.json();

    let profile: MicrosoftProfile = {
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
