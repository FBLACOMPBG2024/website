import TransactionSchema from '@/schemas/transactionSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import client from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Get user from request cookie
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token || '';

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Get the user from the database
        const user = await client
            .db()
            .collection('users')
            .findOne({ _id: new ObjectId(token) });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const transactions = req.body;

        if (!Array.isArray(transactions)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const formattedTransactions = transactions.map(transaction => {
            const parsedTransaction = TransactionSchema.parse(transaction);
            return {
                _id: new ObjectId(),
                value: parseFloat(parsedTransaction.value) || 0,
                tags: parsedTransaction.tags,
                name: parsedTransaction.name,
                description: parsedTransaction.description,
                userId: user._id,
                date: new Date(parsedTransaction.date),
            };
        });

        const result = await client.db().collection('transactions').insertMany(formattedTransactions);

        // Update user transaction list
        const transactionIds = formattedTransactions.map(transaction => transaction._id);
        await client
            .db()
            .collection('users')
            .updateOne(
                { _id: user._id },
                { $addToSet: { transactions: { $each: transactionIds } } }
            );

        const userTransactions = await client
            .db()
            .collection('transactions')
            .find({ userId: user._id })
            .toArray();

        // Calculate the balance
        const balance = userTransactions.reduce(
            (acc, transaction) => acc + transaction.value,
            0
        );

        // Update user balance
        await client
            .db()
            .collection('users')
            .updateOne({ _id: user._id }, { $set: { balance: balance } });

        return res.status(201).json({ message: 'Transactions added successfully', insertedCount: result.insertedCount });
    } catch (error: any) {
        // Handle validation or other errors
        if (error.name === 'ZodError') {
            return res.status(400).json({
                message: 'Invalid data',
                errors: error.errors, // Send the validation errors
            });
        }

        console.error('Failed to add transactions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}