const express = require('express');
const bodyParser = require('body-parser')
const uuidv4 = require('uuidv4').v4;
const OAuth2Server = require('@node-oauth/oauth2-server');
const model = require('./model.js');
const session = require('express-session')

const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

const port = 3000;

const oauth = new OAuth2Server({
  model: model
});


const oauthOptions = {
  requireClientAuthentication: {
    authorization_code: false,
    refresh_token: false,
  },
};

// Authorize a token request.
app.all('/oauth/authorize', async (req, res) => {
  try {
    const request = new Request(req);
    const response = new Response(res);
    const code = await oauth.authorize(request, response, {
      authenticateHandler: {
        handle: () => {
          // Return your user object for the user logged in.
          return req.session.user;
        },
      },
    });
    res.locals.oauth = { code: code };
    return res.json({ code: code.authorizationCode, state: req.query.state || req.query.state });

    /* 
      Or if you'd like to redirect to the client's redirect URI after authorization:

      const url = new URL(req.query.redirect_uri);
      url.searchParams.set('code', code.authorizationCode);
      url.searchParams.set('state', req.query.state || req.query.state);
      res.redirect(url.toString());
    */
  } catch (error) {
    res.status(401).json({ error: error.name, error_description: error.message });
  }
});

// Retrieves a new token for an authorized token request.
app.all('/oauth/token', async (req, res) => {
  try {
    const request = new Request(req);
    const response = new Response(res);
    const token = await oauth.token(request, response, oauthOptions);
    const tokenResponse = {
      access_token: token.accessToken,
      token_type: 'Bearer',
      expires_in: 3600, // Or whatever value you configured for access tokens in the init stage.
      refresh_token: token.refreshToken,
    };
    res.json(tokenResponse);
  } catch (error) {
    res.status(401).json({ error: error.name, error_description: error.message });
  }
});

const authenticate = async (req, res, next) => {
  try {
    const request = new Request(req);
    const response = new Response(res);
    const token = await oauth.authenticate(request, response);
    res.locals.oauth = { token: token };
    next();
  } catch (error) {
    next(error);
  }
};

app.get('/secure-area', authenticate, (req, res) => {
  /* 
    Now you have access to all the details about the token and user in `res.locals.oauth` set 
    by the previous middleware. 
  */
  res.json({ message: 'Hello World!' });
});

app.post('/login', (req, res) => {
  const user = model.config.users.find(
    (user) => user.username === req.body.username && user.password === req.body.password
  );
  if (user) {
    req.session.user = user;
    res.json({ message: 'Login Success' });
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
});

app.listen(port, () => {
  console.log('oauth server listening on port ' + port)
});