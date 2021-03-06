const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const passport = require("./config/passport");
const router = require("./routes");
var favicon = require('serve-favicon')

//Configuración y Modelos de Base de Datos
const db = require("./config/db");
require("./models/Usuarios");
require("./models/categorias");
require("./models/grupos");
require("./models/Evento");
require("./models/Comentarios");
db.sync()
    .then(() => console.log("Bd Munity Conectada"))
    .catch((error) => console.log(error));

//Variables de entorno
require("dotenv").config({ path: "variables.env" });

//App
const app = express();

app.use(favicon(path.join(__dirname,'public','favicon.ico')));

//Body parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Express validator, validacion de las entradas del ususario
app.use(expressValidator());

//Habilitar EJS como template engine
app.use(expressLayouts);
app.set("view engine", "ejs");

//Ubicacion de las vistas 
app.set("views", path.join(__dirname, "./views"));

//Materiales estaticos 
app.use(express.static("public"));

//Habilitamos Cookie Parser
app.use(cookieParser());

//Creamos la sesion, claves para firmar la session y validarla 
app.use(
    session({
        secret: process.env.SECRETO,
        key: process.env.KEY,
        resave: false,
        saveUninitialized: false,
    })
);

//Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

//Agrega flash messages
app.use(flash());

// Mi propio Middelware (usuario logueado, flash messages, fecha actual) 
app.use((req, res, next) => {
    res.locals.usuario={...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

//Routing
app.use("/", router());

//Puerto
app.listen(process.env, () => {
    console.log("El servidor esta escuchando por el puerto 5000");
});