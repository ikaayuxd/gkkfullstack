import { connectToDatabase } from '../../lib/mongodb';
import Sale from '../../models/Sale';
import Product from '../../models/Product';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  switch (req.method) {
    case 'GET':
      try {
        const { 
          startDate, 
          endDate, 
          customerName,
          paymentStatus,
          limit = 10,
          page = 1
        } = req.query;

        // Build query
        let query = {};
        if (startDate && endDate) {
          query.saleDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        if (customerName) {
          query.customerName = new RegExp(customerName, 'i');
        }
        if (paymentStatus) {
          query.paymentStatus = paymentStatus;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const sales = await Sale.find(query)
          .sort({ saleDate: -1 })
          .skip(skip)
          .limit(parseInt(limit));

        const total = await Sale.countDocuments(query);

        // Calculate summary statistics
        const summary = await Sale.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$totalAmount' },
              totalProfit: { $sum: '$profit' },
              averageSale: { $avg: '$totalAmount' },
              pendingAmount: { $sum: '$pendingAmount' }
            }
          }
        ]);

        res.status(200).json({
          sales,
          total,
          pages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          summary: summary[0] || {
            totalSales: 0,
            totalProfit: 0,
            averageSale: 0,
            pendingAmount: 0
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales' });
      }
      break;

    case 'POST':
      try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const saleData = req.body;
          
          // Update product stock and validate quantities
          for (const item of saleData.items) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
              throw new Error(`Product ${item.productName} not found`);
            }
            if (product.stock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.productName}`);
            }
            
            // Update stock
            await Product.findByIdAndUpdate(
              item.product,
              { 
                $inc: { stock: -item.quantity },
                updatedAt: Date.now()
              },
              { session }
            );
          }

          // Create sale record
          const sale = new Sale(saleData);
          await sale.save({ session });

          await session.commitTransaction();
          res.status(201).json(sale);
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const updateData = req.body;

        // If updating payment status or pending amount
        if (updateData.paymentStatus || updateData.pendingAmount !== undefined) {
          const sale = await Sale.findByIdAndUpdate(
            id,
            { 
              ...updateData,
              updatedAt: Date.now()
            },
            { new: true, runValidators: true }
          );

          if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
          }

          return res.status(200).json(sale);
        }

        res.status(400).json({ error: 'Invalid update operation' });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const sale = await Sale.findById(id);
        
        if (!sale) {
          return res.status(404).json({ error: 'Sale not found' });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Restore product stock
          for (const item of sale.items) {
            await Product.findByIdAndUpdate(
              item.product,
              { 
                $inc: { stock: item.quantity },
                updatedAt: Date.now()
              },
              { session }
            );
          }

          // Delete sale
          await Sale.findByIdAndDelete(id).session(session);

          await session.commitTransaction();
          res.status(200).json({ message: 'Sale deleted successfully' });
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
          }
