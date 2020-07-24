// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

app.set("view engine", "pug");

const fetchData = () => JSDOM.fromURL(
    "https://e.infogram.com/71d42d9d-504e-4a8b-a697-f52f4178b329?src=embed",
    { runScripts: "dangerously" }
  )
    .then(dom => new Promise(r => dom.window.onload = () => r(dom)))
    .then(dom => {
      const data =
        dom.window.infographicData.elements.content.content.entities[
          "6c2332a5-b0ba-458e-aedf-21b9ec2a9722"
        ].props.chartData.data[0];
      data.shift();
      return data.map(([dateStr, ...rest]) => [
          dateStr.split(".").reverse().join("-"),
          ...rest.map(Number)
        ]
      )
    })


// https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
//   fetchData().then(data => {
//       // const confirmedRelativeToTests = []
//       const tests = [];
//       const confirmedCases = [];
//       data.map(([dateStr, confirmed, , negativeTests]) => {
//         const date = new Date(
//           dateStr
//             .split(".")
//             .reverse()
//             .join("-")
//         );

//         confirmed = parseInt(confirmed);
//         negativeTests = parseInt(negativeTests);
//         const totalTested = negativeTests + confirmed;

//         // const confirmedPercentage = confirmed ? confirmed*100 / totalTested : 0
//         confirmedCases.push({ x: dateStr, value: confirmed });
//         tests.push({ x: dateStr, value: totalTested });
//       });

//       response.render("index", { confirmedCases, tests });
//     })
//     .catch(e => {
//       response.render("index", { confirmedCases: [], tests: [] });
//     });
// });


app.get("/", (request, response) => {
    response.render("chart")
})

app.get('/data', (req, res, next) => {
  fetchData().then(data => {
    res.set({'Cache-Control': 'public, max-age=3600'})
    res.json(data)
    next()
  })
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
