import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Users, 
  Star, 
  Heart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/AdminLayout';
import { analyticsAPI } from '@/lib/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#F5A623', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6'];

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [orderStatus, setOrderStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, topRes, chartRes, statusRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTopProducts(10),
        analyticsAPI.getRevenueChart(chartDays),
        analyticsAPI.getOrderStatus(),
      ]);
      setOverview(overviewRes.data);
      setTopProducts(topRes.data);
      setRevenueChart(chartRes.data);
      setOrderStatus(statusRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [chartDays]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(1)}K`;
    return `Rs ${amount}`;
  };

  const statusPieData = Object.entries(orderStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  if (loading && !overview) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <select
            value={chartDays}
            onChange={(e) => setChartDays(Number(e.target.value))}
            className="bg-zinc-800 border-zinc-700 text-white rounded-md px-3 py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(overview?.today?.revenue || 0)}
            subtitle={`${overview?.today?.orders || 0} orders`}
            icon={DollarSign}
            trend={overview?.today?.revenue > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            title="This Week"
            value={formatCurrency(overview?.week?.revenue || 0)}
            subtitle={`${overview?.week?.orders || 0} orders`}
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="This Month"
            value={formatCurrency(overview?.month?.revenue || 0)}
            subtitle={`${overview?.month?.orders || 0} orders`}
            icon={BarChart3}
            trend="up"
          />
          <StatCard
            title="All Time"
            value={formatCurrency(overview?.all_time?.revenue || 0)}
            subtitle={`${overview?.all_time?.orders || 0} total orders`}
            icon={ShoppingCart}
            trend="neutral"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStatCard
            title="Products"
            value={overview?.counts?.products || 0}
            icon={Package}
          />
          <MiniStatCard
            title="Categories"
            value={overview?.counts?.categories || 0}
            icon={BarChart3}
          />
          <MiniStatCard
            title="Reviews"
            value={overview?.counts?.reviews || 0}
            icon={Star}
          />
          <MiniStatCard
            title="Wishlists"
            value={overview?.counts?.wishlists || 0}
            icon={Heart}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#666" tickFormatter={(val) => `Rs ${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => [`Rs ${value}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#F5A623" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Pie Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-amber-500 font-bold w-6">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-gray-400 text-sm">{product.quantity} sold</p>
                    </div>
                    <span className="text-green-400 font-semibold">
                      Rs {product.revenue?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
            <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStatCard({ title, value, icon: Icon }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Icon className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">{title}</p>
            <p className="text-white font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
