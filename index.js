require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const morgan = require("morgan");
const cors = require("cors");
app.use(cors());
app.use(express.static("dist"));

const Person = require("./models/phone");

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
  {
    id: 5,
    name: "Gayle Becker",
    number: "39-77-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    response.json(result);
  });
});

app.get("/info", (request, response) => {
  const time = new Date();
  Person.countDocuments().then((count) => {
    console.log(`This is the value of ${count}`);
    response.send(`<p>Phonebook has info for ${count} people</p><p>${time}<p>`);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((result) => response.json(result))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      console.log(`This ${result} was deleted`);
    })
    .catch((error) => console.log(`ERROR: ${error.message}`));
});

app.post("/api/persons/", (request, response, next) => {
  const body = request.body;

  if (!body || !body.name || !body.number) {
    return response.status(400).json({ error: "Name and number are required" });
  }

  const userId = Math.floor(Math.random() * 1000);

  const newPerson = new Person({
    id: userId,
    name: body.name,
    number: body.number,
  });

  console.log("This is NEWPERSON", newPerson);
  newPerson
    .save()
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((error) => {
      next(error);
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const pers = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, pers, { new: true })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
