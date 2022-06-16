const fs = require("fs");
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cron = require("node-cron");

require("dotenv").config();
const PORT = process.env.PORT || 5400;

const app = express();

app.use(cors());
app.use(formidable());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/upload", (req, res) => {
  const { files } = req;

  // Upload files to the upload dir
  Object.keys(files).forEach((name) => {
    fs.writeFileSync(
      __dirname + `/public/uploads/${name}`,
      fs.readFileSync(files[name].path)
    );
    console.log(`Uploaded ${name} to the 'public/uploads'`);
  });

  // Retriving the resulting url for each image
  const images = Object.keys(files).map(
    (file) => `http://localhost:5400/uploads/${file}`
  );

  res.json({ images });
});

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

/* How cron parses the time
https://www.npmjs.com/package/node-cron
 ┌────────────── second (optional)
 │ ┌──────────── minute
 │ │ ┌────────── hour
 │ │ │ ┌──────── day of month
 │ │ │ │ ┌────── month
 │ │ │ │ │ ┌──── day of week
 │ │ │ │ │ │
 │ │ │ │ │ │
 * * * * * *
*/

// Schedule for cleaning the uploads directory
const isCleaning = false;

isCleaning &&
  cron.schedule("*/30 * * * * *", () => {
    const dir = "public/uploads";

    fs.readdir(dir, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(dir, file), (err) => {
          if (err) {
            throw err;
          }
        });
      }
    });
  });
