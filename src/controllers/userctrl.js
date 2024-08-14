import User from "../data/User.js";
import Bank from "../data/Bank.js";

class Userctrl{

    async singUp(req, res){
        try{
        const newUser = new User(req.body)
        const result = await newUser.register()
        if(newUser.errors.length > 0) return res.json(newUser.errors)
        res.status(200).json(result)
        }catch(e){
        console.log(e)
        }
    };

    async singIn(req, res){
        try{
            const sing = new User(req.body);
            const result = await sing.login();
            if(sing.errors.length > 0) return res.json(sing.errors);
            res.status(200).json(result)
        }catch(e){
            console.log(e)
        }
    };

    async deposito(req, res){
        const place = new Bank(req.body);
        const result = await place.deposit(req.userId)
        if(place.errors.length > 0) return res.json(place.errors)
        res.json(result)
    };

    async consult(req, res){
        const saldo = new Bank();
        const result = await saldo.consult(req.userId);
        if(saldo.errors.length > 0) return res.json(saldo.errors);
        res.json(result)
    };

    async transfer(req, res){
        const pay = new Bank(req.body);
        const result = await pay.transfer(req.userId);
        if(pay.errors.length > 0) return res.json(pay.errors);
        res.json(result)
    }

};

export default new Userctrl();