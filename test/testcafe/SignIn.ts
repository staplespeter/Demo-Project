//As a User
//I can sign up and sign in
//So I can administer my account

import page from './pagemodels/SignIn';
import { getFromLocalStorage, clearLocalStorage } from './helpers/ClientFunctions';
import ClientAuthentication from '../../src/Client/Model/ClientAuthentication';
import * as mysqlx from '@mysql/xdevapi';
import { userVariables } from 'testcafe';


let session: any = null;
let userTable: any = null;

fixture('', ).page('./signIn.html')
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
        await clearLocalStorage();

        await t.expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.exists).notOk()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('')
        .expect(page.password1.value).eql('');
    });

test('User can sign up', async (t) => {
    await t.click(page.signUp)
        .expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.visible).ok()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('')
        .expect(page.password1.value).eql('')
        .expect(page.password2.value).eql('');

    await t.typeText(page.username, 'testUser1')
        .typeText(page.password1, 'testPassword1')
        .typeText(page.password2, 'testPassword1')
        .click(page.signUp);

    const token = await getFromLocalStorage(ClientAuthentication.TOKEN_STORAGE_KEY) ?? null;
    await t.expect(token).notEql(null);
});

test('User can sign in', async (t) => {
    await t.typeText(page.username, 'testUser1')
        .typeText(page.password1, 'testPassword1')
        .click(page.signIn);
    
    const token = await getFromLocalStorage(ClientAuthentication.TOKEN_STORAGE_KEY) ?? null;
    await t.expect(token).notEql(null);
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
        .expect(page.password2.value).eql('');

    await t.click(page.signIn)
        .expect(page.username.visible).ok()
        .expect(page.password1.visible).ok()
        .expect(page.password2.exists).notOk()
        .expect(page.signIn.visible).ok()
        .expect(page.signUp.visible).ok()
        .expect(page.username.value).eql('testUser1')
        .expect(page.password1.value).eql('testPassword1');
});