import DaoFactory from '../../Dao/DaoFactory';
import { mockMySqlDataSource } from '../../Dao/MySql/__mocks__/MockMySqlDatasourceUserSession';
import Recordset from '../../Dao/RecordSet';
import UserSession from '../UserSession';
jest.mock('../../Dao/DaoFactory');

describe('UserSession tests', () => {
    const MockDaoFactory = jest.mocked(DaoFactory);
    MockDaoFactory.getRecordSet.mockImplementation(async (sourceType, objectName) => {
        return new Recordset(mockMySqlDataSource);
    })

    it('can create a new session with a specified start date', async () => {
        const us = new UserSession(1);

    });

    it('can load an existing session', () => {

    });

    it('can end an existing session', () => {

    });
});