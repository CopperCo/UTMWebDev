var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "quotes_db"
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

// Retrieve all quotes
app.get('/', function(req, res) {
  connection.query('SELECT * FROM quotes;', function(err, data) {
    if (err) {
      return res.status(500).end();
    }
    res.render('index', {quotes: data})
    // res.status(200).send(data);
    // res.json(data);
  });
});

// Create a new quotes
app.post('/api/quotes', function(req, res) {

  connection.query(
    'INSERT INTO quotes (quote) VALUES (?)',
    [req.body.author, req.body.quote],
    function(err, result) {
      if (err) {
        return res.status(500).end();
      }

      // Send back the ID of the new quotes
      // res.json({ id: result.insertId });
      // console.log({ id: result.insertId });
      res.status(200).send(result);
    }
  );
  
});



// Update a quotes
app.put('/quotes/:id', function(req, res) {
  connection.query(
    'UPDATE quotes SET quote = ? WHERE id = ?',
    [req.body.quote, req.params.id],
    function(err, result) {
      if (err) {
        // If an error occurred, send a generic server failure
        return res.status(500).end();
      } else if (result.changedRows === 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      }
      res.status(200).send(result);
      // res.status(200).end();
    }
  );
});

// Delete a quote
app.delete('/quotes/:id', function(req, res) {
  connection.query('DELETE FROM quotes WHERE id = ?', [req.params.id], function(
    err,
    result
  ) {
    if (err) {
      // If an error occurred, send a generic server failure
      return res.status(500).end();
    } else if (result.affectedRows === 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return res.status(404).end();
    }
    res.status(200).send(result);
    // res.status(200).end();
  });
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log('Server listening on: http://localhost:' + PORT);
});
