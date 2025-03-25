import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const NewSale = () => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
    const [paymentInfo, setPaymentInfo] = useState({ method: 'cash', status: 'paid', pendingAmount: 0 });
    const [error, setError] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedProducts.length === 0) {
            setError('Please add at least one product');
            return;
        }

        for (const item of selectedProducts) {
            if (!item.product) {
                setError('All items must have a product selected');
                return;
            }
            if (item.quantity < 1) {
                setError('Quantity must be at least 1 for all items');
                return;
            }
        }

        const saleData = {
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            items: selectedProducts,
            subtotal: calculateSubtotal(),
            discount: 0, // Adjust as needed
            tax: 0, // Adjust as needed
            totalAmount: calculateTotal(),
            paymentMethod: paymentInfo.method,
            paymentStatus: paymentInfo.status,
            pendingAmount: paymentInfo.pendingAmount,
        };

        try {
            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData),
            });

            if (!response.ok) {
                throw new Error('Failed to create sale');
            }

            const sale = await response.json();
            router.push(`/invoice/${sale._id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    const calculateSubtotal = () => {
        return selectedProducts.reduce((total, item) => total + (item.pricePerUnit * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + paymentInfo.tax - paymentInfo.discount;
    };

    return (
        <div>
            <Head>
                <title>New Sale</title>
            </Head>
            <h1>Create New Sale</h1>
            <form onSubmit={handleSubmit}>
                {/* Form fields for customer info, product selection, etc. */}
                <button type="submit">Create Invoice</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default NewSale;
