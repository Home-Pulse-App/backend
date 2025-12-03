import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let bucket: GridFSBucket;

export const initGridFS = () => {
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection not established');
    }
    bucket = new GridFSBucket(db, {
        bucketName: 'splatFiles',
    });
    return bucket;
};

export const getGridFSBucket = (): GridFSBucket => {
    if (!bucket) {
        bucket = initGridFS();
    }
    return bucket;
};

export default { initGridFS, getGridFSBucket };
