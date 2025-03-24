import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaPrint } from 'react-icons/fa';
import Layout from '../../components/Layout';
import html2canvas from 'html2canvas';

export default function Invoice() {
  const router = useRouter();
  const { id } = router.query;
  const [sale, setSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const invoiceRef = useRef();

  useState(() => {
    if (id) {
      fetchSale();
    }
  }, [id]);

  const fetchSale = async () => {
    try {
      const res = await fetch(`/api/sales/${id}`);
      if (!res.ok) throw new Error('Sale not found');
      const data = await res.json();
      setSale(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    const canvas = await html2canvas(invoiceRef.current);
    const dataUrl = canvas.toDataURL();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${sale?.invoiceNumber}</title>
        </head>
        <body style="margin:0;padding:0;">
          <img src="${dataUrl}" style="width:100%;" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Invoice {sale?.invoiceNumber} - Gumasta Krishi Kendra</title>
      </Head>

      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <FaPrint /> Print Invoice
          </button>
        </div>

        <div ref={invoiceRef} className="bg-white rounded-lg shadow-lg p-8">
          {/* Invoice Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">Gumasta Krishi Kendra</h2>
            <p className="text-gray-600">Agricultural Products Store</p>
            <p className="text-gray-600">Contact: +91-1234567890</p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-gray-600 mb-2">Bill To:</h3>
              <p className="font-medium">{sale?.customerName}</p>
              <p className="text-gray-600">{sale?.customerPhone}</p>
            </div>
            <div className="text-right">
              <h3 className="text-gray-600 mb-2">Invoice Details:</h3>
              <p className="font-medium">Invoice #: {sale?.invoiceNumber}</p>
              <p className="text-gray-600">
                Date: {new Date(sale?.saleDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Quantity</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale?.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.productName}</td>
                  <td className="py-2 text-center">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-2 text-right">
                    ₹{item.pricePerUnit}/{item.unit}
                  </td>
                  <td className="py-2 text-right">
                    ₹{item.totalPrice.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span>₹{sale?.subtotal.toLocaleString()}</span>
            </div>
            {sale?.tax > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                <span>₹{sale?.tax.toLocaleString()}</span>
              </div>
            )}
            {sale?.discount > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Discount:</span>
                <span>₹{sale?.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold mt-4">
              <span>Total:</span>
              <span>₹{sale?.totalAmount.toLocaleString()}</span>
            </div>
            {sale?.paymentStatus !== 'paid' && (
              <div className="flex justify-between text-red-600 mt-2">
                <span>Pending Amount:</span>
                <span>₹{sale?.pendingAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t text-center text-gray-600">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
              }
