import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      // Authenticate the user using NextAuth.js
      const session = await getSession({ req });

      // If the user is not authenticated, return an unauthorized response
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Extract book information from the request body
      const { title, author, isbn, isAvailable } = req.body;

      // Create a new book record in the database
      const book = await prisma.book.create({
        data: {
          title: title,
          author: author,
          isbn: isbn,
          isAvailable: isAvailable || true, // Default availability to true
        },
      });

      res.status(201).json({ message: 'Book donated successfully', book });
    } catch (error) {
      res.status(500).json({ error: 'Error donating book', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
