import {Sale} from "../../sales/types/sale.types.ts";

export interface Ticket {
    id: number;
    titre: string;
    description: string;
    idSale: number;
    sales: Sale[];
    sale_id: number;
}
