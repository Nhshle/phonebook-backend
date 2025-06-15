const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as and argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://engnhshl:${password}@cluster0.4wcxh.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name: "Ali Zayed",
  number: "774-713-102",
});

// person.save().then((result) => {
//   console.log("person saved!");
//   mongoose.connection.close();
// });

Person.find({}).then((result) => {
  console.log("phonebook:");
  result.forEach((person) => {
    console.log(`${person.name} ${person.number}`);
  });
  mongoose.connection.close();
});
