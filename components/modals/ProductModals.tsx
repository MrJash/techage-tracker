import React from 'react';
import { Plus, Save } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../ui/button';
import { ProductForm, FormData, Option } from '../ProductForm';
import { Product } from '../../types';
import { CurrencyCode } from '../../utils/currency';
import { TagColorId } from '../../utils/tagColors';

export interface ProductModalsProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onAddSubmit: (e: React.FormEvent) => void;
  editingProduct: Product | null;
  onCloseEditModal: () => void;
  onEditSubmit: (e: React.FormEvent) => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categoryOptions: Option[];
  monthOptions: Option[];
  yearOptions: Option[];
  conditionOptions: Option[];
  currency: CurrencyCode;
  allUniqueTags: string[];
  tagColors: Record<string, TagColorId>;
  onSetTagColor: (tag: string, colorId: TagColorId) => void;
}

export const ProductModals: React.FC<ProductModalsProps> = ({
  isAddModalOpen,
  onCloseAddModal,
  onAddSubmit,
  editingProduct,
  onCloseEditModal,
  onEditSubmit,
  formData,
  setFormData,
  handleFileChange,
  categoryOptions,
  monthOptions,
  yearOptions,
  conditionOptions,
  currency,
  allUniqueTags,
  tagColors,
  onSetTagColor,
}) => {
  return (
    <>
      {/* Add Product Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={onCloseAddModal}
        title="Add New Product"
        dataTour="add-product-modal"
      >
        <form onSubmit={onAddSubmit} className="space-y-4">
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            handleFileChange={handleFileChange}
            categoryOptions={categoryOptions}
            monthOptions={monthOptions}
            yearOptions={yearOptions}
            conditionOptions={conditionOptions}
            currency={currency}
            availableTags={allUniqueTags}
            tagColors={tagColors}
            onSetTagColor={onSetTagColor}
          />
          <div className="-mx-6 -mb-6 px-6 py-4 mt-6 border-t border-border">
            <Button type="submit" className="w-full">
              <Plus size={18} />
              Add Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={onCloseEditModal}
        title="Edit Product Details"
      >
        <form onSubmit={onEditSubmit} className="space-y-4">
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            handleFileChange={handleFileChange}
            categoryOptions={categoryOptions}
            monthOptions={monthOptions}
            yearOptions={yearOptions}
            conditionOptions={conditionOptions}
            currency={currency}
            availableTags={allUniqueTags}
            tagColors={tagColors}
            onSetTagColor={onSetTagColor}
          />
          <div className="-mx-6 -mb-6 px-6 py-4 mt-6 border-t border-border">
            <Button type="submit" className="w-full">
              <Save size={18} />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
