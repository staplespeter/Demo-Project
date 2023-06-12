module.exports = {
    src: './test/testcafe/',
    nativeAutomation: false,
    //only chromium-based browsers (full CDP) are supported in native mode.  Firefox is not.
    //Snap installed firefox must be told to use it's default user profile. 
    browsers: ['firefox:userProfile'],  //, 'path:/usr/bin/brave-browser-stable'],
    baseUrl: 'https://localhost:1234'
}