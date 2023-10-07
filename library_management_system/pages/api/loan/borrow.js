import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async (req, res) => {
    if (req.method === 'POST') {
        try{
            res.status(200).json({message: 'Book borrowed sucessfully'});
        } catch(error) {
            res.ststus(500).json({error: 'Error borrowing book'});
        }
    }
    else{
        res.status(405).json({error: 'Method not allowed'});
    }
};