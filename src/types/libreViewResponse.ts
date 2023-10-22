import Data from "./data";
import Ticket from "./ticket";

interface LibreViewResponse {
    status: number;
    data: Data;
    ticket: Ticket;
}

export default LibreViewResponse;

