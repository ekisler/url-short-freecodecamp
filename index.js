require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();
const validator = require("validator");
const mongoose = require("mongoose");
const internal = require("stream");

mongoose.connect(process.env.MONGO_URI);

const Url = mongoose.model("Url", { original_url: String, short_url: Number });

// Configuracion Basica
const port = process.env.PORT || 3000;
app.use(express.urlencoded());
app.use(express.json());

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", async function (req, res) {
  let formData = req.body.url;
  formData = formData.trim();

  let isCorrect = validator.isURL(formData);

  if (!isCorrect) {
    res.json({ error: "invalid url" });
  } else {
    // Guardar los datos en Mongo
    // Envia y guarda la espuesta
    formData = formData.toLowerCase();
    const totalDocsInUrlCollection = await Url.countDocuments();
    const webUrl = new Url({
      original_url: formData,
      short_url: totalDocsInUrlCollection,
    });
    const savedData = await webUrl.save();

    res.json({
      original_url: savedData["original_url"],
      short_url: savedData["short_url"],
    });
  }
});

app.get("/api/shorturl/:index", async (req, res) => {
  try {
    let index = req.params.index;
    const data = await Url.findOne({ short_url: parseInt(index) });

    if (data) {
      res.redirect(data["original_url"]);
    } else {
      res.json({ error: "invalid url" });
    }
  } catch (e) {
    res.json({ error: "invalid url" });
  }
});

app.get("*", (req, res) => {
  res.send("invalid url");
});

app.listen(port, function () {
  console.log("Node.js listening ...");
});
