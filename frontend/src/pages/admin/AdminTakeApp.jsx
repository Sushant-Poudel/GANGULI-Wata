import { useEffect, useState } from 'react';
import { Store, ShoppingCart, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, FileText } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { takeappAPI } from '@/lib/api';

export default function AdminTakeApp() {
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [storeRes, ordersRes] = await Promise.all([
        takeappAPI.getStore(),
        takeappAPI.getOrders()
      ]);
      setStore(storeRes.data);
      setOrders(ordersRes.data);
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

  const getStatusBadge = (status) => {
    const statusMap = {
      'ORDER_STATUS_PENDING': { label: 'Pending', variant: 'warning', icon: Clock },
      'ORDER_STATUS_COMPLETED': { label: 'Completed', variant: 'success', icon: CheckCircle },
      'ORDER_STATUS_CANCELLED': { label: 'Cancelled', variant: 'destructive', icon: XCircle },
      'ORDER_STATUS_PROCESSING': { label: 'Processing', variant: 'default', icon: RefreshCw },
      'ORDER_STATUS_CONFIRMED': { label: 'Confirmed', variant: 'success', icon: CheckCircle },
      'ORDER_STATUS_FULFILLED': { label: 'Fulfilled', variant: 'success', icon: CheckCircle },
    };
    const config = statusMap[status] || { label: status?.replace('ORDER_STATUS_', '') || 'Unknown', variant: 'secondary', icon: AlertCircle };
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
      'PAYMENT_STATUS_PENDING': { label: 'Pending', className: 'bg-orange-500/20 text-orange-400' },
      'PAYMENT_STATUS_PARTIAL': { label: 'Partial', className: 'bg-blue-500/20 text-blue-400' },
      'PAYMENT_STATUS_REFUNDED': { label: 'Refunded', className: 'bg-purple-500/20 text-purple-400' },
    };
    const config = statusMap[status] || { label: status?.replace('PAYMENT_STATUS_', '') || 'Unknown', className: 'bg-gray-500/20 text-gray-400' };
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

  const getInvoiceUrl = (orderId) => {
    return `https://take.app/orders/${orderId}`;
  };

  return (
    <AdminLayout title="Take.app Orders">
      <div className="space-y-6" data-testid="admin-takeapp">
        {/* Store Info */}
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
              <Button
                onClick={fetchData}
                variant="outline"
                className="border-white/20"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Orders Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-heading text-lg uppercase flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gold-500" />
            Orders ({orders.length})
          </h3>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-white/40">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-white/40">No orders found</div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-white/10 rounded-lg overflow-hidden hover:border-gold-500/30 transition-colors"
                data-testid={`order-${order.id}`}
              >
                {/* Order Header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
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
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-white/10 p-4 bg-black/30 space-y-4 animate-slide-down">
                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-white/60 text-xs uppercase mb-2">Items</p>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-white">{item.quantity}x {item.name}</span>
                              <span className="text-gold-500">{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/60 text-xs uppercase mb-1">Customer</p>
                        <p className="text-white">{order.customerName}</p>
                        <p className="text-white/60">{order.customerPhone}</p>
                        {order.customerEmail && (
                          <p className="text-white/60">{order.customerEmail}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase mb-1">Order ID</p>
                        <p className="text-white font-mono text-xs break-all">{order.id}</p>
                      </div>
                    </div>

                    {/* Remark */}
                    {order.remark && (
                      <div>
                        <p className="text-white/60 text-xs uppercase mb-1">Remark</p>
                        <p className="text-white/80 text-sm">{order.remark}</p>
                      </div>
                    )}

                    {/* Invoice Link */}
                    <div className="pt-2 border-t border-white/10">
                      <a
                        href={getInvoiceUrl(order.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        View Invoice on Take.app
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
