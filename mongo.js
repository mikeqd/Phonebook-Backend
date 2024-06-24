const mongoose = require("mongoose");

const username = "fullstackopen";
const password = encodeURIComponent(process.argv[2]);

const uri = `mongodb+srv://${username}:${password}@fsocluster.pjgu0f8.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=FSOCluster`;

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });

const personSchema = mongoose.Schema({
  name: String,
  number: Number,
});

const Person = mongoose.model("Person", personSchema);

const pers = new Person({
  name: process.argv[3],
  number: process.argv[4],
});

if (process.argv.length < 4) {
  Person.find({}).then((result) => {
    console.log("PHONEBOOK:");
    result.forEach((res) => {
      console.log(`${res.name} ${res.number}`);
      mongoose.connection.close();
    });
  });
} else {
  pers.save().then((result) => {
    console.log(`added ${result.name} number ${result.number}`);
    return mongoose.connection.close();
  });
}
