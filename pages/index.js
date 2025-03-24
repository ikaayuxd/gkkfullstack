import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaBox, FaRupeeSign, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import Layout from '../components/Layout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [salesData, setSalesData] = useState({
    summary: {
      totalSales: 0,
      totalProfit: 0,
      pendingAmount: 0
    },
    recentSales: []
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch sales data
      const salesRes = await fetch('/api/sales?limit=5');
      const salesJson = await salesRes.json();

      // Fetch low stock products
      const productsRes = await fetch('/api/products');
      const products = await productsRes.json();
      const lowStock = products.filter(p => p.stock <= p.minStockAlert);

      setSalesData(salesJson);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard - Gumasta Krishi Kendra</title>
      </Head>

      <div className="px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Dashboard Overview
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={`₹${salesData.summary.totalSales.toLocaleString()}`}
            icon={FaRupeeSign}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Profit"
            value={`₹${salesData.summary.totalProfit.toLocaleString()}`}
            icon={FaChartLine}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Amount"
            value={`₹${salesData.summary.pendingAmount.toLocaleString()}`}
            icon={FaShoppingCart}
            color="bg-yellow-500"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockProducts.length}
            icon={FaBox}
            color="bg-red-500"
          />
        </div>

        {/* Recent Sales & Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Invoice</th>
                    <th className="text-left py-2">Customer</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.sales?.map((sale) => (
                    <tr key={sale._id} className="border-b">
                      <td className="py-2">{sale.invoiceNumber}</td>
                      <td className="py-2">{sale.customerName}</td>
                      <td className="py-2 text-right">₹{sale.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-center py-2">Current Stock</th>
                    <th className="text-right py-2">Alert Level</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className="py-2">{product.name}</td>
                      <td className="py-2 text-center">{product.stock} {product.unit}</td>
                      <td className="py-2 text-right">{product.minStockAlert} {product.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
          }
