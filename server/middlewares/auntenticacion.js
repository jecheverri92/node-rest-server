const jwt = require('jsonwebtoken')
//=========================
// Verificar Token
//========================

let verificaToken = (req, res ,next) => {

    let token = req.get('Authorization');

    jwt.verify(token,process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok:false,
                err: {
                    message: 'Token no valido'
                }
            })

        }

        req.usuario = decoded.usuario;
        next()
    })

};

let verificaFacebook = (req, res ,next) => {

    let token = req.get('Authorization');

    console.log(req.body)

    jwt.verify(token,process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok:false,
                err: {
                    message: 'Token no valido'
                }
            })

        }

        req.usuario = decoded.usuario;
        next()
    })

};
//=========================
// Verificar Rol
//========================

let verificaAdmin_Rol = (req, res ,next) => {


    let usuario = req.usuario

    if(usuario.role !== 'ADMIN_ROLE' ) {

        return res.status(401).json({
            ok:false,
            err: {
                message: 'El usuario no es Administrador'
            }
        })
    }

    next()


};


module.exports = {
    verificaToken,
    verificaAdmin_Rol,
    verificaFacebook
}