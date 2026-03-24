import "dotenv/config";
import express from "express";
import routes from "./routes";

const app = express();
app.use(express.json());

app.use("/profiles", routes);

app.listen(3001, () => {
    console.log("ProfileService started on 3001");
});
