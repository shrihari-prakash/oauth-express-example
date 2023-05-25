## @node-oauth/node-oauth2-server Express Implementation

Example express implementation for [@node-oauth/node-oauth2-server](https://github.com/node-oauth/node-oauth2-server)

### Running the project
Run command `node server.js`

### Testing client credentials grant
Send a post request to /oauth/token with the following body as form encoded body:

```
{
    "grant_type": "client_credentials",
    "client_id": "confidentialApplication",
    "client_secret": "topSecret"
}
```

This should yield you an access token which you can use to access the route `/secure-area`.

### Testing authorization code
The sample code contains a `/login` route to add the user into session after which the session can be used to securely get an authorization code.

* Send a post request to `/login` with the following body:
```
{
    "username": "john_doe",
    "password": "password"
}
```
* Once succeeded, request an authorization code by sending a post request to `/oauth/authorize` with the following body:
```
{
    "response_type": "code",
    "client_id": "application",
    "state": "some-random-string",
}
```
You should get the authorization code as response.
* Now you can exchange this code to an access token by sending a post request to `/oauth/token` with the following body:
```
{
    "grant_type": "authorization_code",
    "client_id": "application",
    "code": "code_from_previous_step",
    "redirect_uri": "http://localhost:3000"
}
```