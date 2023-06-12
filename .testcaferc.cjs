module.exports = {
    src: './test/testcafe/',
    nativeAutomation: false,
    //only chromium-based browsers (full CDP) are supported in native mode.  Firefox is not.
    //Snap installed firefox must be told to use it's default user profile.
    //Snap installed firefox doesn't work with VsCode TestCafe Test Runner to allow in editor debugging :(
    //Using Launch Config https://testcafe.io/documentation/402800/recipes/debugging/visual-studio-code
    browsers: ['path:/usr/bin/brave-browser-stable'], //['path:/snap/firefox/current/usr/lib/firefox/firefox'], //['firefox:userProfile'],
    baseUrl: 'https://localhost:1234',
    //large test timeouts for debugging in browser
    testExecutionTimeout: 600000,
    runExecutionTimeout: 600000,
    compilerOptions: {
        typescript: {
            "target": "es2020",
            "module": "es2020",
            "moduleResolution": "node",
            "esModuleInterop": true,
            "strict": true,
            "strictNullChecks": false,
            "noImplicitAny": true,
            "removeComments": true,
            "preserveConstEnums": true
        }
    }
}