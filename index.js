const express = require("express");
const app = express();
app.use(express.json());
const morgan = require("morgan");
const cors = require("cors");
app.use(cors());

morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});

morgan.token("content-length", (req, res) => {
  return JSON.stringify(req.get("Content-Length"));
});

app.use(
  morgan(":method :url :status :content-length - :response-time ms  :body")
);

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  return response.json(persons);
});

app.get("/info", (request, response) => {
  const time = new Date();
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${time}<p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const named = persons.find((p) => {
    return p.id === id;
  });
  console.log("This is the type of ", typeof named);
  console.log("This is NAMED", JSON.stringify(named));

  if (!named) {
    response.status(404).json({
      error: "person not found",
    });
  } else {
    response.json(named);
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

app.post("/api/persons/", (request, response) => {
  const body = request.body;

  if (!body || !body.name || !body.number) {
    return response.status(400).json({ error: "Name and number are required" });
  }

  const nameEntered = body.name.trim().toLowerCase();

  if (persons.some((p) => p.name.trim().toLowerCase() === nameEntered)) {
    return response.status(409).json({
      error: "Username already exists. Name must be unique",
    });
  } else {
    const personName = body.name;
    const personNum = body.number;
    const userId = Math.floor(Math.random() * 1000);

    const newPerson = {
      id: userId,
      name: personName,
      number: personNum,
    };

    persons = persons.concat(newPerson);
    console.log("This is NEWPERSON", newPerson);
    response.status(201).json(newPerson);
  }
});

app.use(unknownEndpoint);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
