import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { blogAPI } from '@/lib/api';

const emptyPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image_url: '',
  is_published: true
};

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState(emptyPost);

  const fetchPosts = async () => {
    try {
      const res = await blogAPI.getAllAdmin();
      setPosts(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenDialog = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData(post);
    } else {
      setEditingPost(null);
      setFormData(emptyPost);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPost) {
        await blogAPI.update(editingPost.id, formData);
        toast.success('Blog post updated!');
      } else {
        await blogAPI.create(formData);
        toast.success('Blog post created!');
      }
      setIsDialogOpen(false);
      fetchPosts();
    } catch (error) {
      toast.error('Error saving blog post');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    
    try {
      await blogAPI.delete(id);
      toast.success('Blog post deleted!');
      fetchPosts();
    } catch (error) {
      toast.error('Error deleting blog post');
    }
  };

  return (
    <AdminLayout title="Blog / Guides">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-sm">Create helpful guides and blog posts for your customers.</p>
          <Button onClick={() => handleOpenDialog()} className="bg-gold-500 hover:bg-gold-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Post
          </Button>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-white/40">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-card border border-white/10 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/40">No blog posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-card border border-white/10 rounded-lg p-4 flex items-center gap-4">
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-16 h-16 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{post.title}</h3>
                    {post.is_published ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-white/60 text-sm truncate">{post.excerpt}</p>
                  <p className="text-white/40 text-xs mt-1">/{post.slug}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(post)} className="text-white/60 hover:text-gold-500">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-white/60 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl uppercase">
                {editingPost ? 'Edit Post' : 'Add Post'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="bg-black border-white/20"
                  placeholder="How to use Netflix Private Profile"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="bg-black border-white/20"
                  placeholder="how-to-use-netflix-private-profile"
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL (optional)</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="bg-black border-white/20"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Excerpt (short description)</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="bg-black border-white/20 min-h-[60px]"
                  placeholder="A brief summary of this post..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Content (HTML supported)</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="bg-black border-white/20 min-h-[200px]"
                  placeholder="<p>Full content...</p>"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                />
                <Label>Published</Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black">
                  {editingPost ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
