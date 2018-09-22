

//=========================
// Puerto
//========================

process.env.PORT = process.env.PORT || 3000

//=========================
// Entorno
//========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

//=========================
// Vencimiento del TOken
//========================
// 60 Segundos
// 60 Minutos
// 24 Horas
// 30 Dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 *30;

//=========================
// SEED de Auntenticacion
//========================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo' 


//=========================
// Base de datos 
//========================

let urlDB;

if (process.env.NODE_ENV=== 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB= process.env.MONGO_URL
}

process.env.URLDB = urlDB