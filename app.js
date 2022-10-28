const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const db_path = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  db = await open({ filename: db_path, driver: sqlite3.Database });
  app.listen(3000, () => {
    try {
      console.log("server running at http://localhost:3000");
    } catch (error) {
      console.log(`DB ERROR ${error.message}`);
      process.exit(1);
    }
  });
};
initializeDbAndServer();

//API 1 GET
app.get("/todos/", async (request, response) => {
  try {
    const {
      offset = 0,
      limit = 5,
      order = "ASC",
      order_by = "id",
      status = "",
      priority = "",
      search_q = "",
    } = request.query;
    const Query = `
    SELECT
        *
    FROM
        todo
    WHERE
        status LIKE '%${status}%' and
        priority LIKE '%${priority}%' and 
        todo LIKE '%${search_q}%' 
    ORDER BY ${order_by} ${order}
        LIMIT ${limit} OFFSET ${offset};`;
    const dbResponse = await db.all(Query);
    response.send(dbResponse);
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 2 POST
app.post("/todos/", async (request, response) => {
  try {
    const todoDetails = request.body;
    const { id, todo, priority, status } = todoDetails;
    const Query = `
        INSERT INTO
            todo (id,todo, priority,status)
        VALUES
            (
                ${id},
                "${todo}",
                "${priority}",
                "${status}"
            );`;
    const dbResponse = await db.run(Query);
    response.send("Todo Successfully Added");
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

// API 3 GET
app.get("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const Query = `
        SELECT
            *
        FROM
            todo
        WHERE
            Id=${todoId};`;
    let dbResponse = await db.get(Query);
    response.send(dbResponse);
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 4 PUT
app.put("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const todoDetails = request.body;
    let key = null;
    let value = null;
    function getQuery(key, value) {
      const Query = `
        UPDATE
            todo
        SET
            ${key}="${value}"
        WHERE
            id=${todoId};`;
      return Query;
    }
    if ("status" in todoDetails) {
      const { status } = todoDetails;
      key = "status";
      value = status;
      Query = getQuery(key, value);
      await db.run(Query);
      response.send("Status Updated");
    }
    if ("priority" in todoDetails) {
      const { priority } = todoDetails;
      key = "priority";
      value = priority;
      Query = getQuery(key, value);
      await db.run(Query);
      response.send("Priority Updated");
    }
    if ("todo" in todoDetails) {
      const { todo } = todoDetails;
      key = "todo";
      value = todo;
      Query = getQuery(key, value);
      await db.run(Query);
      response.send("Todo Updated");
    }
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 5 DELETE
app.delete("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const Query = `
        DELETE FROM
            todo
        WHERE
            id=${todoId};`;
    await db.run(Query);
    response.send("Todo Deleted");
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

module.exports = app;
