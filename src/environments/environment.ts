const authBaseURL = 'https://auth.jerome-baille.fr';
const apiBaseURL = 'https://auth.jerome-baille.fr';

export const environment = {
    production: false,
    authBaseURL: authBaseURL,
    apiBaseURL: apiBaseURL,
    authURL: `${authBaseURL}/auth`,
    authFrontURL: authBaseURL,
    jobURL: `${apiBaseURL}/job`,
    exportURL: `${apiBaseURL}/export`,
    taskURL: `${apiBaseURL}/task`,
    cookieURL: `${apiBaseURL}/cookie`
};