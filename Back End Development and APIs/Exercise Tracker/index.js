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
  User.find({})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ err });
    });
};

const createUserController = (req, res) => {
  const username = req.body.username;
  User.create({ username: username })
    .then((data) => {
      res.json({ _id: data._id, username: data.username });
    })
    .catch((err) => {
      res.json({ err });
    });
};

app.route("/api/users").get(findUserController).post(createUserController);

app.post("/api/users/:_id/exercises", async (req, res) => {
  const user_id = req.params._id;
  const user = await User.findById(user_id);
  if (!user) return res.json({ error: "User of the given 'id' doesn't exists" });

  const { description, duration, date } = req.body;
  if (!description) return res.json({ error: "Please provide Exercise description to proceed" });
  if (!duration) return res.json({ error: "Please provide Exercise duration to proceed" });

  const exercise = await new Exercise({
    user_id: user._id,
    description: description,
    duration: duration,
    date: date ? new Date(date) : new Date(),
  }).save();

  res.json({
    _id: user.id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: new Date(exercise.date).toDateString(),
  });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const user_id = req.params._id;
  const { from, to, limit } = req.query;

  const user = await User.findById(user_id);
  if (!user) return res.json({ error: "User of the given 'id' doesn't exists" });

  const searchObj = { user_id: user_id };
  const data = {};
  if (from) {
    const date = {
      $gte: new Date(from),
    };
    searchObj.date = date;
    data.from = from;
  }
  if (to) {
    const date = {
      $lte: new Date(to),
    };
    searchObj.date = date;
    data.to = to;
  }

  const exercise = await Exercise.find(searchObj).limit(+limit);
  if (!exercise) return res.json({ error: "No exercise exists for the given 'id'" });
  const log = exercise.map((item) => ({
    description: item.description,
    duration: item.duration,
    date: item.date.toDateString(),
  }));

  data.username = user.username;
  data.count = exercise.length;
  data._id = exercise.user_id;
  data.log = log;

  res.json(data);
});

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
