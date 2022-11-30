const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Animal = require("./animal.controller");
const { Auth, isAuthenticated } = require("./controller/auth.controller");
const port = 3000;

mongoose.connect("mongodb+srv://john_villalba:Atenea-9752@cluster0.u8wryzd.mongodb.net/myapp?retryWrites=true&w=majority");

app.use(express.json());

app.get("/animals", isAuthenticated, Animal.list);
app.post("/animals", isAuthenticated, Animal.create);
app.put("/animals/:id", isAuthenticated, Animal.update);
app.patch("/animals/:id", isAuthenticated, Animal.update);
app.delete("/animals/:id", isAuthenticated, Animal.destroy);

//user login and register endpoints

app.post("/register", Auth.register);
app.post("/login", Auth.login);

app.use(express.static("app"));

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});
app.get("*", (req, res) => {
  res.status(404).send("Esta página no existe :(");
});

app.listen(port, () => {
  console.log("Arrancando la aplicación!");
});
