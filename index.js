require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Person = require("./models/person");
const morgan = require("morgan");

const app = express();
app.use(cors());

let persons = [];

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(requestLogger);
app.use(express.static("dist"));
app.use(express.json());

app.get("/api/persons", (request, response) => {
  Person.find({})
    .then((result) => {
      persons = result;
      response.json(persons);
    })
    .catch((error) => {
      console.error("Error fetching persons:", error);
      response.status(500).send({ error: "Failed to fetch persons" });
    });
});

app.get("/info", (request, response) => {
  const date = new Date();
  let personsCount = persons.length;
  response.send(`
    <div>
    <h3>Phonebook has info for ${personsCount} people.</h3>
    <h4>${date}</h4>
    </div>
    `);
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => {
      console.error("Error fetching person:", error);
      response.status(500).send({ error: "Failed to fetch person" });
    });
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      if (result) {
        persons = persons.filter((person) => person.id !== request.params.id);
        response.status(204).end();
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => {
      console.error("Error deleting person:", error);
      response.status(500).send({ error: "Failed to delete person" });
    });
});

// const generateId = () => {
//   let maxId =
//     persons.length > 0
//       ? Math.max(...persons.map((person) => Number(person.id)))
//       : 0;
//   return String(maxId + 1);
// };
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(204).json({
      error: "name or number is missing!",
    });
  }

  const nameExists = persons.some((person) => person.name === body.name);

  if (nameExists) {
    return response.status(409).json({
      error: "Name must be unique!",
    });
  } else {
    const person = new Person({
      // id: generateId(),
      name: body.name,
      number: body.number,
    });
    person
      .save()
      .then((savedPerson) => {
        persons = persons.concat(savedPerson);
        response.json(savedPerson);
      })
      .catch((error) => {
        console.error("Error saving person:", error);
        response.status(500).send({ error: "Failed to save person" });
      });
  }
});

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// Error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
