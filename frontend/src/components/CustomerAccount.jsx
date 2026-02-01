import { useState, useEffect, createContext, useContext } from 'react';
import { User, LogOut, Package, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import api from '@/lib/api';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('gsn_customer_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken) => {
    try {
      const res = await api.get('/customers/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setCustomer(res.data);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('gsn_customer_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone, otp = null) => {
    try {
      const res = await api.post('/customers/login', { phone, otp });
      
      if (!otp) {
        // OTP sent
        return { success: true, otpSent: true, devOtp: res.data.dev_otp };
      }
      
      // Login successful
      const newToken = res.data.token;
      localStorage.setItem('gsn_customer_token', newToken);
      setToken(newToken);
      setCustomer(res.data.customer);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      return { success: false, error: error.response?.data?.detail };
    }
  };

  const logout = () => {
    localStorage.removeItem('gsn_customer_token');
    setToken(null);
    setCustomer(null);
    toast.success('Logged out');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/customers/me', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomer(res.data);
      toast.success('Profile updated');
      return true;
    } catch (error) {
      toast.error('Failed to update profile');
      return false;
    }
  };

  return (
    <CustomerContext.Provider value={{
      customer,
      isLoading,
      isLoggedIn: !!customer,
      token,
      login,
      logout,
      updateProfile,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

// Login Dialog Component
export function CustomerLoginDialog({ open, onOpenChange, onSuccess }) {
  const { login } = useCustomer();
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    setIsLoading(true);
    const result = await login(phone);
    setIsLoading(false);
    
    if (result.success && result.otpSent) {
      setStep('otp');
      setDevOtp(result.devOtp); // For development
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    
    setIsLoading(true);
    const result = await login(phone, otp);
    setIsLoading(false);
    
    if (result.success) {
      onOpenChange(false);
      setStep('phone');
      setPhone('');
      setOtp('');
      setDevOtp(null);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === 'phone' ? 'Login / Register' : 'Enter OTP'}
          </DialogTitle>
        </DialogHeader>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <Label className="text-gray-400">Phone Number</Label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 bg-zinc-800 border border-r-0 border-zinc-700 rounded-l-md text-gray-400 text-sm">
                  +977
                </span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98XXXXXXXX"
                  className="bg-zinc-800 border-zinc-700 rounded-l-none"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
              Send OTP
            </Button>
            <p className="text-gray-500 text-xs text-center">
              We'll send a verification code to your phone
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <Label className="text-gray-400">Enter 6-digit OTP</Label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="bg-zinc-800 border-zinc-700 mt-1 text-center text-2xl tracking-widest"
                maxLength={6}
                required
              />
              {devOtp && (
                <p className="text-amber-500 text-xs mt-2 text-center">
                  Dev mode OTP: <span className="font-mono">{devOtp}</span>
                </p>
              )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verify & Login
            </Button>
            <button type="button" onClick={() => setStep('phone')} className="w-full text-gray-400 text-sm hover:text-white">
              ← Change phone number
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Account Sidebar Component
export function CustomerAccountSidebar() {
  const { customer, isLoggedIn, logout } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const fetchOrders = async () => {
    if (!isLoggedIn) return;
    setIsLoadingOrders(true);
    try {
      const token = localStorage.getItem('gsn_customer_token');
      const res = await api.get('/customers/me/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data || []);
    } catch (error) {
      console.error('Failed to fetch orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLoginOpen(true)}
          className="text-white hover:text-amber-500"
          data-testid="account-trigger"
        >
          <User className="w-5 h-5" />
        </Button>
        <CustomerLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  return (
    <Sheet onOpenChange={(open) => open && fetchOrders()}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:text-amber-500"
          data-testid="account-trigger"
        >
          <User className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-white w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            My Account
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Info */}
          <div className="p-4 bg-zinc-800 rounded-lg">
            <p className="text-white font-medium">{customer.name || 'Customer'}</p>
            <p className="text-gray-400 text-sm">{customer.phone}</p>
            {customer.email && <p className="text-gray-400 text-sm">{customer.email}</p>}
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <span className="text-gray-500">Orders</span>
                <p className="text-amber-500 font-semibold">{customer.total_orders || 0}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Spent</span>
                <p className="text-amber-500 font-semibold">Rs {customer.total_spent?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div>
            <h3 className="text-white font-medium flex items-center gap-2 mb-3">
              <Package className="w-4 h-4" /> My Orders
            </h3>
            
            {isLoadingOrders ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="p-3 bg-zinc-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm font-medium">{order.items_text || order.items?.map(i => i.name).join(', ')}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-500 font-semibold text-sm">Rs {order.total_amount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <Button onClick={logout} variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CustomerProvider;
