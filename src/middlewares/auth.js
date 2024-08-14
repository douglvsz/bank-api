import jwt from 'jsonwebtoken'

const secret = process.env.SECRET

export const auth = async(req, res, next) => {

const token = req.headers.authorization;
if(!token) return res.json({message: 'Token inválido'});

const decoded = jwt.verify(token.replace('Bearer ', ''), secret)
req.userId = decoded.id;

next()
};