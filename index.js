const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(cors());

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(express.json());
app.use(express.static("dist"));

app.get("/api/persons", (request, response) => {
  response.json(persons);
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
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    return response.status(204).json({
      error: "person not found",
    });
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).json({
    error: "person not found!",
  });
});

const generateId = () => {
  let maxId =
    persons.length > 0
      ? Math.max(...persons.map((person) => Number(person.id)))
      : 0;
  return String(maxId + 1);
};
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(204).json({
      error: "contents are missing!",
    });
  }

  const nameExists = persons.some((person) => person.name === body.name);

  if (nameExists) {
    return response.status(409).json({
      error: "Name must be unique!",
    });
  } else {
    const newPerson = {
      id: generateId(),
      name: body.name,
      number: body.number,
    };
    persons = persons.concat(newPerson);
    response.status(201).json(newPerson);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
