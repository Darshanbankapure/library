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

      // Extract the scanned book identifier from the request body
      const { scannedIdentifier } = req.body;

      // Use the identifier to look up the book
      const book = await prisma.book.findUnique({
        where: { identifier: scannedIdentifier },
      });

      // Verify if the book is available for borrowing
      if (!book || !book.isAvailable) {
        return res.status(400).json({ error: 'Book is unavailable or does not exist' });
      }

      // Calculate the due date for the loan (e.g., 14 days from the current date)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Create a new loan record in the database
      const loan = await prisma.loan.create({
        data: {
          userId: session.user.id,
          bookId: book.id,
          dueDate: dueDate,
          returned: false,
        },
      });

      // Update the book's availability status to false (borrowed)
      await prisma.book.update({
        where: { id: book.id },
        data: { isAvailable: false },
      });

      // Emit a real-time update to notify the kiosk and the user's phone

      res.status(200).json({ message: 'Book borrowed successfully', loan });
    } catch (error) {
      res.status(500).json({ error: 'Error borrowing book', message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
