require('dotenv').config({ path: 'config/.env' });
const path = require('path');

module.exports = {
    src: [
        './src/test/testcafe/',
        './src/types/'
    ],
    nativeAutomation: false,
    //only chromium-based browsers (full CDP) are supported in native mode.  Firefox is not.
    //Snap installed firefox must be told to use it's default user profile.
    //Snap installed firefox doesn't work with VsCode TestCafe Test Runner to allow in editor debugging :(
    //Using Launch Config https://testcafe.io/documentation/402800/recipes/debugging/visual-studio-code
    browsers: ['firefox:/snap/firefox/current/usr/lib/firefox/firefox:headless'],
        //['path:/snap/firefox/current/usr/lib/firefox/firefox'],
        //['path:/usr/bin/brave-browser-stable'],
        //['firefox:userProfile'],
    //use localhost if TestCafe should target the server instead of the mock.
    //The mock will need removed from the test files.
    //Or have a separate full stack/acceptance test file and set the baseUrl in code.
    baseUrl: path.join(__dirname, '/dist/Client/'),//'https://localhost:25025',
    //large test timeouts for debugging in browser
    testExecutionTimeout: 600000,
    runExecutionTimeout: 600000,
    compilerOptions: {
        typescript: {
            //specifying options here instead of config file as need to set "sourceMap": false,
            //as tsconfig.json "sourceMap": true conflicts with the "inlineSourceMap": true set by TestCafe.
            //Could perhaps specify config + only "inlineSourceMap": false, but inlinesourcemap may be more useful?
            options: {
                "jsx": "react",
                "esModuleInterop": true,
                "strict": true,
                "strictNullChecks": false,
                "noImplicitAny": true,
                "removeComments": true,
                "preserveConstEnums": true,
                "sourceMap": false,
                "skipLibCheck": true,
                "forceConsistentCasingInFileNames": true
            }
        }
    },
    userVariables: {
        mysqlConfig: {
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            user: process.env.MYSQL_TEST_USER,
            password: process.env.MYSQL_TEST_PASSWORD,
            schema: process.env.MYSQL_SCHEMA
        },
        apiHost: 'https://' + process.env.API_HOSTNAME + ':' + process.env.API_PORT + '/'
    }
}