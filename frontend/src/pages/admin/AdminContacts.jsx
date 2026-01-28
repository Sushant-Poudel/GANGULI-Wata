import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Mail, Phone, MessageCircle, Send } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { contactsAPI } from '@/lib/api';

const PLATFORMS = [
  { value: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { value: 'messenger', label: 'Messenger', icon: '💬' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
  { value: 'viber', label: 'Viber', icon: '📞' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '☎️' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'discord', label: 'Discord', icon: '🎮' },
];

const emptyContact = {
  platform: '',
  label: '',
  value: '',
  is_active: true,
  sort_order: 0
};

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState(emptyContact);

  const fetchContacts = async () => {
    try {
      const res = await contactsAPI.getAllAdmin();
      setContacts(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData(contact);
    } else {
      setEditingContact(null);
      setFormData(emptyContact);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingContact) {
        await contactsAPI.update(editingContact.id, formData);
        toast.success('Contact updated!');
      } else {
        await contactsAPI.create(formData);
        toast.success('Contact created!');
      }
      setIsDialogOpen(false);
      fetchContacts();
    } catch (error) {
      toast.error('Error saving contact');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    
    try {
      await contactsAPI.delete(id);
      toast.success('Contact deleted!');
      fetchContacts();
    } catch (error) {
      toast.error('Error deleting contact');
    }
  };

  const getPlatformIcon = (platform) => {
    return PLATFORMS.find(p => p.value === platform)?.icon || '📎';
  };

  return (
    <AdminLayout title="Contact Links">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-sm">Manage contact options shown to customers.</p>
          <Button onClick={() => handleOpenDialog()} className="bg-gold-500 hover:bg-gold-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-white/40">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 bg-card border border-white/10 rounded-lg">
              <MessageCircle className="h-12 w-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/40">No contact links yet</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="bg-card border border-white/10 rounded-lg p-4 flex items-center gap-4">
                <div className="text-2xl">{getPlatformIcon(contact.platform)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{contact.label}</h3>
                    {!contact.is_active && (
                      <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{contact.value}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(contact)} className="text-white/60 hover:text-gold-500">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)} className="text-white/60 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={formData.platform} onValueChange={(v) => setFormData({...formData, platform: v})}>
                  <SelectTrigger className="bg-black border-white/20">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.icon} {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  className="bg-black border-white/20"
                  placeholder="e.g. Chat with us"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Value (link/number/email)</Label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="bg-black border-white/20"
                  placeholder="e.g. +977-9841234567"
                  required
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
                  {editingContact ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
