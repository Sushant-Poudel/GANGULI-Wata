import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Check, ShoppingCart, X, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { productsAPI, ordersAPI } from '@/lib/api';

const WHATSAPP_NUMBER = "9779743488871";
const DESCRIPTION_CHAR_LIMIT = 200;

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    remark: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getOne(productId);
        setProduct(res.data);
        if (res.data.variations?.length > 0) {
          setSelectedVariation(res.data.variations[0].id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const currentVariation = product?.variations?.find(v => v.id === selectedVariation);

  const handleOrderViaWhatsApp = () => {
    const message = `Hi! I want to order:\n\n*Product:* ${product.name}\n*Plan:* ${currentVariation?.name}\n*Price:* Rs ${currentVariation?.price?.toLocaleString()}\n\nPlease process my order.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!orderForm.customer_name || !orderForm.customer_phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customer_name: orderForm.customer_name,
        customer_phone: orderForm.customer_phone,
        customer_email: orderForm.customer_email || null,
        items: [{
          name: product.name,
          price: Math.round(currentVariation.price * 100), // Convert to paisa
          quantity: 1,
          variation: currentVariation.name
        }],
        total_amount: Math.round(currentVariation.price * 100), // Convert to paisa
        remark: orderForm.remark || null
      };

      const res = await ordersAPI.create(orderData);
      
      setOrderSuccess({
        order_id: res.data.order_id,
        takeapp_synced: res.data.takeapp_synced,
        takeapp_order_number: res.data.takeapp_order_number
      });
      
      toast.success('Order placed successfully!');
      
      // Reset form
      setOrderForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        remark: ''
      });
      
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setIsOrderDialogOpen(false);
    setOrderSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-16 lg:pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="aspect-square skeleton rounded-lg"></div>
            <div className="space-y-4 lg:space-y-6">
              <div className="h-8 lg:h-10 w-3/4 skeleton rounded"></div>
              <div className="h-6 w-1/4 skeleton rounded"></div>
              <div className="h-32 lg:h-40 skeleton rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-16 lg:pt-20 min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-xl lg:text-2xl font-heading text-white mb-4">Product Not Found</h1>
            <Link to="/">
              <Button variant="outline" className="border-gold-500 text-gold-500">
                Go Back Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-16 lg:pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <Link to="/" className="inline-flex items-center text-white/60 hover:text-gold-500 transition-colors text-sm" data-testid="back-to-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>

        {/* Product Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Product Image */}
            <div className="lg:sticky lg:top-24 lg:self-start" data-testid="product-image-container">
              <div className="aspect-square bg-card rounded-lg overflow-hidden border border-white/10">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-5 lg:space-y-8" data-testid="product-details">
              {/* Title & Badges */}
              <div>
                {product.is_sold_out && (
                  <Badge variant="destructive" className="mb-2 lg:mb-3">Sold Out</Badge>
                )}
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white uppercase tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                {(() => {
                  const plainText = product.description?.replace(/<[^>]*>/g, '') || '';
                  const shouldTruncate = plainText.length > DESCRIPTION_CHAR_LIMIT && !isDescriptionExpanded;
                  
                  return (
                    <>
                      <div 
                        className="rich-text-content text-white/80 leading-relaxed text-sm lg:text-base"
                        dangerouslySetInnerHTML={{ 
                          __html: shouldTruncate 
                            ? product.description.substring(0, DESCRIPTION_CHAR_LIMIT) + '...'
                            : product.description 
                        }}
                      />
                      {plainText.length > DESCRIPTION_CHAR_LIMIT && (
                        <button
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          className="text-gold-500 hover:text-gold-400 text-sm font-medium mt-2 transition-colors"
                          data-testid="description-toggle"
                        >
                          {isDescriptionExpanded ? 'See less' : 'See more...'}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Variations */}
              {product.variations?.length > 0 && (
                <div className="space-y-3 lg:space-y-4" data-testid="variations-section">
                  <h3 className="font-heading text-base lg:text-lg font-semibold text-white uppercase tracking-wider">
                    Select Plan
                  </h3>
                  <RadioGroup 
                    value={selectedVariation} 
                    onValueChange={setSelectedVariation}
                    className="space-y-2 lg:space-y-3"
                  >
                    {product.variations.map((variation) => (
                      <div key={variation.id} className="relative">
                        <RadioGroupItem
                          value={variation.id}
                          id={variation.id}
                          className="peer sr-only"
                          data-testid={`variation-${variation.id}`}
                        />
                        <Label
                          htmlFor={variation.id}
                          className="flex items-center justify-between p-3 lg:p-4 bg-card border border-white/10 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-gold-500 peer-data-[state=checked]:bg-gold-500/10 hover:border-white/30"
                        >
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedVariation === variation.id ? 'border-gold-500' : 'border-white/30'
                            }`}>
                              {selectedVariation === variation.id && (
                                <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-gold-500" />
                              )}
                            </div>
                            <span className="font-heading font-semibold text-white text-sm lg:text-base">
                              {variation.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gold-500 text-sm lg:text-lg">
                              Rs {variation.price.toLocaleString()}
                            </span>
                            {variation.original_price && variation.original_price > variation.price && (
                              <span className="ml-2 text-white/40 line-through text-xs lg:text-sm">
                                Rs {variation.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-card/50 border border-white/10 rounded-lg p-4 lg:p-6 space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm lg:text-base">Selected Plan:</span>
                  <span className="font-heading font-semibold text-white text-sm lg:text-base">{currentVariation?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm lg:text-base">Price:</span>
                  <div>
                    <span className="font-bold text-gold-500 text-xl lg:text-2xl">
                      Rs {currentVariation?.price?.toLocaleString()}
                    </span>
                    {currentVariation?.original_price && currentVariation.original_price > currentVariation.price && (
                      <span className="ml-2 text-white/40 line-through text-sm">
                        Rs {currentVariation.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => setIsOrderDialogOpen(true)}
                  disabled={product.is_sold_out}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-black font-heading text-base lg:text-lg uppercase tracking-wider py-5 lg:py-6 rounded-lg"
                  data-testid="order-now-btn"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Order Now
                </Button>
                
                <Button
                  onClick={handleOrderViaWhatsApp}
                  disabled={product.is_sold_out}
                  variant="outline"
                  className="w-full border-green-500 text-green-500 hover:bg-green-500/10 font-heading text-sm lg:text-base uppercase tracking-wider py-4 lg:py-5 rounded-lg"
                  data-testid="whatsapp-btn"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Order via WhatsApp
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-center text-white/40 text-xs lg:text-sm">
                <p>Questions? Contact us at support@gameshopnepal.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-card border-white/10 text-white max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl uppercase">
              {orderSuccess ? 'Order Confirmed!' : 'Place Your Order'}
            </DialogTitle>
          </DialogHeader>

          {orderSuccess ? (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Thank you for your order!</h3>
                <p className="text-white/60 text-sm">
                  Your order has been received and is being processed.
                </p>
              </div>
              
              <div className="bg-black/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Order ID:</span>
                  <span className="text-white font-mono text-xs">{orderSuccess.order_id.slice(0, 8)}...</span>
                </div>
                {orderSuccess.takeapp_order_number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Take.app Order #:</span>
                    <span className="text-gold-500 font-semibold">{orderSuccess.takeapp_order_number}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Status:</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    {orderSuccess.takeapp_synced ? 'Synced' : 'Pending'}
                  </Badge>
                </div>
              </div>

              <p className="text-white/60 text-sm text-center">
                We'll contact you on WhatsApp to complete the payment.
              </p>

              <Button 
                onClick={handleCloseDialog}
                className="w-full bg-gold-500 hover:bg-gold-600 text-black"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Order Summary */}
              <div className="bg-black/50 rounded-lg p-3 flex items-center gap-3">
                <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                  <p className="text-white/60 text-xs">{currentVariation?.name}</p>
                </div>
                <p className="text-gold-500 font-bold">Rs {currentVariation?.price?.toLocaleString()}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-white/80 text-sm">Full Name *</Label>
                  <Input
                    value={orderForm.customer_name}
                    onChange={(e) => setOrderForm({...orderForm, customer_name: e.target.value})}
                    className="bg-black border-white/20 mt-1 text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white/80 text-sm">Phone Number *</Label>
                  <Input
                    value={orderForm.customer_phone}
                    onChange={(e) => setOrderForm({...orderForm, customer_phone: e.target.value})}
                    className="bg-black border-white/20 mt-1 text-base"
                    placeholder="9801234567"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white/80 text-sm">Email (optional)</Label>
                  <Input
                    type="email"
                    value={orderForm.customer_email}
                    onChange={(e) => setOrderForm({...orderForm, customer_email: e.target.value})}
                    className="bg-black border-white/20 mt-1 text-base"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label className="text-white/80 text-sm">Notes (optional)</Label>
                  <Textarea
                    value={orderForm.remark}
                    onChange={(e) => setOrderForm({...orderForm, remark: e.target.value})}
                    className="bg-black border-white/20 mt-1 text-base min-h-[80px]"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseDialog}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-black"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
