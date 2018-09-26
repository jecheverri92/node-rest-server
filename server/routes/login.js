const express = require('express')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verificaToken, verificaAdmin_Rol, verificaFacebook } = require('../middlewares/auntenticacion')


const Usuario = require('../models/usuario')

const app = express()

app.post('/login', (req, res) => {
    
    let body = req.body
    
    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrecta'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrecta'
                }
            });
        }
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        });
        
        ok: true,
            res.json({
            usuario: usuarioDB,
            token
        });
    })
    
})


// =============================================================================
// Autenticacion Google
// =============================================================================
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        provider: 'Google',

    }

}

app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        })

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };
        if (usuarioDB) {

            if (usuarioDB.provider !== 'Google') {
                
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticacion normal o facebook'
                    }
                })
                
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            // Si el Usuario no exite en nuestra base de datos

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img,
            usuario.provider = 'Google',
            usuario.password = ':D';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });
        }
    });

})

// =============================================================================
// Sing in Facebook Passport
// =============================================================================

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

passport.use('facebook',new FacebookStrategy({
    clientID:  process.env.FCLIENT_ID,
    clientSecret: process.env.FCLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {

    Usuario.findOne({email: profile._json.email}, (err, usuarioDB) => {
        if (err) {
            return done(err, false, err.message)
        }if (usuarioDB) {
            
            if (usuarioDB.provider !== 'facebook') {
                
                return done(err, false, err.message)
            }else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });
                return done(null, {usuarioDB,token})
            }


        } else { // Si no existe el usuario lo crea
            
            const newUser = new Usuario();
            newUser.nombre = profile.displayName;
            newUser.email =profile._json.email;
            newUser.img = profile.photos[0].value,
            newUser.provider = profile.provider,
            newUser.password = ':D';

            newUser.save((err, usuarioDB) => {
                if (err) {
                    return done(err,false,err.message)
                }
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });
                return done(null,usuarioDB);

            });
            
        }
        
    });
        
}))

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    const userDB = await Usuario.findById(id);
    done(null, userDB)
})

const authenFacebook = passport.authenticate('facebook', { failureRedirect: '/', session: false })
 
app.get('/auth/facebook',         // Esta hay que llamarla desde el boton
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  authenFacebook,
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req.user)
    res.redirect('/');
  });


  app.get('/profiler',verificaFacebook, (req, res)=>{
      console.log('En profiler papu')
  })

 module.exports = app; 