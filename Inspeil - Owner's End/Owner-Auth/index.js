const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./OwnerSchema.js");
const bcrypt = require("bcrypt");
const app = express();

const session = require("express-session");

const Booking = require("./BookingSchema.js");
const Court = require("./CourtSchema");

const { static } = require("express");

app.use(bodyParser.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "Secret key",
    resave: true, // Forces the session to be saved back to the session store
    saveUninitialized: true // Forces a session that is "uninitialized" to be saved to the store
  })
);


// template engine config


app.set('views', './views');
app.set('view engine', 'ejs');

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


app.get("/", (req, res) => {
  delete session.email;
  delete session.password;
  return res.redirect("login.html");
})
  .listen(3000);

console.log("Server Started on PORT 3000");

// setting up the mongo db connection
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

// above lines are for removing warnings

mongoose.connect("mongodb://127.0.0.1:27017/BookingsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", () => console.log("Error in Connecting to Database"));
db.once("open", () => console.log("Connected to Database"));

// sign-up endpoint
app.post("/sign_up", async (req, res) => {
  const username = req.body.username;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const contact = req.body.contact;
  const sport = req.body.sport;
  const court = req.body.court;
  const address = req.body.address;
  const street = req.body.street;
  const landmark = req.body.landmark;
  const city = req.body.city;
  const password = req.body.password;
  const copassword = req.body.copassword;

  if (password == copassword) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const data = {
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: email,
        contact: contact,
        sport: sport,
        court: court,
        address: address,
        street: street,
        landmark: landmark,
        city: city,
        password: hashedPassword,
        type: 1,
      };

      User.create(data, (err, data) => {
        if (err) {
          throw err;
        }
        console.log(data);
        console.log("Record Inserted Successfully");
      });

      return res.redirect("signup_success.html");
    } catch {
      console.log("Error in inserting record");
    }
  } else {
    return res.json({
      message: "Password error"
    });
  }
});

app.post("/dashboard", async (req, res) => {

  session.email = req.body.inputEmail;
  session.password = req.body.inputPassword;

  // console.log(username + " " + password);

  User.findOne({ email: session.email }, async (err, user) => {
    //  status codes -- 1 success, 2 not found, 3 incorrect password
    if (user === null) {
      return res.redirect('login.html'); // User not Found
    }

    try {
      // Login successful
      if (await bcrypt.compare(session.password, user.password)) {
        User.find({ email: session.username }, function (error, result) {

          res.render("Owner Dashboard", { username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, contact: user.contact, sport: user.sport, court: user.court, address: user.address });

        });


      } else {
        return res.redirect('login.html');
      } // Incorrect Password
    } catch {
      res.json({ status: -1 }); // unknown error
    }
  });
});

app.get("/dash", async (req, res) => {


  // console.log(username + " " + password);

  User.findOne({ email: session.email }, async (err, user) => {
    //  status codes -- 1 success, 2 not found, 3 incorrect password
    if (user === null) {
      return res.redirect('login.html');  // User not Found
    }

    try {
      // Login successful
      if (await bcrypt.compare(session.password, user.password)) {
        User.find({ email: session.username }, function (error, result) {

          res.render("Owner Dashboard", { username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, contact: user.contact, sport: user.sport, court: user.court, address: user.address });

        });


      } else {
        return res.redirect('login.html');
      } // Incorrect Password
    } catch {
      res.json({ status: -1 }); // unknown error
    }
  });
});

// login endpoint
app.get("/profile", async (req, res) => {

  // console.log(username + " " + password);

  User.findOne({ email: session.email }, async (err, user) => {
    //  status codes -- 1 success, 2 not found, 3 incorrect password
    if (user === null) {
      return res.redirect('login.html'); // User not Found
    }

    try {
      // Login successful
      if (await bcrypt.compare(session.password, user.password)) {
        User.find({ email: session.username }, function (error, result) {

          res.render("profile_owner", { username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, contact: user.contact, sport: user.sport, court: user.court, address: user.address, street: user.street, landmark: user.landmark, city: user.city, description: user.description });

        });


      } else {
        return res.redirect('login.html');
      } // Incorrect Password
    } catch {
      res.json({ status: -1 }); // unknown error
    }
  });
});


app.all(
  '/update',

  async (req, res) => {

    User.findOne({ email: session.email }, async (err, user) => {
      //  status codes -- 1 success, 2 not found, 3 incorrect password
      if (user === null) {
        return res.redirect('login.html'); // User not Found
      }

      const username = req.body.username;
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
      const email = req.body.email;
      const contact = req.body.contact;
      const sport = req.body.sport;
      const court = req.body.court;
      const address = req.body.address;
      const street = req.body.street;
      const landmark = req.body.landmark;
      const city = req.body.city;
      const description = req.body.description;

      User.update(
        { email: email },
        { username: username, firstname: firstname, lastname: lastname, contact: contact, sport: sport, court: court, address: address, street: street, landmark: landmark, city: city, description: description },
        function (error, result) {
          res.render("profile_owner", { username: username, firstname: firstname, lastname: lastname, email: email, contact: contact, sport: sport, court: court, address: address, street: street, landmark: landmark, city: city, description: description });
        });

    });
  });

// login endpoint
app.get("/edit", async (req, res) => {

  // console.log(username + " " + password);

  User.findOne({ email: session.email }, async (err, user) => {
    //  status codes -- 1 success, 2 not found, 3 incorrect password
    if (user === null) {
      return res.redirect('login.html'); // User not Found
    }

    try {
      // Login successful
      if (await bcrypt.compare(session.password, user.password)) {
        User.find({ email: session.username }, function (error, result) {

          res.render("edit_profile", { username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, contact: user.contact, sport: user.sport, court: user.court, address: user.address, street: user.street, landmark: user.landmark, city: user.city, description: user.description });

        });


      } else {
        return res.redirect('login.html');
      } // Incorrect Password
    } catch {
      res.json({ status: -1 }); // unknown error
    }
  });
});


app.all(
  "/add_slot",
  async function (req, res) {

    const user = await User.findOne({ email: session.email })

    if (!user) {
      return res.redirect('login.html');
    }

    const starthr = req.body.starthr;
    const startmin = req.body.startmin;
    const endhr = req.body.endhr;
    const endmin = req.body.endmin;
    const am = req.body.am;
    const pm = req.body.pm;
    console.log(starthr);

    if (req.body.starthr != undefined) {

      const slot = {
          startTime: {
            hours: starthr,
            minutes: startmin,
            am: am,
          },
          endTime: {
            hours: endhr,
            minutes: endmin,
            pm: pm,
          }
      }

      console.log(req.body.starthr);
      console.log(slot);
       user.slots = user.slots.concat( slot )

       await user.save()

    }


    User.find(function (error, result) {
      if (error) {
        return res.json({
          status: false,
          message: "Fail..",
          error: error
        });
      }
      User.find({ email: session.email }, function (err, result) {
        past = [];
        for (var ob of result) {
          past.push(ob.slots);

        }
        res.render('add_slots', { past: past[0] });
      })

    })
  });


app.get("/offline", (req, res) => {
  User.findOne(
    { name: req.params.firstname },
    (err, data) => {
      if (err) throw err;
      else {
        if (data != null) res.render("Offline Bookings", { court: data });
        else res.send(data);
        // Check this once
      }
    }
  );
});

app.post("/offline", (req, res) => {
  // console.log(req.body.date);
  // var date = new Date(Date.parse(req.body.date));
  // console.log("Date is " + date.toLocaleDateString());
  // session.date = date;
  // console.log(date.toLocaleDateString());
  // console.log(session.date.toLocaleDateString());
  // console.log(typeof session.courtName);
  var date = req.body.date;
  var total = [];
  User.findOne({ email: session.email }, (err, data) => {
    if (err) throw err;
    else {
      console.log("Now here");
      console.log(data.slots);
      session.total = data.slots;
      console.log(session.total);
      session.total = data.slots.map(
        obj =>
          obj.startTime.hours +
          ":" +
          String(obj.startTime.minutes).padStart(2, "0") + obj.startTime.am +
          " - " +
          obj.endTime.hours +
          ":" +
          String(obj.endTime.minutes).padStart(2, "0")+ obj.endTime.pm 
      );
    }
  });
  Booking.find({ courtname: req.params.courtName }, (err, data) => {
    if (err) throw err;
    else {
      // console.log(data[0].date.getTime());
      // date.toLocaleDateString();
      // console.log(data[0].date);
      // console.log(date.toLocaleDateString().toString());
      // console.log(date.toLocaleDateString() == data[0].date);
      // session.booked = data;
      // console.log("here");
      // console.log(session.booked);
      session.date = date;
      Booking.find({ date: date }, (err, data) => {
        if (err) throw err;
        else {
          console.log("Now here");
          session.total = data.slots;
          console.log(session.total);

          session.booked = data.slots.map(
            obj =>
              obj.slot.startTime.hours +
              ":" +
              String(obj.slot.startTime.minutes).padStart(2, "0") +
              " - " +
              obj.slot.endTime.hours +
              ":" +
              String(obj.slot.endTime.minutes).padStart(2, "0")
          );
          console.log("Booked: " + session.booked);
          session.morning = session.total.filter(
            item => +item.split(":")[0] < 12
          );
          session.afternoon = session.total.filter(
            item => +item.split(":")[0] < 16 && +item.split(":")[0] >= 12
          );
          session.evening = session.total.filter(
            item => +item.split(":")[0] >= 16
          );
          console.log("Morning ones are: ", session.morning);
          console.log("Afternoon ones are: ", session.afternoon);
          console.log("Evening ones are: ", session.evening);
          console.log("Total: " + session.total);
          res.redirect("/book/123");
        }
      });
    }
  });
});

app.get("/book/123/", (req, res) => {
  res.render("Slot", {
    booked: session.booked,
    morning: session.morning,
    afternoon: session.afternoon,
    evening: session.evening
  });
});


app.post("/slot", (req, res) => {
  console.log("I'm here");
  var slots = req.body.slots;
  console.log(typeof slots);
  if (typeof slots == "string") {
    console.log("I was here");
    session.booking = [
      {
        startTime: {
          hours: +slots.split("-")[0].split(":")[0],
          minutes: +slots.split("-")[0].split(":")[1]
        },
        endTime: {
          hours: +slots.split("-")[1].split(":")[0],
          minutes: +slots.split("-")[1].split(":")[1]
        }
      }
    ];
  } else {
    session.booking = [];
    slots.forEach(slots =>
      session.booking.push({
        startTime: {
          hours: +slots.split("-")[0].split(":")[0],
          minutes: +slots.split("-")[0].split(":")[1]
        },
        endTime: {
          hours: +slots.split("-")[1].split(":")[0],
          minutes: +slots.split("-")[1].split(":")[1]
        }
      })
    );
  }
  console.log(session.date);
  console.log(session.courtName);
  for (var booking of session.booking) {
    data = {
      username: "5678",
      date: session.date,
      courtName: session.courtName,
      ownerusername: "demowner",
      slot: booking,
      cost: 300
    };
    Booking.create(data, (err, data) => {
      if (err) {
        throw err;
      }
      console.log(data);
      console.log("Record Inserted Successfully");
      res.render("index");
    });
  }
  // console.log("Session.bookings: ", session.booking);
  res.send(req.body);
});