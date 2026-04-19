"use client";

import { useEffect, useState} from "react";
import {
  ShoppingCart,
  Package,
  Users,
  Store,
  Target, // Category
  Star, // Featured
  Award, // Brand of Day
  Truck, // Delivery Boy
  Images, // Slider
  Monitor, // Banner
  Ticket, // Promo
  LayoutGrid, // Showcase
  X,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/consts";
import { axiosClient } from "@/lib/api";



const COLORS = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ef4444", "#14b8a6", "#ec4899", "#6366f1"];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Stats Configuration
  const getStatsConfig = (counts: any) => [
    { title: "Total Orders", value: counts?.orders || 0, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100", link: ROUTES.ADMIN.ORDER },
    { title: "Total Products", value: counts?.products || 0, icon: Package, color: "text-orange-600", bg: "bg-orange-100", link: ROUTES.ADMIN.PRODUCT },
    { title: "Total Users", value: counts?.users || 0, icon: Users, color: "text-cyan-600", bg: "bg-cyan-100", link: ROUTES.ADMIN.USERS },
    { title: "Categories", value: counts?.categories || 0, icon: Target, color: "text-green-600", bg: "bg-green-100", link: ROUTES.ADMIN.CATEGORY.ROOT },
    { title: "Featured Sections", value: counts?.featured || 0, icon: Star, color: "text-yellow-600", bg: "bg-yellow-100", link: ROUTES.ADMIN.FEATURED.ROOT },
    { title: "Brand of the Day", value: counts?.brandOfTheDay || 0, icon: Award, color: "text-purple-600", bg: "bg-purple-100", link: ROUTES.ADMIN.BRAND_OF_THE_DAY.ROOT },
    { title: "Stores", value: counts?.shopByStore || 0, icon: Store, color: "text-indigo-600", bg: "bg-indigo-100", link: ROUTES.ADMIN.SHOP_BY_STORE.ROOT },
    { title: "Delivery Boys", value: counts?.deliveryBoys || 0, icon: Truck, color: "text-red-600", bg: "bg-red-100", link: ROUTES.ADMIN.DELIVERY_BOY.ROOT },
    { title: "Sliders", value: counts?.sliders || 0, icon: Images, color: "text-teal-600", bg: "bg-teal-100", link: ROUTES.ADMIN.SLIDER.ROOT },
    { title: "Banners", value: counts?.banners || 0, icon: Monitor, color: "text-pink-600", bg: "bg-pink-100", link: ROUTES.ADMIN.BANNER.ROOT },
    { title: "Promocodes", value: counts?.promocodes || 0, icon: Ticket, color: "text-lime-600", bg: "bg-lime-100", link: ROUTES.ADMIN.PROMO_CODE.ROOT },
    { title: "Showcase Products", value: counts?.showcaseProducts || 0, icon: LayoutGrid, color: "text-indigo-500", bg: "bg-indigo-50", link: ROUTES.ADMIN.SHOWCASE_PRODUCTS.ROOT },
  ];



  // Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await axiosClient.get("/api/admin/dashboard");
        if (res?.success) {
          setDashboardData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );

  const stats = getStatsConfig(dashboardData?.counts);
  const categoryData = dashboardData?.charts?.categoryWiseProduct || [];
  const monthlySalesData = dashboardData?.charts?.monthlySales || [];
  const topProducts = dashboardData?.charts?.topProducts || [];
  const orderStatusData = dashboardData?.charts?.orderStatus || [];
  const recentOrders = dashboardData?.charts?.recentOrders || [];

  return (
    <>
      {/* New Order Modal */}


      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-semibold text-blue-900 mb-6">Admin Dashboard</h1>

        {/* ---- Stat Cards ---- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <Card
              key={i}
              onClick={() => router.push(stat.link)}
              className="shadow-sm hover:shadow-md transition-all duration-200 border-none bg-white rounded-2xl cursor-pointer hover:scale-[1.02]"
            >
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <div className={`p-4 rounded-full ${stat.bg} mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ---- Charts Section ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Category-wise Product (Pie) */}
          <Card className="shadow-sm border-none bg-white rounded-2xl h-[450px]">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-lg font-bold text-blue-900 mb-4">Category Distribution</h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={5}
                      label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Sales (Bar) */}
          <Card className="shadow-sm border-none bg-white rounded-2xl h-[450px]">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-lg font-bold text-blue-900 mb-2">Monthly Sales Overview</h2>
              <p className="text-sm text-gray-500 mb-6">Total Sales & Orders per Day (Current Month)</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#10b981' }} />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: any, name: string) => [
                        name === 'sales' ? `₹${value.toLocaleString('en-IN')}` : value,
                        name === 'sales' ? 'Sales' : 'Orders'
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ---- Extra Analysis: Top Products & Order Status ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* Top Selling Products */}
          <Card className="shadow-sm border-none bg-white rounded-2xl h-[400px] overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-lg font-bold text-blue-900 mb-4">Top Selling Products</h2>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-2">Product</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-2">Sold</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProducts.length > 0 ? (
                      topProducts.map((product: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-2 text-sm text-gray-700 font-medium truncate max-w-[150px]" title={product._id}>{product._id}</td>
                          <td className="py-3 px-2 text-right text-sm text-gray-600">{product.count}</td>
                          <td className="py-3 px-2 text-right text-sm font-bold text-green-600">₹{product.revenue.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="text-center py-10 text-gray-400">No sales data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card className="shadow-sm border-none bg-white rounded-2xl h-[400px]">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-lg font-bold text-blue-900 mb-4">Order Status Distribution</h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={2}
                      label={(props: any) => `${props.name} (${props.value})`}
                    >
                      {orderStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] || '#CCCCCC'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ---- Recent Orders ---- */}
        <div className="mt-6">
          <Card className="shadow-sm border-none bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-blue-900">Recent Orders</h2>
                <button onClick={() => router.push('/orders')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Order ID</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Customer</th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Amount</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order: any) => (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">#{order.orderNumber}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            <p className="font-medium">{order.userId?.name || "Guest"}</p>
                            <p className="text-xs text-gray-500">{order.userId?.phone || ""}</p>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-bold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right text-sm text-gray-500 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            <br />
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">No recent orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}