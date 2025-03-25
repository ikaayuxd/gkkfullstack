import Product from '../../src/models/Product';
import Sale from '../../src/models/Sale';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (!mongoose.connections[0].readyState) {
        await mongoose.connect(process.env.MONGODB_URI);
    }

    switch (req.method) {
        case 'POST':
            try {
                const session = await mongoose.startSession();
                session.startTransaction();

                const saleData = req.body;

                for (const item of saleData.items) {
                    const product = await Product.findById(item.product).session(session);
                    if (!product) {
                        throw new Error(`Product ${item.productName} not found`);
                    }
                    if (product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${item.productName}`);
                    }

                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: -item.quantity } },
                        { session }
                    );
                }

                const sale = new Sale(saleData);
                await sale.save({ session });

                await session.commitTransaction();
                res.status(201).json(sale);
            } catch (error) {
                await session.abortTransaction();
                res.status(400).json({ error: error.message });
            } finally {
                session.endSession();
            }
            break;

        default:
            res.status(405).json({ error: 'Method not allowed' });
    }
}
