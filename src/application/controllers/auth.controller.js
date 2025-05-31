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
        const data = await loginService(req.body);
    
        // Verificamos si tiene _id y generamos token
        if (data[0].email) {

            const token = jwt.sign(
                { email: data.email, id: data._id },
                process.env.JWT_KEY,
                { expiresIn: '1h' }
            );
    
            // Creamos un nuevo objeto con el token agregado
            const responseData = {
                "id": data[0]._id,
                "fullName": data[0].fullName,
                "email": data[0].email,
                "birthDate": data[0].birthDate,
                "isNewUser": data[0].isNewUser,
                "profilePicture": data[0].profilePicture,
                "location": data[0].location,
                access_token: token
            };
    
            return res.status(200).send(responseData);
        }
    
        return res.status(401).send({ message: "Credenciales inválidas" });
    
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }    



}