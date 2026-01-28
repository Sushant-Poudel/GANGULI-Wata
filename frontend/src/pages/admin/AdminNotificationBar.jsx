import { useEffect, useState } from 'react';
import { Bell, Save } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { notificationBarAPI } from '@/lib/api';

export default function AdminNotificationBar() {
  const [formData, setFormData] = useState({
    text: '',
    link: '',
    is_active: true,
    bg_color: '#F5A623',
    text_color: '#000000'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await notificationBarAPI.get();
        if (res.data) {
          setFormData(res.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await notificationBarAPI.update(formData);
      toast.success('Notification bar updated!');
    } catch (error) {
      toast.error('Error updating notification bar');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Notification Bar">
        <div className="text-center py-8 text-white/40">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Notification Bar">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-gold-500" />
          <p className="text-white/60 text-sm">Configure the notification banner shown at the top of your website.</p>
        </div>

        {/* Preview */}
        {formData.is_active && formData.text && (
          <div className="rounded-lg overflow-hidden">
            <p className="text-white/60 text-xs mb-2">Preview:</p>
            <div 
              className="py-2 px-4 text-center text-sm font-medium"
              style={{ backgroundColor: formData.bg_color, color: formData.text_color }}
            >
              {formData.text}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label className="text-white">Enable Notification Bar</Label>
          </div>

          <div className="space-y-2">
            <Label>Notification Text</Label>
            <Input
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              className="bg-black border-white/20"
              placeholder="🔥 Sale: Spotify Premium only Rs 200 — Today Only!"
            />
          </div>

          <div className="space-y-2">
            <Label>Link (optional)</Label>
            <Input
              value={formData.link || ''}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              className="bg-black border-white/20"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.bg_color}
                  onChange={(e) => setFormData({...formData, bg_color: e.target.value})}
                  className="w-12 h-10 p-1 bg-black border-white/20"
                />
                <Input
                  value={formData.bg_color}
                  onChange={(e) => setFormData({...formData, bg_color: e.target.value})}
                  className="bg-black border-white/20 flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                  className="w-12 h-10 p-1 bg-black border-white/20"
                />
                <Input
                  value={formData.text_color}
                  onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                  className="bg-black border-white/20 flex-1"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
