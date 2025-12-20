import { NextRequest, NextResponse } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";
import { IMessage } from "@/app/utils/chatUtils";

// Create conversation
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const { userId } = await request.json();
  console.log('userId : ' + request.json())

  const pool = getPool()

  // call to AI to make summary (title) of conversation
  // const title = 'summary AI'

  pool.query("INSERT INTO conversations (title, userid) values ($1, $2)",
    ['titre test', userId],
    (err, res) => {
    console.log('callback query finished' + err, res)
  })

  return new NextResponse(userId, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

//  POST /api/db-query 200 in 323ms
// callback query finishedundefined Result {
//   command: 'SELECT',
//   rowCount: 1,
//   oid: null,
//   rows: [ { now: 2025-12-18T14:56:35.559Z } ],
//   fields: [
//     Field {
//       name: 'now',
//       tableID: 0,
//       columnID: 0,
//       dataTypeID: 1184,
//       dataTypeSize: 8,
//       dataTypeModifier: -1,
//       format: 'text'
//     }
//   ],
//   _parsers: [ [Function: parseDate] ],
//   _types: TypeOverrides {
//     _types: {
//       getTypeParser: [Function: getTypeParser],
//       setTypeParser: [Function: setTypeParser],
//       arrayParser: [Object],
//       builtins: [Object]
//     },
//     text: {},
//     binary: {}
//   },
//   RowCtor: null,
//   rowAsArray: false,
//   _prebuiltEmptyResultObject: { now: null }
// }
//  POST /api/db-query 200 in 756ms
// callback query finishederror: permission denied for sequence conversations_convid_seq undefined
//  POST /api/db-query 200 in 380ms
// callback query finishedundefined Result {
//   command: 'INSERT',
//   rowCount: 1,
//   oid: 0,
//   rows: [],
//   fields: [],
//   _parsers: undefined,
//   _types: TypeOverrides {
//     _types: {
//       getTypeParser: [Function: getTypeParser],
//       setTypeParser: [Function: setTypeParser],
//       arrayParser: [Object],
//       builtins: [Object]
//     },
//     text: {},
//     binary: {}
//   },
//   RowCtor: null,
//   rowAsArray: false,
//   _prebuiltEmptyResultObject: null
// }


// Transaction example : 
// const client = await pool.connect()
// const res = await client.query('SELECT * FROM users WHERE id = $1', [1])
// client.release()

// Run a single query at the time :
// const res = await pool.query('SELECT * FROM users WHERE id = $1', [1])
// or
//pool.query('SELECT NOW()', (err, res) => {
//   console.log('callback query finished')
// })