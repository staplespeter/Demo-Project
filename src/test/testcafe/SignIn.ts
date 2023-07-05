//As a User
//I can sign up and sign in
//So I can administer my account

import page from './pagemodels/SignIn';
import { getFromLocalStorage, clearLocalStorage } from './helpers/ClientFunctions';
import ClientAuthentication from '../../Client/Model/ClientAuthentication';
import * as mysqlx from '@mysql/xdevapi';
import { RequestMock, userVariables } from 'testcafe';


//TODO: Roll these into a mock class?
const mockRequest_Options = (req: RequestMockOptions) => {
    return req.url.startsWith('https://localhost:25025/auth/')
        && req.method.toUpperCase() === 'OPTIONS';
};
const mockResponse_Options = (req: RequestMockOptions, res: ResponseMock) => {
    res.statusCode = 200;
    res.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'origin,Content-Type,Accept,Cookie',
        'Access-Control-Allow-Methods': 'POST'
    };
};
const mockResponse_Success = (req: RequestMockOptions, res: ResponseMock) => {
    res.statusCode = 201;
    res.headers = {
        'Access-Control-Allow-Origin': '*',
    };
    res.setBody({ token: "Jwt_base64_string" });
};
const mockResponse_Failure = (req: RequestMockOptions, res: ResponseMock) => {
    res.statusCode = 500;
    res.headers = {
        'Access-Control-Allow-Origin': '*',
    };
    res.setBody({ error: "internal error" });
};

const mockRegisterSuccess = RequestMock()
    .onRequestTo(mockRequest_Options)
    .respond(mockResponse_Options)
    .onRequestTo((requestOptions) => {
        if (requestOptions. url === 'https://localhost:25025/auth/register'
            && requestOptions.method.toUpperCase() === 'POST')
        {
            const credentials: Api.UserCredentials = JSON.parse(requestOptions.body.toString());
            if (credentials.username === 'testUser1') {
                return true;
            }
        }
        return false;
    })
    .respond(mockResponse_Success);
const mockRegisterFailure = RequestMock()
    .onRequestTo(mockRequest_Options)
    .respond(mockResponse_Options)
    .onRequestTo((requestOptions) => {
        if (requestOptions. url === 'https://localhost:25025/auth/register'
            && requestOptions.method.toUpperCase() === 'POST')
        {
            const credentials: Api.UserCredentials = JSON.parse(requestOptions.body.toString());
            if (credentials.username === 'testUser2') {
                return true;
            }
        }
        return false;
    })
    .respond(mockResponse_Failure);
const mockLoginSuccess = RequestMock()
    .onRequestTo(mockRequest_Options)
    .respond(mockResponse_Options)
    .onRequestTo((requestOptions) => {
        if (requestOptions.url === 'https://localhost:25025/auth/login'
            && requestOptions.method.toUpperCase() === 'POST')
        {
            const credentials: Api.UserCredentials = JSON.parse(requestOptions.body.toString());
            if (credentials.username === 'testUser1') {
                return true;
            }
        }
        return false;
    })
    .respond(mockResponse_Success);
const mockLoginFailure = RequestMock()
    .onRequestTo(mockRequest_Options)
    .respond(mockResponse_Options)
    .onRequestTo((requestOptions) => {
        if (requestOptions.url === 'https://localhost:25025/auth/login'
            && requestOptions.method.toUpperCase() === 'POST')
        {
            const credentials: Api.UserCredentials = JSON.parse(requestOptions.body.toString());
            if (credentials.username === 'testUser2') {
                return true;
            }
        }
        return false;
    })
    .respond(mockResponse_Failure);
const mockCatchAllRequests = RequestMock()
    .onRequestTo(mockRequest_Options)
    .respond(mockResponse_Options)
    .onRequestTo((req: RequestMockOptions) => {
        requestCount++;
        return req.url.startsWith('https://localhost:25025/auth/')
            && req.method.toUpperCase() === 'POST'
    })
    .respond(mockResponse_Success);

let session: any = null;
let userTable: any = null;
let requestCount: number = 0;

fixture('Sign In page', ).page('./signIn.html')
    .before(async () => {
        session = await mysqlx.getSession(userVariables.mysqlConfig as mysqlx.ConnectionOptions);
        userTable = session.getDefaultSchema().getTable('User');      
    })
    .after(async () => {
        if (session) {
            await (async () => {
                if (userTable) {
                    await userTable.delete()
                        .where("Email LIKE '%test%'")
                        .execute();
                }
            })();
            await session.close();
        }
    })
    .beforeEach(async (t) => {
        requestCount = 0;
        await clearLocalStorage();

        await t.expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.exists).notOk()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('')
        .expect(page.password1.value).eql('')
        .expect(page.errorMessage.exists).notOk();
    });

test.requestHooks(mockRegisterSuccess)('User can sign up', async (t) => {
    await t.click(page.signUp)
        .expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.visible).ok()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('')
        .expect(page.password1.value).eql('')
        .expect(page.password2.value).eql('')
        .expect(page.errorMessage.exists).notOk();

    await t.typeText(page.username, 'testUser1')
        .typeText(page.password1, 'testPassword1')
        .typeText(page.password2, 'testPassword1')
        .click(page.signUp);

    const token = await getFromLocalStorage(ClientAuthentication.TOKEN_STORAGE_KEY) ?? null;
    await t.expect(token).eql('Jwt_base64_string')
        .expect(page.errorMessage.exists).notOk();
});

test.requestHooks(mockRegisterFailure)('User sign up error', async (t) => {
    await t.click(page.signUp)
        .typeText(page.username, 'testUser2')
        .typeText(page.password1, 'testPassword1')
        .typeText(page.password2, 'testPassword1')
        .click(page.signUp);

    const token = await getFromLocalStorage(ClientAuthentication.TOKEN_STORAGE_KEY) ?? null;
    await t.expect(token).eql(null)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Error signing up: internal error');
});

test.requestHooks(mockLoginSuccess)('User can sign in', async (t) => {
    await t.typeText(page.username, 'testUser1')
        .typeText(page.password1, 'testPassword1')
        .click(page.signIn);
    
    const token = await getFromLocalStorage(ClientAuthentication.TOKEN_STORAGE_KEY) ?? null;
    await t.expect(token).eql('Jwt_base64_string')
        .expect(page.errorMessage.exists).notOk();
});

test.requestHooks(mockLoginFailure)('User sign in error', async (t) => {
    await t.typeText(page.username, 'testUser2')
        .typeText(page.password1, 'testPassword1')
        .click(page.signIn);
    
    const token = await getFromLocalStorage(ClientAuthentication.TOKEN_STORAGE_KEY) ?? null;
    await t.expect(token).eql(null)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Error signing in: internal error');
});

test('User can toggle between sign up and sign in', async (t) => {
    await t.typeText(page.username, 'testUser1')
        .typeText(page.password1, 'testPassword1');

    await t.click(page.signUp)
        .expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.visible).ok()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('testUser1')
        .expect(page.password1.value).eql('testPassword1')
        .expect(page.password2.value).eql('')
        .expect(page.errorMessage.exists).notOk();

    await t.click(page.signIn)
        .expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.exists).notOk()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('testUser1')
        .expect(page.password1.value).eql('testPassword1')
        .expect(page.errorMessage.exists).notOk();
});

test.requestHooks(mockCatchAllRequests)('Empty Username detected on sign in', async (t) => {
    await t.typeText(page.password1, 'testPassword1');

    await t.click(page.signIn)
        .expect(requestCount).eql(0)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Username');
});

test.requestHooks(mockCatchAllRequests)('Empty Password detected on sign in', async (t) => {
    await t.typeText(page.username, 'testUser1');

    await t.click(page.signIn)
        .expect(requestCount).eql(0)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Password');
});

test.requestHooks(mockCatchAllRequests)('Empty Username detected on sign up', async (t) => {
    await t.click(page.signUp)
        .typeText(page.password1, 'testPassword1')
        .typeText(page.password2, 'testPassword1');

    await t.click(page.signUp)
        .expect(requestCount).eql(0)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Username');
});

test.requestHooks(mockCatchAllRequests)('Empty Password detected on sign up', async (t) => {
    await t.click(page.signUp)
        .typeText(page.username, 'testUser1');

    await t.click(page.signUp)
        .expect(requestCount).eql(0)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Password');
});

test.requestHooks(mockCatchAllRequests)('Mismatching Passwords detected on sign up', async (t) => {
    await t.click(page.signUp)
        .typeText(page.username, 'testUser1')
        .typeText(page.password1, 'testPassword1');

    await t.click(page.signUp)
        .expect(requestCount).eql(0)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Passwords do not match');
});

test.requestHooks(mockCatchAllRequests)('Error message remains after toggling between sign in and sign up', async (t) => {
    await t.typeText(page.username, 'testUser1');

    await t.click(page.signIn)
        .expect(requestCount).eql(0)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Password');

    await t.click(page.signUp)
        .expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.visible).ok()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('testUser1')
        .expect(page.password1.value).eql('')
        .expect(page.password2.value).eql('')
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Password');
    
    await t.click(page.signIn)
        .expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.exists).notOk()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('testUser1')
        .expect(page.password1.value).eql('')
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Password');
});

test.requestHooks(mockLoginSuccess)('Error message clears after successful sign in', async (t) => {
    await t.typeText(page.username, 'testUser1');

    await t.click(page.signIn)
        .expect(requestCount).eql(0)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Password');

    await t.typeText(page.password1, 'testPassword1');

    await t.click(page.signIn);
    
    const token = await getFromLocalStorage(ClientAuthentication.TOKEN_STORAGE_KEY) ?? null;
    await t.expect(token).eql('Jwt_base64_string')
        .expect(page.errorMessage.exists).notOk();
});

test.requestHooks(mockRegisterSuccess)('Error message clears after successful sign up', async (t) => {
    await t.typeText(page.username, 'testUser1');

    await t.click(page.signIn)
        .expect(requestCount).eql(0)
        .expect(page.errorMessage.visible).ok()
        .expect(page.errorMessage.innerText).eql('Missing Password');

    await t.click(page.signUp)
        .typeText(page.password1, 'testPassword1')
        .typeText(page.password2, 'testPassword1');

    await t.click(page.signUp);

    const token = await getFromLocalStorage(ClientAuthentication.TOKEN_STORAGE_KEY) ?? null;
    await t.expect(token).eql('Jwt_base64_string')
        .expect(page.errorMessage.exists).notOk();
});
