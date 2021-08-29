<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->

1. Create new realm
2. Users -> Add user
   1. Credentials -> Reset Password
   2. http://localhost:8888/auth/realms/projektwahl/account
3. Clients -> Create 1. Root URL: http://localhost:3000/ 2. Redirect URI: http://localhost:3000/redirect
   https://connect2id.com/learn/openid-connect
   Authorisation code flow
   "Stateless sessions -- Put into a browser cookie the ID token can implement a lightweight stateless session. This does away with the need to store sessions on the server side (in memory or on disk), which can be a burden to manage and scale. The session is checked by validating the ID token. When the token reaches some predefined age past its issue timestamp (iat) the application can simply ask the OP for a new one via a silent prompt=none request."
   https://openid.net/specs/openid-connect-session-1_0.html
   https://oauth.net/code/nodejs/
   https://openid.net/certification/#RPs
   https://www.npmjs.com/package/openid-client
4. http://localhost:8888/auth/realms/projektwahl/protocol/openid-connect/auth?client_id=projektwahl&redirect_uri=http://localhost:3000/redirect&state=b5696824-434d-4b39-981b-086bb3453071&response_type=code&scope=openid&nonce=a5af838d-0576-4849-918d-27231c4d04f3
