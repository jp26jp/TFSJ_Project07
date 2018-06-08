const express = require("express"),
      routes  = require("./routes"),
      path    = require("path")
const app = express()

// setup pug
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

app.use(routes)
app.use("/images", express.static(path.join(__dirname, "images")))

app.listen(3000, () => {
    console.log("The application is running on localhost:3000")
})