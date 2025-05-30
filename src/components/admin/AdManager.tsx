import React, { useState, useEffect } from 'react';
import { Ad, AdType, addAd, fetchAds as getAllAds, updateAd, deleteAd } from '@/lib/firebaseServices/adsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, AlertTriangle, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
// import { Timestamp } from 'firebase/firestore'; // Not directly used in form/state for this version

const initialAdFormData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  code: '',
  type: 'banner', // Default ad type
  intervalMinutes: 0,
  isActive: true,
};

const AdManager: React.FC = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false); // General loading for table/actions
  const [formSubmitting, setFormSubmitting] = useState(false); // Specific for form submission
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [currentFormData, setCurrentFormData] = useState<Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>>(initialAdFormData);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewAd, setPreviewAd] = useState<{ code: string; title: string } | null>(null);

  const adTypes: AdType[] = ['banner', 'preroll', 'midroll']; // Available ad types

  const fetchAllAds = async () => {
    setLoading(true);
    try {
      const fetchedAds = await getAllAds();
      setAds(fetchedAds);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast({ title: "Error Loading Ads", description: (error as Error).message || "Failed to load ad snippets.", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllAds();
  }, []);

  useEffect(() => {
    if (editingAd) {
      // Destructure to exclude fields not directly in the form or to handle them separately if needed
      const { id, createdAt, updatedAt, ...formDataFromEditingAd } = editingAd;
      setCurrentFormData(formDataFromEditingAd);
    } else {
      setCurrentFormData(initialAdFormData);
    }
  }, [editingAd, isFormOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // For intervalMinutes, ensure it's a number
    if (name === 'intervalMinutes') {
      const numValue = parseInt(value, 10);
      setCurrentFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setCurrentFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) => { // Simplified: assumes only 'type' select for now
    setCurrentFormData(prev => ({ ...prev, type: value as AdType }));
  };

  const handleSwitchChange = (checked: boolean) => { // Simplified: assumes only 'isActive' switch
    setCurrentFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentFormData.title || !currentFormData.code) {
      toast({ title: "Validation Error", description: "Title and Ad Code are required.", variant: "destructive" });
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingAd?.id) {
        // Ensure we pass only the fields that are part of Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>
        // or match the updateAd service function's expected update payload.
        const updatePayload: Partial<Omit<Ad, 'id' | 'createdAt'>> = {
            ...currentFormData,
            // Ensure intervalMinutes is a number
            intervalMinutes: Number(currentFormData.intervalMinutes) || 0,
        };
        await updateAd(editingAd.id, updatePayload);
        toast({ title: "Ad Updated", description: "Ad saved successfully." });
      } else {
        const addPayload: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'> = {
            ...currentFormData,
            intervalMinutes: Number(currentFormData.intervalMinutes) || 0,
        };
        await addAd(addPayload);
        toast({ title: "Ad Added", description: "New ad created successfully." });
      }
      fetchAllAds();
      setIsFormOpen(false);
      setEditingAd(null);
    } catch (error) {
      console.error("Error saving ad:", error);
      toast({ title: "Error Saving Ad", description: (error as Error).message || "Failed to save ad.", variant: "destructive" });
    }
    setFormSubmitting(false);
  };

  const openEditForm = (ad: Ad) => {
    setEditingAd(ad);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingAd(null);
    // setCurrentFormData(initialAdFormData); // This is handled by useEffect
    setIsFormOpen(true);
  };

  const confirmDeleteAd = (ad: Ad) => {
    setAdToDelete(ad);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAd = async () => {
    if (adToDelete?.id) {
      setLoading(true); // Use general loading for this table-affecting action
      try {
        await deleteAd(adToDelete.id);
        toast({ title: "Ad Deleted", description: `Ad "${adToDelete.title}" has been deleted.` });
        fetchAllAds(); // Refresh list
      } catch (error) {
        console.error("Error deleting ad:", error);
        toast({ title: "Error Deleting Ad", description: (error as Error).message || "Failed to delete ad.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setAdToDelete(null);
        setLoading(false);
      }
    }
  };

  const toggleAdStatus = async (ad: Ad) => {
    setLoading(true);
    try {
      // Create the update payload by spreading existing ad data and toggling isActive
      const updatePayload: Partial<Omit<Ad, 'id' | 'createdAt'>> = { 
          title: ad.title,
          code: ad.code,
          type: ad.type,
          intervalMinutes: ad.intervalMinutes,
          isActive: !ad.isActive 
      };
      await updateAd(ad.id, updatePayload);
      toast({ title: "Status Updated", description: `Ad "${ad.title}" status changed.` });
      fetchAllAds(); // Refresh list
    } catch (error) {
      console.error("Error updating ad status:", error);
      toast({ title: "Error Updating Status", description: (error as Error).message || "Failed to update status.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handlePreviewAd = (ad: Ad) => {
    setPreviewAd({ code: ad.code, title: ad.title });
  };

  return (
    <div className="p-4 bg-gray-900/50 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Manage Ad Snippets</h2>
        <Button onClick={openAddForm} className="bg-red-600 hover:bg-red-700 text-white">
          <PlusCircle className="w-4 h-4 mr-2" /> Add New Ad
        </Button>
      </div>

      {/* Ad Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setEditingAd(null); }}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-red-500">{editingAd ? 'Edit Ad Snippet' : 'Add New Ad Snippet'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <Input name="title" placeholder="Ad Title (e.g., Header Banner, Preroll Video X)" value={currentFormData.title} onChange={handleInputChange} required className="bg-gray-800 border-gray-700" />
            <Textarea name="code" placeholder="Paste Ad Code (HTML/JS/VAST XML)" value={currentFormData.code} onChange={handleInputChange} required rows={8} className="bg-gray-800 border-gray-700" />
            
            <div className="grid grid-cols-2 gap-4">
                <Select value={currentFormData.type} onValueChange={handleSelectChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select Ad Type" /></SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                        {adTypes.map(type => <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input name="intervalMinutes" type="number" placeholder="Interval (mins, if applicable)" value={currentFormData.intervalMinutes || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700" min="0" />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="isActive" checked={currentFormData.isActive} onCheckedChange={handleSwitchChange} />
              <label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Ad Active</label>
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="hover:border-red-500 hover:text-red-500">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={formSubmitting} className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]">
                {formSubmitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                ) : null}
                {formSubmitting ? 'Saving...' : (editingAd ? 'Save Changes' : 'Add Ad')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-yellow-400"/>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the ad "<strong>{adToDelete?.title}</strong>"? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="hover:border-gray-500">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDeleteAd} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700 text-white min-w-[120px]">
                {loading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                ) : null}
              {loading ? 'Deleting...' : 'Delete Ad' }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ad Preview Dialog */}
      {previewAd && (
        <Dialog open={!!previewAd} onOpenChange={() => setPreviewAd(null)}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl w-full">
            <DialogHeader>
              <DialogTitle className="text-red-500">Preview: {previewAd.title}</DialogTitle>
            </DialogHeader>
            <div className="my-4 p-4 border border-dashed border-gray-600 min-h-[250px] max-h-[60vh] overflow-auto rounded" dangerouslySetInnerHTML={{ __html: previewAd.code }}></div>
            <DialogFooter>
              <Button onClick={() => setPreviewAd(null)} variant="outline" className="hover:border-red-500 hover:text-red-500">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Ads Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-700">
          <TableHeader>
            <TableRow className="hover:bg-gray-800/0">
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Interval (min)</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-700">
            {loading && ads.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Loading ad snippets...</TableCell></TableRow>
            ) : ads.length > 0 ? ads.map((ad) => (
              <TableRow key={ad.id} className="hover:bg-gray-800/50">
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{ad.title}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{ad.intervalMinutes ? `${ad.intervalMinutes} min` : 'N/A'}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleAdStatus(ad)}
                    className={`p-1 h-auto rounded-full ${ad.isActive ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'}`}
                    title={ad.isActive ? 'Deactivate' : 'Activate'}
                    disabled={loading} // Disable while another ad action is in progress
                  >
                    {ad.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    <span className="ml-1 sr-only">{ad.isActive ? 'Active' : 'Inactive'}</span>
                  </Button>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handlePreviewAd(ad)} className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-black">
                    <Eye className="w-4 h-4 mr-1" /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditForm(ad)} className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => confirmDeleteAd(ad)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No ad snippets found. Add a new ad to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdManager;
