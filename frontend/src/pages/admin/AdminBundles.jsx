import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Package, Percent } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { bundlesAPI, productsAPI } from '@/lib/api';

const emptyBundle = {
  name: '',
  description: '',
  image_url: '',
  products: [],
  original_price: '',
  bundle_price: '',
  is_active: true,
  sort_order: 0,
};

export default function AdminBundles() {
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState(emptyBundle);
  const [selectedProductId, setSelectedProductId] = useState('');

  const fetchData = async () => {
    try {
      const [bundlesRes, productsRes] = await Promise.all([
        bundlesAPI.getAllAdmin(),
        productsAPI.getAll(null, false),
      ]);
      setBundles(bundlesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (bundle = null) => {
    if (bundle) {
      setEditingBundle(bundle);
      setFormData({
        name: bundle.name,
        description: bundle.description || '',
        image_url: bundle.image_url || '',
        products: bundle.products || [],
        original_price: bundle.original_price?.toString() || '',
        bundle_price: bundle.bundle_price?.toString() || '',
        is_active: bundle.is_active,
        sort_order: bundle.sort_order || 0,
      });
    } else {
      setEditingBundle(null);
      setFormData(emptyBundle);
    }
    setSelectedProductId('');
    setIsDialogOpen(true);
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    
    // Check if product is already in the bundle
    if (formData.products.some(p => p.product_id === selectedProductId)) {
      toast.error('Product already in bundle');
      return;
    }
    
    setFormData({
      ...formData,
      products: [...formData.products, { product_id: selectedProductId }],
    });
    setSelectedProductId('');
    
    // Auto-calculate original price
    const product = products.find(p => p.id === selectedProductId);
    if (product && product.variations?.length > 0) {
      const minPrice = Math.min(...product.variations.map(v => v.price));
      const newOriginalPrice = parseFloat(formData.original_price || 0) + minPrice;
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { product_id: selectedProductId }],
        original_price: newOriginalPrice.toString(),
      }));
    }
  };

  const handleRemoveProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    let newOriginalPrice = parseFloat(formData.original_price || 0);
    
    if (product && product.variations?.length > 0) {
      const minPrice = Math.min(...product.variations.map(v => v.price));
      newOriginalPrice = Math.max(0, newOriginalPrice - minPrice);
    }
    
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.product_id !== productId),
      original_price: newOriginalPrice.toString(),
    });
  };

  const getProductName = (productId) => {
    return products.find(p => p.id === productId)?.name || productId;
  };

  const calculateDiscount = () => {
    const original = parseFloat(formData.original_price) || 0;
    const bundle = parseFloat(formData.bundle_price) || 0;
    if (original > 0 && bundle > 0 && bundle < original) {
      return Math.round(((original - bundle) / original) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Bundle name is required');
      return;
    }
    if (formData.products.length < 2) {
      toast.error('Add at least 2 products to the bundle');
      return;
    }
    if (!formData.original_price || !formData.bundle_price) {
      toast.error('Both prices are required');
      return;
    }

    try {
      const payload = {
        ...formData,
        original_price: parseFloat(formData.original_price),
        bundle_price: parseFloat(formData.bundle_price),
      };

      if (editingBundle) {
        await bundlesAPI.update(editingBundle.id, payload);
        toast.success('Bundle updated!');
      } else {
        await bundlesAPI.create(payload);
        toast.success('Bundle created!');
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error saving bundle');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) return;
    try {
      await bundlesAPI.delete(id);
      toast.success('Bundle deleted!');
      fetchData();
    } catch (error) {
      toast.error('Error deleting bundle');
    }
  };

  return (
    <AdminLayout title="Bundle Deals">
      <div className="space-y-4 lg:space-y-6" data-testid="admin-bundles">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-white/60 text-sm lg:text-base">Create combo deals to increase sales.</p>
          <Button onClick={() => handleOpenDialog()} className="bg-gold-500 hover:bg-gold-600 text-black w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />Add Bundle
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-white/40">Loading...</div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-12 bg-card border border-white/10 rounded-lg">
              <Package className="h-12 w-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/40">No bundles yet. Create your first combo deal!</p>
            </div>
          ) : (
            bundles.map((bundle) => (
              <div key={bundle.id} className="bg-card border border-white/10 rounded-lg p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-black/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {bundle.image_url ? (
                    <img src={bundle.image_url} alt={bundle.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="h-8 w-8 text-gold-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{bundle.name}</h3>
                    {bundle.discount_percentage > 0 && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                        {bundle.discount_percentage}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="text-white/40">{bundle.products?.length || 0} products</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/40 line-through">Rs {bundle.original_price}</span>
                    <span className="text-gold-500 font-semibold">Rs {bundle.bundle_price}</span>
                    {bundle.is_active ? (
                      <span className="text-green-400 text-xs">Active</span>
                    ) : (
                      <span className="text-yellow-400 text-xs">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(bundle)} className="text-white/60 hover:text-gold-500 p-2">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(bundle.id)} className="text-white/60 hover:text-red-500 p-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">
                {editingBundle ? 'Edit Bundle' : 'Create Bundle'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Bundle Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black border-white/20"
                  placeholder="e.g. Streaming Combo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-black border-white/20 min-h-[80px]"
                  placeholder="Bundle description..."
                />
              </div>

              <div className="space-y-2">
                <Label>Bundle Image URL (optional)</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-black border-white/20"
                  placeholder="https://..."
                />
              </div>

              {/* Products Selection */}
              <div className="space-y-3">
                <Label>Products in Bundle *</Label>
                
                {formData.products.length > 0 && (
                  <div className="space-y-2">
                    {formData.products.map((p) => (
                      <div key={p.product_id} className="flex items-center gap-2 bg-black/50 p-2 rounded-lg">
                        <span className="flex-1 text-sm text-white truncate">{getProductName(p.product_id)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(p.product_id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="bg-black border-white/20 flex-1">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter(p => !formData.products.some(bp => bp.product_id === p.id))
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddProduct} variant="outline" className="border-gold-500 text-gold-500">
                    Add
                  </Button>
                </div>
                <p className="text-white/40 text-xs">Add at least 2 products to create a bundle</p>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Original Price (Rs) *</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="bg-black border-white/20"
                    placeholder="Total if bought separately"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bundle Price (Rs) *</Label>
                  <Input
                    type="number"
                    value={formData.bundle_price}
                    onChange={(e) => setFormData({ ...formData, bundle_price: e.target.value })}
                    className="bg-black border-white/20"
                    placeholder="Discounted price"
                    required
                  />
                </div>
              </div>

              {calculateDiscount() > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                  <Percent className="h-4 w-4 text-green-500" />
                  <span className="text-green-400 text-sm">
                    Customers save {calculateDiscount()}% with this bundle!
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label className="text-sm">Active</Label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black">
                  {editingBundle ? 'Update' : 'Create'} Bundle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
