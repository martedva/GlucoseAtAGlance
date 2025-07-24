import AuthTicket from "./authTicket";
import User from "./user";

interface LoginResponse {
    status: number;
    data: {
        user: User;
        messages: {
            unread: number;
        };
        notifications: {
            unresolved: number;
        };
        authTicket: AuthTicket;
        invitations: unknown;
        trustedDeviceToken: string;
    };
};

export default LoginResponse;
