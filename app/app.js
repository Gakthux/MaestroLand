import express from 'express';
import bodyParser from 'body-parser';

import { v1 as neo4j } from 'neo4j-driver';

const driver = neo4j.driver("bolt://neo4j", neo4j.auth.basic("neo4j", "test"));
const session = driver.session();
const API_PORT = 3000;

const app = express();

const fillQueryFromBody = (body) => {
  return Object.keys(body).map((key, index) => {
    return `${key}: $${key}`;
  })
}

const formatJSON = (body) => {
  return Object.keys(body).map((key, index) => {
    return `${key}: '${body[key]}'`;
  })
}

// app.use('/', express.static(__dirname + '/view'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Creates a Person with all the attributes contained in the req.body
app.post('/person', (req, res, next) => {
  const resultPromise = session.run(`CREATE (p:Person {${fillQueryFromBody(req.body)}}) RETURN p`, req.body);
  resultPromise
    .then(result => res.json(result))
    .catch(err => console.log('err -> ', err))
});

// Creates a Skill with all the attributes contained in the req.body
app.post('/skill', (req, res, next) => {
  const resultPromise = session.run(`CREATE (s:Skill {${fillQueryFromBody(req.body)}}) RETURN s`, req.body);
  resultPromise
    .then(result => res.json(result))
    .catch(err => console.log('err -> ', err))
});

// Links a Person with a Skill with the Person's firstname and the Skill's name
app.post('/person/addSkill/:firstname/:skillName', (req, res, next) => {
  const resultPromise = session.run(`MATCH (p:Person {firstname: '${req.params.firstname}'}), (s:Skill {name: '${req.params.skillName}'}) CREATE (p)-[r:HAS_SKILL]->(s) RETURN r`);
  resultPromise
    .then(result => res.json(result))
    .catch(err => console.log('err -> ', err))
});

// Flushes the database
app.delete('/all', (req, res, next) => {
  const resultPromise = session.run('MATCH (n) DETACH DELETE n');
  resultPromise
    .then(result => res.json(result))
    .catch(err => console.log('err -> ', err))
});

app.listen(API_PORT, function () {
    console.log(`Server started on port: ${API_PORT}`);
});
