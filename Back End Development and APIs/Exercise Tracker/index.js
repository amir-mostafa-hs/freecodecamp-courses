require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: { type: String, require: true, unique: true },
});
const User = model("User", UserSchema);

const ExerciseSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  description: String,
  duration: Number,
  date: Date,
});
const Exercise = model("Exercise", ExerciseSchema);

app.use(cors(), express.json(), express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const findUserController = (req, res) => {
  User.find({}, (err, data) => {
    if (err) return res.json({ err });
    res.json(data);
  });
};

const createUserController = (req, res) => {
  const username = req.body.username;
  User.create({ username: username }, (err, data) => {
    if (err) return res.json({ err });
    res.json({ _id: data._id, username: data.username });
  });
};

app.route("/api/users").get(findUserController).post(createUserController);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log("Your app is listening on port " + listener.address().port);
    });
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });
