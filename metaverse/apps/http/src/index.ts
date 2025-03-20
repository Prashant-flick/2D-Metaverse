import express from 'express';
import { router } from './routes/v1';
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}))

app.use("/api/v1", router);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
