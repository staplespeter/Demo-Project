//As a User
//I can sign up and sign in
//So I can administer my account

import page from './pagemodels/SignIn'


fixture('', ).page('./signIn.htm')
    .beforeEach(async (t) => {
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
        //.expect(?)
});

test('User can sign in', async (t) => {
    await t.typeText(page.username, 'testUser1')
        .typeText(page.password1, 'testPassword1')
        .click(page.signIn);
        //.expect(?)
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