import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaPlus, FaTrash, FaPrint } from 'react-icons/fa';
import Layout from '../components/Layout';

export default function NewSale() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    status: 'paid',
    pendingAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setIsLoading(false);
    }
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, {
      product: '',
      productName: '',
      quantity: 1,
      pricePerUnit: 0,
      costPerUnit: 0,
      unit: '',
      totalPrice: 0
    }]);
  };

  const removeProduct = (index) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...selectedProducts];
    newProducts[index][field] = value;

    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        newProducts[index] = {
          ...newProducts[index],
          productName: selectedProduct.name,
          pricePerUnit: selectedProduct.price,
          costPerUnit: selectedProduct.costPrice,
          unit: selectedProduct.unit,
          totalPrice: selectedProduct.price * newProducts[index].quantity
        };
      }
    }

    if (field === 'quantity') {
      newProducts[index].totalPrice = newProducts[index].pricePerUnit * value;
    }

    setSelectedProducts(newProducts);
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = 0; // Add tax calculation if needed
    const discount = 0; // Add discount calculation if needed
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      setError('Please add at least one product');
      return;
    }

    const { subtotal, tax, discount, total } = calculateTotals();

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          items: selectedProducts,
          subtotal,
          tax,
          discount,
          totalAmount: total,
          paymentMethod: paymentInfo.method,
          paymentStatus: paymentInfo.status,
          pendingAmount: paymentInfo.status === 'partial' ? paymentInfo.pendingAmount : 0
        }),
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  const { subtotal, tax, discount, total } = calculateTotals();

  return (
    <Layout>
      <Head>
        <title>New Sale - Gumasta Krishi Kendra</title>
      </Head>

      <div className="px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">New Sale</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Products */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <button
                type="button"
                onClick={addProduct}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <FaPlus /> Add Product
              </button>
            </div>

            {selectedProducts.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-4">
                  <select
                    value={item.product}
                    onChange={(e) => updateProduct(index, 'product', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} (₹{product.price}/{product.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full border rounded-lg px-3 py-2"
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={`₹${item.pricePerUnit}`}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={`₹${item.totalPrice}`}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentInfo.method}
                onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Payment Status</label>
              <select
                value={paymentInfo.status}
                onChange={(e) => setPaymentInfo({...paymentInfo, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            {paymentInfo.status === 'partial' && (
              <div>
                <label className="block text-gray-700 mb-2">Pending Amount</label>
                <input
                  type="number"
                  value={paymentInfo.pendingAmount}
                  onChange={(e) => setPaymentInfo({...paymentInfo, pendingAmount: parseFloat(e.target.value) || 0})}
                  className="w-full border rounded-lg px-3 py-2"
                  min="0"
                  max={total}
                  required
                />
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold">₹{tax}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Discount:</span>
              <span className="font-semibold">₹{discount}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <FaPrint /> Create Invoice
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
          }
