const express = require("express");
const xmlrpc = require("xmlrpc");
const app = express();

const odooUrl = "http://localhost:8069"; // Replace with your Odoo instance URL
const db = "your_database_name"; // Replace with your Odoo database name
const username = "your_username"; // Replace with your Odoo username
const password = "your_password"; // Replace with your Odoo password

const client = xmlrpc.createClient(odooUrl + "/xmlrpc/2/common");

app.post("/xmlrpc", (req, res) => {
  const method = req.body.method;
  const params = req.body.params;

  client.methodCall(method, params, (error, value) => {
    if (error) {
      res.status(500).send({ error: error });
    } else {
      res.send({ result: value });
    }
  });
});

app.listen(8080, () => {});
