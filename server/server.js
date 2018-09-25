require('./config/config')

const express = require('express')
// Using Node.js `require()`
const mongoose = require('mongoose');
const path = require('path'),
    passport = require('passport'),
    session = require('express-session');


const app = express();

const bodyParser = require('body-parser')


// =============================================================================
// middlewares
// =============================================================================
app.use(session({
    secret: 'mysecretsession',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


// =============================================================================
// Habilitar la carpeta Public
// =============================================================================
app.use(express.static( path.resolve(__dirname,'../public')))

// Configuracion global de rutas
app.use(require('./routes/index'))


// =============================================================================
// Conectar Base de Datos
// =============================================================================
 
mongoose.connect(process.env.URLDB,{useNewUrlParser: true},(err, res) => {
      if (err) throw err;

      console.log('Base de datos Online');
  });

  // ===========================================================================
  // Servidor escuchando
  // ===========================================================================

app.listen(process.env.PORT, () => {
    console.log(`Escuchando puerto `, process.env.PORT);
})

