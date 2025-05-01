import { handlersGeneral } from './handlersGeneral';
import { handlersUser } from './handlersUser';
import { handlersMaterial } from './handlersMaterial';
import { handlersClient } from './handlersClient';
import { handlersSale } from './handlersSale';
import { handlersTicket } from './handlersTicket';
import { handlersService } from './handlersService';

const allHandlers = [
    ...handlersGeneral,
    ...handlersUser,
    ...handlersMaterial,
    ...handlersClient,
    ...handlersSale,
    ...handlersTicket,
    ...handlersService,
];

export const handlers = allHandlers;