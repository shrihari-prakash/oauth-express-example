// Most part of this model sample comes from https://github.com/pedroetb/node-oauth2-server-example/blob/master/model.js.
// However, the model fixes a lot of stuff in authorization code.

const config = {
    clients: [{
        id: 'application',	// TODO: Needed by refresh_token grant, because there is a bug at line 103 in https://github.com/oauthjs/node-oauth2-server/blob/v3.0.1/lib/grant-types/refresh-token-grant-type.js (used client.id instead of client.clientId)
        clientId: 'application',
        clientSecret: 'secret',
        grants: [
            'password',
            'refresh_token',
            'authorization_code'
        ],
        redirectUris: ['http://localhost:3000']
    }],
    confidentialClients: [{
        clientId: 'confidentialApplication',
        clientSecret: 'topSecret',
        grants: [
            'password',
            'client_credentials'
        ],
        redirectUris: []
    }],
    tokens: [],
    code: [],
    users: [{
        username: 'john_doe',
        password: 'password'
    }]
};

// Methods used by all grant types.
const getAccessToken = function (token) {
    const tokens = config.tokens.filter(function (savedToken) {
        return savedToken.accessToken === token;
    });
    return tokens[0];
};

const getClient = function (clientId, clientSecret) {
    const clients = config.clients.filter(function (client) {
        if (clientSecret) {
            return client.clientId === clientId && client.clientSecret === clientSecret;
        } else {
            return client.clientId === clientId;
        }
    });
    const confidentialClients = config.confidentialClients.filter(function (client) {
        if (clientSecret) {
            return client.clientId === clientId && client.clientSecret === clientSecret;
        } else {
            return client.clientId === clientId;
        }
    });
    return clients[0] || confidentialClients[0];
};

const saveToken = function (token, client, user) {
    token.client = {
        id: client.clientId
    };
    token.user = {
        username: user.username
    };
    config.tokens.push(token);
    return token;
};

// Method used only by password grant type.
const getUser = function (username, password) {
    const users = config.users.filter(function (user) {
        return user.username === username && user.password === password;
    });
    return users[0];
};

// Method used only by client_credentials grant type.
const getUserFromClient = function (client) {
    console.log('getUser', client);
    const clients = config.confidentialClients.filter(function (savedClient) {
        console.log(client, savedClient);
        return savedClient.clientId === client.clientId && savedClient.clientSecret === client.clientSecret;
    });
    return clients.length;
};

// Methods used only by refresh_token grant type.
const getRefreshToken = function (refreshToken) {
    const tokens = config.tokens.filter(function (savedToken) {
        return savedToken.refreshToken === refreshToken;
    });
    if (!tokens.length) {
        return;
    }
    return tokens[0];
};

const revokeToken = function (token) {
    config.tokens = config.tokens.filter(function (savedToken) {
        return savedToken.refreshToken !== token.refreshToken;
    });
    const revokedTokensFound = config.tokens.filter(function (savedToken) {
        return savedToken.refreshToken === token.refreshToken;
    });
    return !revokedTokensFound.length;
};

const saveAuthorizationCode = function (code, client, user) {
    code.client = {
        id: client.clientId
    };
    code.user = {
        username: user.username
    };
    config.code.push(code);
    return code;
}

const getAuthorizationCode = (authCode) => {
    const code = config.code.find(function (c) {
        return c.authorizationCode === authCode;
    });
    return code;
}

const revokeAuthorizationCode = (authCode) => {
    const code = config.code = config.code.filter(function (c) {
        return c.authorizationCode !== authCode;
    });
    return code;
}

// Export model definition object.
module.exports = {
    config: config,
    getAccessToken: getAccessToken,
    getClient: getClient,
    saveToken: saveToken,
    getUser: getUser,
    getUserFromClient: getUserFromClient,
    getRefreshToken: getRefreshToken,
    revokeToken: revokeToken,
    saveAuthorizationCode: saveAuthorizationCode,
    getAuthorizationCode: getAuthorizationCode,
    revokeAuthorizationCode: revokeAuthorizationCode
};