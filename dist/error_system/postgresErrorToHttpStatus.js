"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresErrorToHttpStatus = {
    '08*': 503,
    '09*': 500,
    '0L*': 403,
    '0P*': 403,
    '23503': 409,
    '23505': 409,
    '25006': 405,
    '25*': 500,
    '28*': 403,
    '2D*': 500,
    '38*': 500,
    '39*': 500,
    '3B*': 500,
    '40*': 500,
    '53*': 503,
    '54*': 413,
    '55*': 500,
    '57*': 500,
    '58*': 500,
    'F0*': 500,
    'HV*': 500,
    'P0001': 400,
    'P0*': 500,
    'XX*': 500,
    '42883': 404,
    '42P01': 404,
    '42703': 404,
    '428C9': 404 // cannot insert a non-DEFAULT value into column 
};
exports.default = postgresErrorToHttpStatus;
//# sourceMappingURL=postgresErrorToHttpStatus.js.map