import React from 'react';
import { Select } from './Select';
import { Eye, Download, X, Upload, Sparkles, ThumbsUp, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Button } from './ui/button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface ProductFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categoryOptions: { label: string; value: string }[];
  monthOptions: { label: string; value: number }[];
  yearOptions: { label: string; value: number }[];
  conditionOptions?: { label: string; value: string; icon?: any }[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  setFormData,
  handleFileChange,
  categoryOptions,
  monthOptions,
  yearOptions,
  conditionOptions
}) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
          Product Name
        </label>
        <input 
          required
          autoFocus
          type="text"
          placeholder="e.g. MacBook Pro M3"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="flex min-h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm leading-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
        />
      </div>

      <div className="grid grid-cols-[3fr_2fr] sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
            Category
          </label>
          <Select 
            value={formData.category}
            onChange={(val) => setFormData({...formData, category: String(val)})}
            options={categoryOptions}
            open={openDropdown === 'category'}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'category' : null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-500 text-sm">₹</span>
            <input 
              type="number"
              placeholder="0.00"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="flex min-h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-7 pr-3 py-2 text-sm leading-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
          Purchase Date
        </label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Select 
            value={formData.purchaseMonth}
            onChange={(val) => setFormData({...formData, purchaseMonth: Number(val)})}
            options={monthOptions}
            open={openDropdown === 'month'}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'month' : null)}
          />
          <Select 
            value={formData.purchaseYear}
            onChange={(val) => setFormData({...formData, purchaseYear: Number(val)})}
            options={yearOptions}
            open={openDropdown === 'year'}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'year' : null)}
          />
        </div>
      </div>

      <div className="grid grid-cols-[2fr_3fr] sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <div className="flex items-center h-7 mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
              Warranty Duration
            </label>
          </div>
          <div className="relative">
            <input 
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 1 or 0.5"
              value={formData.warrantyYears}
              onChange={e => setFormData({...formData, warrantyYears: e.target.value})}
              className="flex min-h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-3 pr-14 py-2 text-sm leading-normal text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-zinc-500 font-medium pointer-events-none">
              Year
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center h-7 mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
              Choose Condition
            </label>
          </div>
          <ToggleGroup
            type="single"
            value={formData.condition === 'Mint' ? 'Fine' : formData.condition}
            onValueChange={(val) => {
              if (val) setFormData({...formData, condition: val});
            }}
            className="flex items-stretch h-10 w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 gap-1"
          >
            <ToggleGroupItem
              value="Fine"
              aria-label="Fine"
              className={`flex-1 h-full rounded-md text-slate-400 hover:text-emerald-600 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-emerald-400 data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-700 dark:data-[state=on]:bg-emerald-900/40 dark:data-[state=on]:text-emerald-400 transition-all duration-200 ${(formData.condition === 'Fine' || formData.condition === 'Mint') ? 'shadow-sm' : ''}`}
              title="Fine"
            >
              <Sparkles size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Good"
              aria-label="Good"
              className={`flex-1 h-full rounded-md text-slate-400 hover:text-blue-600 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-blue-400 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 dark:data-[state=on]:bg-blue-900/40 dark:data-[state=on]:text-blue-400 transition-all duration-200 ${formData.condition === 'Good' ? 'shadow-sm' : ''}`}
              title="Good"
            >
              <ThumbsUp size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Poor"
              aria-label="Poor"
              className={`flex-1 h-full rounded-md text-slate-400 hover:text-amber-600 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-amber-400 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700 dark:data-[state=on]:bg-amber-900/40 dark:data-[state=on]:text-amber-400 transition-all duration-200 ${formData.condition === 'Poor' ? 'shadow-sm' : ''}`}
              title="Poor"
            >
              <AlertTriangle size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Critical"
              aria-label="Critical"
              className={`flex-1 h-full rounded-md text-slate-400 hover:text-red-600 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-red-400 data-[state=on]:bg-red-100 data-[state=on]:text-red-700 dark:data-[state=on]:bg-red-900/40 dark:data-[state=on]:text-red-400 transition-all duration-200 ${formData.condition === 'Critical' ? 'shadow-sm' : ''}`}
              title="Critical"
            >
              <AlertOctagon size={18} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between h-7 mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
              Receipt (PDF)
            </label>
            {formData.receipt && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                  onClick={() => {
                    const base64Content = formData.receipt!.split(',')[1];
                    const binary = atob(base64Content);
                    const array = [];
                    for (let i = 0; i < binary.length; i++) {
                      array.push(binary.charCodeAt(i));
                    }
                    const blob = new Blob([new Uint8Array(array)], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  }}
                  title="View Receipt"
                >
                  <Eye size={13} />
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                  title="Download Receipt"
                >
                  <a href={formData.receipt} download={`Receipt_${formData.name.replace(/\s+/g, '_')}.pdf`}>
                    <Download size={13} />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData({ ...formData, receipt: undefined })}
                  className="h-7 w-7 text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  title="Remove Receipt"
                >
                  <X size={13} />
                </Button>
              </div>
            )}
          </div>
          <div className="relative">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              id="receipt-upload"
              className="hidden"
            />
            <Button 
              asChild
              variant="outline"
              className={`flex h-10 w-full rounded-lg border-dashed font-normal cursor-pointer transition-all duration-200 ${
                formData.receipt 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300' 
                  : 'border-slate-300 dark:border-zinc-700 bg-transparent text-slate-500 dark:text-zinc-500 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <label htmlFor="receipt-upload">
                <Upload size={16} className="mr-2" />
                {formData.receipt ? 'PDF Uploaded' : 'Upload PDF'}
              </label>
            </Button>
          </div>
        </div>
    </>
  );
};
