"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  type InvoiceGenerationSellerData, 
  type InvoiceGenerationBuyerData,
  invoiceGenerationSellerSchema,
  invoiceGenerationBuyerSchema,
} from "@/lib/validations/invoice-generation";
import { Book, Plus, Trash2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface SavedContact {
  id: string;
  name: string;
  address: string;
  email: string;
  vatNo?: string;
  accountNumber?: string;
  swiftBic?: string;
  notes?: string;
  createdAt: Date;
}

interface SellerBuyerManagementProps {
  type: "seller" | "buyer";
  onSelect: (data: InvoiceGenerationSellerData | InvoiceGenerationBuyerData) => void;
  currentData?: InvoiceGenerationSellerData | InvoiceGenerationBuyerData;
}

export function SellerBuyerManagement({ 
  type, 
  onSelect, 
  currentData 
}: SellerBuyerManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const storageKey = `invoice_generation_saved_${type}s`;
  const isSeller = type === "seller";
  
  const form = useForm({
    resolver: zodResolver(isSeller ? invoiceGenerationSellerSchema : invoiceGenerationBuyerSchema),
    defaultValues: isSeller ? {
      name: "",
      address: "",
      email: "",
      vatNo: "",
      accountNumber: "",
      swiftBic: "",
      notes: "",
      vatNoFieldIsVisible: true,
      accountNumberFieldIsVisible: true,
      swiftBicFieldIsVisible: true,
      notesFieldIsVisible: true,
    } : {
      name: "",
      address: "",
      email: "",
      vatNo: "",
      notes: "",
      vatNoFieldIsVisible: true,
      notesFieldIsVisible: true,
    },
  });

  // Load saved contacts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const contacts = JSON.parse(saved) as SavedContact[];
        setSavedContacts(contacts);
      }
    } catch (error) {
      console.error(`Failed to load saved ${type}s:`, error);
    }
  }, [storageKey, type]);

  const saveContact = (contact: SavedContact) => {
    try {
      const newContacts = [...savedContacts, contact];
      setSavedContacts(newContacts);
      localStorage.setItem(storageKey, JSON.stringify(newContacts));
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`);
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
      toast.error(`Failed to save ${type}`);
    }
  };

  const deleteContact = (id: string) => {
    try {
      const newContacts = savedContacts.filter(contact => contact.id !== id);
      setSavedContacts(newContacts);
      localStorage.setItem(storageKey, JSON.stringify(newContacts));
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleSaveNew = form.handleSubmit((data) => {
    const newContact: SavedContact = {
      id: crypto.randomUUID(),
      name: data.name,
      address: data.address,
      email: data.email,
      vatNo: data.vatNo || undefined,
      accountNumber: isSeller && "accountNumber" in data ? data.accountNumber || undefined : undefined,
      swiftBic: isSeller && "swiftBic" in data ? data.swiftBic || undefined : undefined,
      notes: data.notes || undefined,
      createdAt: new Date(),
    };

    saveContact(newContact);
    setIsAddingNew(false);
    form.reset();
  });

  const handleSelectContact = (contact: SavedContact) => {
    const contactData = isSeller ? {
      id: contact.id,
      name: contact.name,
      address: contact.address,
      email: contact.email,
      vatNo: contact.vatNo || "",
      vatNoFieldIsVisible: true,
      accountNumber: contact.accountNumber || "",
      accountNumberFieldIsVisible: true,
      swiftBic: contact.swiftBic || "",
      swiftBicFieldIsVisible: true,
      notes: contact.notes || "",
      notesFieldIsVisible: true,
    } as InvoiceGenerationSellerData : {
      id: contact.id,
      name: contact.name,
      address: contact.address,
      email: contact.email,
      vatNo: contact.vatNo || "",
      vatNoFieldIsVisible: true,
      notes: contact.notes || "",
      notesFieldIsVisible: true,
    } as InvoiceGenerationBuyerData;

    onSelect(contactData);
    setIsOpen(false);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} information loaded!`);
  };

  const handleSaveCurrent = () => {
    if (!currentData || !currentData.name || !currentData.email) {
      toast.error(`Please fill out ${type} information before saving`);
      return;
    }

    const newContact: SavedContact = {
      id: crypto.randomUUID(),
      name: currentData.name,
      address: currentData.address,
      email: currentData.email,
      vatNo: currentData.vatNo || undefined,
      accountNumber: isSeller && "accountNumber" in currentData ? currentData.accountNumber || undefined : undefined,
      swiftBic: isSeller && "swiftBic" in currentData ? currentData.swiftBic || undefined : undefined,
      notes: currentData.notes || undefined,
      createdAt: new Date(),
    };

    saveContact(newContact);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Book className="w-4 h-4 mr-2" />
          Manage {type.charAt(0).toUpperCase() + type.slice(1)}s
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type.charAt(0).toUpperCase() + type.slice(1)} Management
          </DialogTitle>
          <DialogDescription>
            Save and manage your {type} information for quick access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save Current Button */}
          {currentData && currentData.name && (
            <Button
              onClick={handleSaveCurrent}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Save Current {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          )}

          {/* Add New Form */}
          {isAddingNew && (
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Add New {type.charAt(0).toUpperCase() + type.slice(1)}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-name">Name *</Label>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <Input {...field} id="new-name" placeholder="Company/Person name" />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="new-email">Email *</Label>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <Input {...field} id="new-email" type="email" placeholder="email@example.com" />
                    )}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="new-address">Address *</Label>
                <Textarea
                  {...form.register("address")}
                  id="new-address"
                  placeholder="Street, City, Country"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-vat">VAT Number</Label>
                  <Controller
                    name="vatNo"
                    control={form.control}
                    render={({ field }) => (
                      <Input {...field} id="new-vat" placeholder="VAT123456" />
                    )}
                  />
                </div>

                {isSeller && (
                  <div>
                    <Label htmlFor="new-account">Account Number</Label>
                    <Controller
                      name="accountNumber"
                      control={form.control}
                      render={({ field }) => (
                        <Input {...field} id="new-account" placeholder="Account number" />
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveNew} size="sm">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingNew(false);
                    form.reset();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Add New Button */}
          {!isAddingNew && (
            <Button
              onClick={() => setIsAddingNew(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          )}

          {/* Saved Contacts List */}
          <div className="space-y-2">
            <h4 className="font-medium">Saved {type.charAt(0).toUpperCase() + type.slice(1)}s</h4>
            
            {savedContacts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No saved {type}s yet. Add some for quick access!
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="border rounded-lg p-3 flex items-start justify-between"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handleSelectContact(contact)}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <h5 className="font-medium">{contact.name}</h5>
                      </div>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.address}</p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteContact(contact.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}