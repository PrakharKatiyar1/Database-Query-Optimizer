const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";

async function collectQueries() {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db("weather"); // your database name

    const profile = db.collection("system.profile");

    const queries = await profile
      .find({ op: "query" })
      .limit(5)
      .toArray();

    console.log("Collected Queries:\n");

    queries.forEach(q => {
      console.log("Collection:", q.ns);
      console.log("Filter:", q.command.filter);
      console.log("Docs Examined:", q.docsExamined);
      console.log("Execution Time:", q.millis, "ms");
      console.log("Plan:", q.planSummary);
      console.log("-------------------------");
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

collectQueries();
