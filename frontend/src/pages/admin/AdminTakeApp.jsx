import { useEffect, useState } from 'react';
import { Store, ShoppingCart, Package, RefreshCw, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { takeappAPI } from '@/lib/api';

export default function AdminTakeApp() {
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [storeRes, ordersRes, inventoryRes, statsRes] = await Promise.all([
        takeappAPI.getStore(),
        takeappAPI.getOrders(),
        takeappAPI.getInventory(),
        takeappAPI.getOrderStats()
      ]);
      setStore(storeRes.data);
      setOrders(ordersRes.data);
      setInventory(inventoryRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching Take.app data:', error);
      toast.error('Failed to fetch Take.app data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncProducts = async () => {
    setIsSyncing(true);
    try {
      const res = await takeappAPI.syncProducts();
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error('Failed to sync products');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ORDER_STATUS_PENDING': { label: 'Pending', variant: 'warning', icon: Clock },
      'ORDER_STATUS_COMPLETED': { label: 'Completed', variant: 'success', icon: CheckCircle },
      'ORDER_STATUS_CANCELLED': { label: 'Cancelled', variant: 'destructive', icon: XCircle },
      'ORDER_STATUS_PROCESSING': { label: 'Processing', variant: 'default', icon: RefreshCw },
    };
    const config = statusMap[status] || { label: status, variant: 'secondary', icon: AlertCircle };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status) => {
    const statusMap = {
      'PAYMENT_STATUS_PAID': { label: 'Paid', className: 'bg-green-500/20 text-green-400' },
      'PAYMENT_STATUS_CONFIRMING': { label: 'Confirming', className: 'bg-yellow-500/20 text-yellow-400' },
      'PAYMENT_STATUS_UNPAID': { label: 'Unpaid', className: 'bg-red-500/20 text-red-400' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-gray-500/20 text-gray-400' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatPrice = (amount) => {
    return `Rs ${(amount / 100).toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout title="Take.app Integration">
      <div className="space-y-6" data-testid="admin-takeapp">
        {/* Store Info & Stats */}
        {store && (
          <div className="bg-gradient-to-r from-gold-500/10 to-transparent border border-gold-500/30 rounded-lg p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-500/20 rounded-lg">
                  <Store className="h-6 w-6 text-gold-500" />
                </div>
                <div>
                  <h2 className="text-white font-heading text-xl font-semibold">{store.name}</h2>
                  <p className="text-white/60 text-sm">Connected to Take.app • @{store.alias}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={fetchData}
                  variant="outline"
                  className="border-white/20"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleSyncProducts}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  disabled={isSyncing}
                >
                  <Package className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Products
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="bg-card border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs uppercase">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total_orders}</p>
            </div>
            <div className="bg-card border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs uppercase">Pending</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.pending_orders}</p>
            </div>
            <div className="bg-card border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs uppercase">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-white">Rs {stats.total_revenue?.toLocaleString()}</p>
            </div>
            <div className="bg-card border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-xs uppercase">Last 24h</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.orders_last_24h}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-t-lg font-heading uppercase text-sm transition-colors ${
              activeTab === 'orders' ? 'bg-gold-500/20 text-gold-500' : 'text-white/60 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-t-lg font-heading uppercase text-sm transition-colors ${
              activeTab === 'inventory' ? 'bg-gold-500/20 text-gold-500' : 'text-white/60 hover:text-white'
            }`}
          >
            Inventory ({inventory.length})
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-white/40">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-white/40">No orders found</div>
            ) : (
              orders.slice(0, 20).map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-white/10 rounded-lg p-4 hover:border-gold-500/30 transition-colors"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-gold-500 font-heading font-semibold">#{order.number}</span>
                        {getStatusBadge(order.status)}
                        {getPaymentBadge(order.paymentStatus)}
                      </div>
                      <div className="text-white font-medium">{order.customerName}</div>
                      <div className="text-white/60 text-sm">{order.customerPhone}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-gold-500 font-bold text-lg">{formatPrice(order.totalAmount)}</div>
                      <div className="text-white/40 text-xs">{formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-white/60 text-sm">
                        {order.items.map((item, idx) => (
                          <span key={idx}>
                            {item.quantity}x {item.name}
                            {idx < order.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-12 text-white/40">Loading inventory...</div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12 text-white/40">No inventory items found</div>
            ) : (
              inventory.map((item) => (
                <div
                  key={item.item_id}
                  className="bg-card border border-white/10 rounded-lg p-4 flex items-center justify-between"
                  data-testid={`inventory-${item.item_id}`}
                >
                  <div>
                    <div className="text-white font-medium">{item.item_name}</div>
                    <div className="text-white/60 text-sm">
                      {formatPrice(item.price)}
                      {item.original_price && item.original_price > item.price && (
                        <span className="text-white/40 line-through ml-2">{formatPrice(item.original_price)}</span>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.quantity > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
