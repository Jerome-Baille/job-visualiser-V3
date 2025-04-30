const authBaseURL = 'https://auth.jerome-baille.fr';
const apiBaseURL = 'https://test.jerome-baille.fr/api';

export const environment = {
    production: true,
    authBaseURL: authBaseURL,
    apiBaseURL: apiBaseURL,
    userURL: `${apiBaseURL}/user`,
    authURL: `${authBaseURL}/auth`,
    authFrontURL: authBaseURL,
    jobURL: `${apiBaseURL}/job`,
    exportURL: `${apiBaseURL}/export`,
    taskURL: `${apiBaseURL}/task`,
    cookieURL: `${apiBaseURL}/cookie`
};