import express from 'express';
import bodyparser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/userRouter.js';
import jwt from "jsonwebtoken";
import orderRouter from './routes/orderRoute.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyparser.json())


app.use(
    (req,res,next)=>{
        const tokenString = req.header("Authorization")
        if(tokenString != null){
            const token = tokenString.replace("Bearer ","")

            jwt.verify(token,process.env.JWT_KEY,
                (err,decoded)=>{
                    if(decoded != null){
                        req.user = decoded
                        next()
                    }
                    else{console.log("invalid token")
                        res.status(403).json({
                            message:"invalid token"
                        })
                    }
                }
            )
        }
        else{
            next()
        }
        
    }
)

mongoose.connect(process.env.MONGODB_URL).
then(() => {
    console.log("connected to the mongoDB")
})
.catch(()=>{
    console.log("error connecting to the mongoDB")
})



app.use('/api/products',productRouter)
app.use('/api/users',userRouter)
app.use('/api/orders',orderRouter)

//mongodb+srv://admin:123@cluster0.kvqm3qz.mongodb.net/

app.listen(3000,
    () =>{
        console.log("server is running on port 3000")
    }
)