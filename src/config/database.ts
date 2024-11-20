import { DataSourceOptions } from 'typeorm';
import { User } from '../models/User';
import { State } from '../models/State';
import dotenv from 'dotenv';
import { Referral } from '../models/Referral';
import { Item } from '../models/Item';
import { UserItem } from '../models/UserItem';
import { ConfigRow } from '../models/ConfigRow';

// Load environment variables from .env file
dotenv.config();

const dbConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, State, Referral, Item, UserItem, ConfigRow],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development'
};

export default dbConfig;