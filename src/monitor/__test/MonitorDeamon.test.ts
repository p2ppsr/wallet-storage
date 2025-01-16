import * as dotenv from 'dotenv'
import { MonitorDaemon } from '../MonitorDaemon'
dotenv.config()

const cloudMySQLConnection = process.env.TEST_CLOUD_MYSQL_CONNECTION || '{}'

describe('MonitorDaemon tests', () => {
    jest.setTimeout(99999999)

    test.skip('0', async () => {
        
        const d = new MonitorDaemon({ chain: 'test', mySQLConnection: cloudMySQLConnection })
        await d.runDaemon()
    })
})