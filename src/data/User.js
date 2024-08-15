import { PrismaClient } from "@prisma/client";
import CPF from "cpf-check"
import validator from "validator";
import bcrypt, { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

const secrettoken = process.env.SECRET


const prisma = new PrismaClient();

class User{
    constructor(body){
        this.body = body;
        this.errors = [];
    };

    async register(){ 
        await this.exist()
        if(this.errors.length > 0) return this.errors
        
        await this.validateCpf()
        if(this.errors.length > 0) return this.errors
        
        await this.valida()
        if(this.errors.length > 0) return this.errors
        
        const {nome, cpf, email, senha} = this.body;
        const outAsk = cpf.replace(/\D/g, '');
        
        const passHash = await bcrypt.hash(senha, 10)
        const user = await prisma.user.create({data:{nome: nome, cpf: outAsk, email: email, senha: passHash,}});
        
        return ({message: 'Usuário criado', success: true, user: user.nome})
    };

    async login(){
        await this.valida()
        if(this.errors.length > 0) return this.errors
        
        const find = await prisma.user.findUnique({where: {email: this.body.email}})
        if(!find) return this.errors.push('Usuário não existe!');
        
        const compareHash = await bcrypt.compare(this.body.senha, find.senha)
        if(!compareHash) return this.errors.push('Senha incorreta!');

        const payload = {id: find.id};
        const secret = (secrettoken);
        const option = {expiresIn: '1d'}

        const token = jwt.sign(payload, secret, option)

        return({message: `Bem vindo, ${find.nome}`, success: true, token: token})
    };

    async valida(){
        const email = this.body.email;
        const valEmail = validator.isEmail(email)
        if(!valEmail) return this.errors.push('E-mail inválido!');
       
        const pass = this.body.senha;
        if(pass.length < 3 || pass.length > 15) return this.errors.push('A senha deve ser entre 3 e 15 caracteres')
    };

    async validateCpf(){
        const cpfVal = this.body.cpf;
        const outAsk = cpfVal.replace(/\D/g, '')
        
        const userExist = await prisma.user.findUnique({where: {cpf: outAsk}})
        if(userExist) return this.errors.push('Usuário já existe');
        
        const valid = CPF.validate(outAsk)
        if(!valid) return this.errors.push('CPF Inválido');
    };
    
    async exist(){
        const findMail = await prisma.user.findUnique({where: {email: this.body.email}});
        if(findMail) return this.errors.push('Usuário já existe');
    };

    async changePass(userId){
        const find = await prisma.user.findUnique({where: {id: userId}});
        const password = this.body.senha;
        const compare = await bcrypt.compare(password, find.senha)
        if(compare) return this.errors.push('A senha não pode ser igual a anterior');
        const passHash = await bcrypt.hash(password, 10)
        if(password.length < 3 || password.length > 15) return this.errors.push('A senha deve ser entre 3 e 15 caracteres');
        await prisma.user.update({where: {id: userId}, data:{senha: passHash}})
        return({message: 'Senha alterada com sucesso!', success: true})
    }
};

export default User;