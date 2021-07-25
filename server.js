import 'dotenv/config.js';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/userModel.js'
import routes from './routes/routes.js';


const app = express();

const PORT = 3000 || process.env.PORT;

mongoose.connect('mongodb://admin:pass@localhost:27017', {
    useNewUrlParser: true, useUnifiedTopology: true, dbName: 'rbac'})

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

const db = mongoose.connection
db.on('error', error => console.log(error));
db.once('open', () => {
    console.log('connected to mongodb');
})

app.use(express.urlencoded({ extended: true }));


app.use(async (req, res, next) => {
    if (req.headers["x-access-token"]) {
        const accessToken = req.headers["x-access-token"];
        const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
        if (exp < Date.now().valueOf() / 1000) {
            return res.statusMessage(401).json({
                error: "JWT token has expired, please login to obtain a new one"
            });
        }
        
        res.locals.loggedInUser = await User.findById(userId);
        next();
    } else {
        next();
    }
});

app.use('/', routes);

app.listen(PORT, () => {
    console.log('Server is listening on Port:', PORT);
})