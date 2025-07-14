interface AuthTicket {
    token: string;
    expires: number;
    duration: number;
};

export default AuthTicket;