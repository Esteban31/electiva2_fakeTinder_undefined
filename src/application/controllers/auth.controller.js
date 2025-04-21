import jwt from "jsonwebtoken";

import { loginService } from "../../domain/services/users/user.service.js";


export const generateToken = (req, res) =>{
    const { user,apikey } = req.body;
    
    if (!user==="admin" || !apikey===process.env.JWT_KEY) {
        return res.status(401).json({ message: "Invalid credentials" });
    }else{
        const payload = {
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        };
        
        const token = jwt.sign(payload, process.env.JWT_KEY);
        res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN });
    }
      
}


export const login = async(req, res) =>{


    try {
        const data = await loginService(req.body)

        return res.status(200).send(data);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }



}