const { Client } = require("pg");
const express = require("express");
const app = express();
const jsdom = require("jsdom");
const { expand, flatten } = require("./helpers");
const { JSDOM } = jsdom;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

app.set("view engine", "pug");

app.use("/public", express.static("public"));

const fetchData = async () => {
  const res = await client.query('SELECT * FROM "data" ORDER BY "date"');
  const count = res.rows.length;
  const lastRow = res.rows[count - 1];
  let needToUpdateDB = false;
  const now = new Date();
  now.setUTCHours(0);
  now.setUTCMinutes(0);
  now.setUTCSeconds(0);
  now.setUTCMilliseconds(0);
  now.setUTCDate(now.getUTCDate());
  let lastUpdatedNextDate;
  if (lastRow) {
    const lastUpdatedDate = new Date(
      Date.UTC(
        lastRow.date.getFullYear(),
        lastRow.date.getMonth(),
        lastRow.date.getDate()
      )
    );
    lastUpdatedNextDate = new Date(lastUpdatedDate);
    lastUpdatedDate.setUTCDate(lastUpdatedDate.getUTCDate() + 1);
    if (lastUpdatedDate < now) {
      needToUpdateDB = true;
    }
  }
  if (count === 0 || needToUpdateDB) {
    JSDOM.fromURL(
      "https://e.infogram.com/71d42d9d-504e-4a8b-a697-f52f4178b329?src=embed",
      { runScripts: "dangerously" }
    )
      .then((dom) => new Promise((r) => (dom.window.onload = () => r(dom))))
      .then((dom) => {
        const data =
          dom.window.infographicData.elements.content.content.entities[
            "f5b6e83c-39b1-47c6-a84f-cd7ebaa3b7b1"
          ].props.chartData.data[0];

        return data.reduce(
          (acc, [dateStr, confirmed, recovered, negativeTests, deaths = 0]) => {
            if (dateStr === "31.10.2021") {
              dateStr = "31.07.2021";
            } else if (dateStr === "08.08.2025") {
              dateStr = "08.08.2020";
            }
            const [day, month, year] = dateStr.split(".").map(Number);
            const date = new Date(Date.UTC(year, month - 1, day));
            const numbers = [
              confirmed,
              recovered,
              negativeTests,
              deaths,
            ].map((n) => parseInt(n, 10));
            if (
              (lastUpdatedNextDate && lastUpdatedNextDate >= date) ||
              numbers.some(Number.isNaN)
            ) {
              return acc;
            }
            return [...acc, [date, ...numbers]];
          },
          []
        );
      })
      .then(async (data) => {
        if (data.length > 0) {
          return client.query(
            `INSERT INTO data VALUES ${expand(data.length, 5)}`,
            flatten(data)
          );
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
  return res.rows;
};

app.get("/", (request, response) => {
  response.render("chart");
});

app.get("/data", async (req, res) => {
  // res.set('Cache-Control', 'max-age=86400')
  try {
    const data = await fetchData();
    const { date } = [...data].pop();
    const lastDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 2, 6, 30)
    );
    res.set("Expires", lastDate.toUTCString());
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
