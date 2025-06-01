import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { Schema, model, connect, disconnect } from "mongoose";

const connectionString =
  "mongodb://root:password@192.168.12.254:27017/drain-braindb?authSource=admin";

const oilChangeHistorySchema = new Schema({
  description: String,
  changedDate: String,
  oilChangedMiles: Number,
  nextChangeDate: String,
  nextOilChangeMiles: Number,
});

const oilChangeHistoryModel = model(
  "oil-change-history",
  oilChangeHistorySchema,
  "oil-change-history",
);

const app = new Hono();
app.use(prettyJSON({ space: 4 }));

app.get("/", (c) => {
  return c.json({ greeting: "Hello Hono!" });
});

app.post("/oilchangehistory", async (ctx) => {
  const body = await ctx.req.json();
  console.log("Received oil change history:", body);
});

app.get("/oilchangehistory", async (ctx) => {
  console.log("Fetching oil change history...");
  try {
    await connect(connectionString);
    const result = await oilChangeHistoryModel.find({});
    await disconnect();
    return ctx.json(result);
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching oil change history:", error);
    return ctx.json({ message: err.message, status: 500 });
  }
});

app.get("/oilchangehistory/changeddate/:changedDate", async (ctx) => {
  const { changedDate } = ctx.req.param();
  try {
    await connect(connectionString);
    const result = await oilChangeHistoryModel
      .findOne({
        changedDate: changedDate,
      })
      .exec();
    await disconnect();
    return ctx.json(result);
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching oil change history:", error);
    return ctx.json({ message: err.message, status: 500 });
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
