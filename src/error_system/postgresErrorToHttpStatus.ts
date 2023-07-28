interface ErrorCodeToStatusMap {
  [key: string]: number;
}

const postgresErrorToHttpStatus: ErrorCodeToStatusMap = {
    '08*': 503, // pg connection err
    '09*': 500, // triggered action exception
    '0L*': 403, // invalid grantor
    '0P*': 403, // invalid role specification
    '23503': 409, // foreign key violation
    '23505': 409, // uniqueness violation
    '25006': 405, // read only sql transaction
    '25*': 500, // invalid transaction state
    '28*': 403, // invalid auth specification
    '2D*': 500, // invalid transaction termination
    '38*': 500, // external routine exception
    '39*': 500, // external routine invocation
    '3B*': 500, // savepoint exception
    '40*': 500, // transaction rollback
    '53*': 503, // insufficient resources
    '54*': 413, // too complex
    '55*': 500, // obj not in prerequisite state
    '57*': 500, // operator intervention
    '58*': 500, // system error
    'F0*': 500, // config file error
    'HV*': 500, // foreign data wrapper error
    'P0001': 400, // default code for “raise”
    'P0*': 500, // PL/pgSQL error
    'XX*': 500, // internal error
    '42883': 404, // undefined function
    '42P01': 404, // undefined table
    '42703' : 404, // undefined column
    '428C9': 404 // cannot insert a non-DEFAULT value into column 
  };
  export default postgresErrorToHttpStatus;