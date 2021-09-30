<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->

1. http://localhost:8888/auth/
1. Create new realm "projektwahl"
1. Clients -> Create
   1. Client ID: projektwahl
   1. Root URL: http://localhost:3000/
      https://connect2id.com/learn/openid-connect
      Authorisation code flow
      "Stateless sessions -- Put into a browser cookie the ID token can implement a lightweight stateless session. This does away with the need to store sessions on the server side (in memory or on disk), which can be a burden to manage and scale. The session is checked by validating the ID token. When the token reaches some predefined age past its issue timestamp (iat) the application can simply ask the OP for a new one via a silent prompt=none request."
      https://openid.net/specs/openid-connect-session-1_0.html
      https://oauth.net/code/nodejs/
      https://openid.net/certification/#RPs
      https://www.npmjs.com/package/openid-client
      https://openid.net/specs/openid-connect-core-1_0.html#IDToken
   1. Access Type: Confidential
   1. Credentials
   1. OpenID Connect Compatibility Modes -> Use Refresh Tokens -> Off (Important!!!)
   1. Consent Required
   1. Realm Settings -> Tokens -> Revoke Refresh Tokens = True
   1. Realm Settings -> Security Defenses -> Brute Force Detection -> Enabled
   1. Realm Settings -> Tokens -> Access Token Lifespan -> Set appropiately (e.g. 5min) - also is for ID token
   1. Clients -> projektwahl -> Mappers -> Add Builtin -> Realm roles
      1. Add to ID token -> True
1. Roles -> Add voter, helper, admin
   // 3. Groups -> Add group voter, helper, admin
1. Users -> Add user
   1. Role Mappings -> Add appropiate role
      //1. Groups -> Join a group
   1. Credentials -> Reset Password
   1. http://localhost:8888/auth/realms/projektwahl/account
1. You can test what you get at Clients -> Client Scopes -> Evaluate

https://datatracker.ietf.org/doc/html/rfc6819#section-4.1.3

// store id token in a httponly cookie, use silent flow for refresh?

5. Identity Providers
   1. Add some useful services (Github, Google, ...) BUT ENSURE that direct login is not enabled (only linking accounts) - actually don't because then you can't login with that account
      but we probably need to check that somebody didn't login with such account
   2. Try out "Trust Email"
   3. Maybe we need a "Mapper"
   # https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/identity-broker/first-login-flow.adoc
   4. https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/identity-broker/first-login-flow.adoc#detect-existing-user-first-login-flow
      1. Authentication -> Flows -> Create new flow "AutoLink"
      2. Add execution -> Detect Existing Broker User -> Required
      3. Add execution -> Automatically Set Existing User -> Required
      4. Set "First Login Flow" of the Identity Provider to "AutoLink"

This probably means we always create users locally in this keycloak instance but optionally link accounts
