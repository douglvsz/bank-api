import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class Bank{
    constructor(body){
        this.body = body;
        this.errors = [];
    };

    async deposit(userId){
        const find = await prisma.user.findUnique({where: {id: userId}});
        
        const saldo = parseFloat(this.body.valor)
        if(isNaN(saldo) || saldo <= 0) return this.errors.push('Insira um valor para depósito');

        const novoSaldo = find.saldo + saldo;

        const update = await prisma.user.update({where: {id: userId}, data: {saldo: novoSaldo}})

        return ({message: 'Deposito realizado', saldoAtual: update.saldo.toFixed(2)})
    };

    async transfer(userId){
        const find = await prisma.user.findUnique({where: {id: userId}});
        const {valor, emailReceiver} = this.body;
        const findReceiver = await prisma.user.findUnique({where: {email: emailReceiver}});
        
        if(!findReceiver) return this.errors.push('Usuário não encontrado');
        if(findReceiver.email === find.email ) return this.errors.push('Não é possível transferir para sua própria conta');
        
        const pay = parseFloat(valor);
        if(isNaN(pay) || pay <= 0) return this.errors.push('Insira um valor');
        if(find.saldo < pay) return this.errors.push('Saldo insuficiente');

        const newSaldoSend = find.saldo - pay
        const newSaldoReceiver = findReceiver.saldo + pay

        await prisma.user.update({where: {id: userId}, data:{saldo: newSaldoSend}});
        await prisma.user.update({where: {id: findReceiver.id}, data:{saldo: newSaldoReceiver}});
        
        await prisma.transfer.create({data: {valor: pay, enviouId: find.id, recebeuId: findReceiver.id}});

        return ({message: `Transferência realizada no valor de ${pay.toFixed(2)}, para ${findReceiver.nome}`, success: true});
    };

    async consult(userId){
        const find = await prisma.user.findUnique({where: {id: userId}, include: {transferEnviada: {include: {enviou: true, recebeu:true}}, transferRecebida:{include: {enviou: true, recebeu: true}}}});
        
        const paySend = find.transferEnviada;
        const PayReceiver = find.transferRecebida
        
        const enviadas = paySend.map(el => ({valor: el.valor, recebeu: el.recebeu.email}));
        const recebidas = PayReceiver.map(el => ({valor: el.valor, enviou: el.enviou.email}));
        
        const saldo = find.saldo.toFixed(2)
        return({message: `Olá, ${find.nome}`, saldo: saldo, success: true, transferência: {enviadas, recebidas}})
    };

};

export default Bank;
