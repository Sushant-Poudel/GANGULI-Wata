import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { paymentMethodsAPI } from '@/lib/api';

const emptyMethod = {
  name: '',
  image_url: '',
  is_active: true,
  sort_order: 0
};

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState(emptyMethod);

  const fetchMethods = async () => {
    try {
      const res = await paymentMethodsAPI.getAllAdmin();
      setMethods(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleOpenDialog = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData(method);
    } else {
      setEditingMethod(null);
      setFormData(emptyMethod);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      if (editingMethod) {
        await paymentMethodsAPI.update(editingMethod.id, formData);
        toast.success('Payment method updated!');
      } else {
        await paymentMethodsAPI.create(formData);
        toast.success('Payment method created!');
      }
      setIsDialogOpen(false);
      fetchMethods();
    } catch (error) {
      toast.error('Error saving payment method');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this payment method?')) return;
    
    try {
      await paymentMethodsAPI.delete(id);
      toast.success('Payment method deleted!');
      fetchMethods();
    } catch (error) {
      toast.error('Error deleting payment method');
    }
  };

  return (
    <AdminLayout title="Payment Methods">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-sm">Manage payment options shown on the homepage.</p>
          <Button onClick={() => handleOpenDialog()} className="bg-gold-500 hover:bg-gold-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-white/40">Loading...</div>
          ) : methods.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-card border border-white/10 rounded-lg">
              <CreditCard className="h-12 w-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/40">No payment methods yet</p>
              <p className="text-white/30 text-sm mt-1">Add payment options to show on homepage</p>
            </div>
          ) : (
            methods.map((method) => (
              <div 
                key={method.id} 
                className={`bg-card border rounded-lg p-4 ${method.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium text-sm truncate">{method.name}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(method)} className="text-white/60 hover:text-gold-500 h-7 w-7 p-0">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(method.id)} className="text-white/60 hover:text-red-500 h-7 w-7 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 flex items-center justify-center h-16">
                  <img 
                    src={method.image_url} 
                    alt={method.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
                {!method.is_active && (
                  <p className="text-yellow-400 text-xs mt-2 text-center">Inactive</p>
                )}
              </div>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-black border-white/20"
                  placeholder="e.g. eSewa, Khalti, IME Pay"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL *</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="bg-black border-white/20"
                  placeholder="https://example.com/logo.png"
                  required
                />
                {formData.image_url && (
                  <div className="mt-2 bg-black/30 rounded-lg p-3 flex items-center justify-center h-20">
                    <img 
                      src={formData.image_url} 
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                  className="bg-black border-white/20"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black">
                  {editingMethod ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
