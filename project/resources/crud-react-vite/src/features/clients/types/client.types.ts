import {User} from "../../users/types/user.types.ts";

export interface Client {
    id: number;
    surnom: string;
    idUser: number;
    user_id: number;
    userName: string;
    user: User;
}
