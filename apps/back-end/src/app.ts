const { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const express = require("express");
const serverless = require("serverless-http");

const app = express();
const client = new DynamoDBClient({});

const TODOS_TABLE = process.env.TODOS_TABLE;

app.use(express.json());

app.get("/todos", async function (req, res) {
  try {
    const command = new ScanCommand({ TableName: TODOS_TABLE });
    const response = await client.send(command);
    
    const todos = response.Items.map(item => {
      const { id, title, description, completed } = item;
      return { 
        id: id.S,
        title: title.S,
        description: description.S,
        completed: completed.BOOL,
      };
    });

    res.json({ todos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retreive todo items" });
  }
});

app.get("/todos/:id", async function (req, res) {
  const params = {
    TableName: TODOS_TABLE,
    Key: {
      id: {
        S: `${req.params.id}`
      }
    },
  };

  try {
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);
    if (Item) {
      const { id, title, description, completed } = Item;
      res.json({ 
        id: id.S,
        title: title.S,
        description: description.S,
        completed: completed.BOOL,  
      });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find todo item with provided "id"' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retreive todo item" });
  }
});

app.delete("/todos/:id", async function (req, res) {
  const params = {
    TableName: TODOS_TABLE,
    Key: {
      id: {
        S: `${req.params.id}`
      }
    },
  };

  try {
    const command = new DeleteItemCommand(params);
    await client.send(command);
    res.json({ });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete todo item" });
  }
});

app.post("/todos", async function (req, res) {
  const { id, title, description, completed } = req.body;

  const params = {
    TableName: TODOS_TABLE,
    Item: {
      id: {
        S: id
      },
      title: {
        S: title
      },
      description: {
        S: description
      },
      completed: {
        BOOL: completed
      },
    },
  };

  try {
    const command = new PutItemCommand(params);
    await client.send(command);
    res.json({ id, title, description, completed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create todo item" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);

export default handler;
