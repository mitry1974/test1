import Express from 'express';
import init from './app';

const start = async () => {
    const app = new Express();
    await init(app);
    app.listen(3000);
    console.log('Running on http://localhost:3000');    
}

start();
