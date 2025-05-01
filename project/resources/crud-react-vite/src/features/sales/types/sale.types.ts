import {Material} from "../../materials/types/material.types.ts";
import {Client} from "../../clients/types/client.types.ts";

export interface Sale {
    id: number;
    titre: string;
    description: string;
    idClient: number;
    materials: Material[];
    customer: Client;
    customer_id: number;

}
