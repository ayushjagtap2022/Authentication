import express from 'express';
import morgan from 'morgan';
import createError from 'http-errors';
import { config } from 'dotenv';
import AuthRoute from './routes/Auth.route.js';
import compression from 'compression';
import cluster from 'cluster';
import os from 'os';
import {MongoConnection} from './db/init_mongodb.js'
config();
cluster.schedulingPolicy = cluster.SCHED_RR;
const numCPUs = os.cpus().length;
if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
     MongoConnection()
    app.use(compression());
    app.use(morgan((tokens, req, res) => {
        return [
            `[Worker ${process.pid}]`,
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms'
        ].join(' ');
    }));
    app.use('/api', AuthRoute);
    app.use((req, res, next) => {
        next(createError.NotFound('The given URL does not match any Routes'));
    });
    app.use((err, req, res, next) => {
        const statusCode = err.status || 500;
        res.status(statusCode).send({
            error: {
                status: err.status,
                message: err.message,
            },
        });
    });

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Worker ${process.pid} started. Listening on port ${port}`);
    });
}

