const host = 'https://api-eu.libreview.io/llu';
export const getGraphRoute = (patientId: string) => `${host}/connections/${patientId}/graph`;
export const getTokenRoute = `${host}/llu/auth/login`;