import React, { useEffect, useState } from "react";
import { Button } from "../../../ui/button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "../../../ui/card";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "../../../ui/table";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger,} from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Plus, Edit, Trash2, Languages, Settings, X } from "lucide-react";
import { useToast } from "../../../../hooks/use-toast";
import { authService } from "../../../../lib/auth";
import {CategoriesProvider,useCategories,} from "../../../../contexts/CategoriesContext";
import { ColorsProvider, useColors } from "../../../../contexts/ColorsContext";
import { FeaturesProvider } from "../../../../contexts/FeaturesContext";
import { TypesProvider } from "../../../../contexts/TypesContext";
import { ProductColorsProvider } from "../../../../contexts/ProductColorsContext";
import { ColorSelector } from "../../../ColorSelector";
import { FeatureSelector } from "../../../FeatureSelector";
import { ImageUploader } from "../../../ImageUploader";
import { CategorySelector } from "../../../CategorySeletor";
import type {Product,ProductColorData,ProductFeature,} from "../../../../lib/types";
import Loader from "../../../ui/loader";
import { apiFetch } from "../../../../lib/api";
import { useTranslation } from "react-i18next"; // ADD i18n import
import { useCurrency } from "../../../../contexts/CurrencyContext";

function ProductManagementContent() {
  const { t, i18n } = useTranslation();
  const { selectedCurrency } = useCurrency(); // ADD THIS
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [selectedColors, setSelectedColors] = useState<ProductColorData[]>([]);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [uploadMode, setUploadMode] = useState<"immediate" | "delayed">(
    "delayed"
  );
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
  const [productColors, setProductColors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to format price with currency
  const formatPrice = (price: number | string) => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    
    // Handle invalid price values
    if (isNaN(priceNum)) return "0.00";
    
    // Assuming API returns price in USD, you might need to adjust this
    // based on how your backend stores prices
    const convertedPrice = priceNum; // If prices are already in selected currency
    
    // If prices are stored in USD and you need to convert:
    // You would need exchange rates from your currency API
    // const convertedPrice = priceNum * exchangeRate;
    
    // Format the price based on the selected currency
    if (selectedCurrency) {
      // Determine which name to use based on current language
      const currentLang = i18n.language || 'en';
      let currencyName = selectedCurrency.name_en; // default to English
      
      if (currentLang.startsWith('uz')) {
        currencyName = selectedCurrency.name_uz;
      } else if (currentLang.startsWith('ru')) {
        currencyName = selectedCurrency.name_ru;
      } else {
        currencyName = selectedCurrency.name_en;
      }
      
      // Format price with appropriate decimal places
      const formattedPrice = convertedPrice.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      
      return `${formattedPrice} ${currencyName}`;
    }
    
    // Fallback to USD if no currency selected
    return `$${priceNum.toFixed(2)}`;
  };

  const blankForm = {
    id: 0,
    title_uz: "",
    title_en: "",
    title_ru: "",
    description_uz: "",
    description_en: "",
    description_ru: "",
    price: "",
    old_price: "",
    category: 0,
    images: [] as File[],
    colors: [] as ProductColorData[],
    features: [] as ProductFeature[],
  };

  const imageForm = {
    images: [] as File[],
  };
  const [formData, setFormData] = useState<typeof blankForm>(blankForm);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [productData, setProductData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [uploadImages, setUploadImages] = useState<typeof imageForm>(imageForm);
  const { toast } = useToast();
  const { categories } = useCategories();
  const { colors } = useColors();

  const normalizeImageUrl = (url?: string) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("http")) return url;
    return `https://uzbekfoodstuff.pythonanywhere.com${url}`;
  };

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const response = await authService.makeAuthenticatedRequest(
        "/product/all/"
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      // Sort so newest products appear first
      const sorted = [...data].sort((a, b) => b.id - a.id);

      setProductData(sorted);
    } catch {
      toast({
        title: t("productManagement.error"),
        description: t("productManagement.failedFetch"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fix: Convert API color data to ProductColorData format
  const convertApiColorsToProductColors = (apiColors: any[]): ProductColorData[] => {
    return apiColors.map(color => ({
      colorId: color.color,
      image: color.image, // This is string from API, not File
      price: color.price || ""
    }));
  };

  // Fetch product colors for a specific product
  const fetchProductColors = async (productId: number) => {
    try {
      const response = await authService.makeAuthenticatedRequest(
        `/product/create-product-colors/`
      );

      if (!response.ok) {
        const altResponse = await authService.makeAuthenticatedRequest(
          `/product/detail-product-colors/`
        );
        if (!altResponse.ok) throw new Error("Failed to fetch product colors");
        const data = await altResponse.json();

        const filteredData = data.filter(
          (item: any) => item.product === productId
        );
        setProductColors(filteredData);
        return;
      }

      const data = await response.json();
      const filteredData = data.filter(
        (item: any) => item.product === productId
      );
      setProductColors(filteredData);
    } catch (error) {
      console.error("Error fetching product colors:", error);
      toast({
        title: t("productManagement.error"),
        description: t("productManagement.failedFetchColors"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchProductColors(selectedProductId);
    }
  }, [selectedProductId]);


  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData(blankForm);
    setImagePreviews([]);
    setIsSubmitting(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Product) => {
    setEditingItem(item);
    const categoryObj = categories.find(
      (c) => c.slug === String(item.category)
    );
    const categoryId = categoryObj ? categoryObj.id : 0;

    // Fix: Handle colors properly - convert API colors to ProductColorData
    const productColors: ProductColorData[] = item.colors ? 
      item.colors.map(color => ({
        colorId: color.colorId,
        image: color.image, // This is string from API
        price: color.price
      })) : [];

    setFormData({
      id: item.id,
      title_uz: item.title_uz || "",
      title_en: item.title_en || "",
      title_ru: item.title_ru || "",
      description_uz: item.description_uz || "",
      description_en: item.description_en || "",
      description_ru: item.description_ru || "",
      price: item.price || "",
      old_price: item.old_price || "",
      category: categoryId,
      images: [] as File[],
      colors: productColors,
      features: item.features || [],
    });
    setImagePreviews(
      (item.images || []).map((im) => normalizeImageUrl(im.image))
    );
    setIsSubmitting(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("productManagement.deleteConfirm"))) return;
    try {
      const response = await authService.makeAuthenticatedRequest(
        `/product/${id}/`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Delete failed");
      setProductData((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: t("productManagement.success"),
        description: t("productManagement.productDeleted"),
      });
    } catch {
      toast({
        title: t("productManagement.error"),
        description: t("productManagement.failedDelete"),
        variant: "destructive",
      });
    }
  };

  const uploadImagesToProduct = async (images: File[], productId: number) => {
    try {
      for (const file of images) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("product", productId.toString());

        const token = authService.getAccessToken();

        const res = await apiFetch("/product/create-images/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(JSON.stringify(errData));
        }
      }

      toast({ title: t("productManagement.imagesUploaded") });
      setUploadImages({ images: [] });
    } catch (err) {
      toast({
        title: t("productManagement.errorUploading"),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const productPayload = {
        title_uz: formData.title_uz || "",
        title_en: formData.title_en || "",
        title_ru: formData.title_ru || "",
        description_uz: formData.description_uz || "",
        description_en: formData.description_en || "",
        description_ru: formData.description_ru || "",
        price: formData.price || "",
        old_price: formData.old_price || null,
        category: Number(formData.category) || null,
      };

      const endpoint = editingItem
        ? `/product/${editingItem.id}/`
        : "/product/create/";
      const method = editingItem ? "PUT" : "POST";

      const res = await authService.makeAuthenticatedRequest(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${text}`);
      }
      const createdProduct = await res.json();
      const productId = editingItem?.id || createdProduct.id;
      if (!productId) throw new Error("Backend did not return product ID");

      if (uploadImages.images.length > 0) {
        setUploadMode("immediate");
        await uploadImagesToProduct(uploadImages.images, productId);
      }

      await fetchProductData();
      toast({
        title: t("productManagement.success"),
        description: editingItem
          ? t("productManagement.productUpdated")
          : t("productManagement.productCreated"),
      });

      setIsDialogOpen(false);
    } catch (err) {
      toast({
        title: t("productManagement.error"),
        description: editingItem
          ? t("productManagement.failedUpdate")
          : t("productManagement.failedCreate"),
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFeatureDialog = (productId: number) => {
    setSelectedProductId(productId);

    const product = productData.find((p) => p.id === productId);
    if (product && product.colors) {
      // Fix: Convert API colors to ProductColorData format
      const convertedColors = convertApiColorsToProductColors(product.colors);
      setSelectedColors(convertedColors);
    } else {
      setSelectedColors([]);
    }

    setIsFeatureDialogOpen(true);
  };

  const handleAddColor = async (
  colorId: number,
  image: string | File | null,
  price: string
) => {
  if (!selectedProductId) return;

  try {
    const formData = new FormData();
    formData.append("product", selectedProductId.toString());
    formData.append("color", colorId.toString());
    formData.append("price", price);

    if (image) {
      formData.append("image", image);
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, 1, 1);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(resolve as BlobCallback, "image/png");
        });

        const placeholderFile = new File([blob], "placeholder.png", {
          type: "image/png",
        });
        formData.append("image", placeholderFile);
      } else {
        throw new Error("Could not create placeholder image");
      }
    }

    const response = await authService.makeAuthenticatedRequest(
      "/product/create-product-colors/",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", errorText);
      throw new Error(`Failed to add color: ${response.status} ${errorText}`);
    }

    await fetchProductColors(selectedProductId);

    toast({
      title: t("productManagement.success"),
      description: t("productManagement.colorAdded"),
    });

    setIsColorSelectorOpen(false);
  } catch (error) {
    console.error("Error adding color:", error);
    toast({
      title: t("productManagement.error"),
      description: t("productManagement.failedAddColor"),
      variant: "destructive", // FIXED: Added quotes around "destructive"
    });
  }
};

  const handleRemoveColor = async (productColorId: number) => {
    if (!selectedProductId) return;

    try {
      const response = await authService.makeAuthenticatedRequest(
        `/product/detail-product-colors/${productColorId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const altResponse = await authService.makeAuthenticatedRequest(
          `/product/create-product-colors/${productColorId}/`,
          {
            method: "DELETE",
          }
        );
        if (!altResponse.ok) throw new Error("Failed to remove color");
      }

      await fetchProductColors(selectedProductId);

      toast({
        title: t("productManagement.success"),
        description: t("productManagement.colorRemoved"),
      });
    } catch (error) {
      toast({
        title: t("productManagement.error"),
        description: t("productManagement.failedRemoveColor"),
        variant: "destructive",
      });
    }
  };

  const filteredProducts = filterCategory
    ? productData.filter((p) => {
        const categoryObj = categories.find((c) => c.slug === p.category);
        return categoryObj?.id === filterCategory;
      })
    : productData;

  if (isLoading) {
    return <Loader />;
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-slide-in flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl md:text-3xl font-bold flex items-center gap-3">
                <Plus className="h-6 w-6 md:h-8 md:w-8 text-primary" />{" "}
                {t("productManagement.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("productManagement.description")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />{" "}
                  {t("productManagement.createProduct")}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem
                      ? t("productManagement.editProduct")
                      : t("productManagement.createProduct")}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem
                      ? t("productManagement.updateProduct")
                      : t("productManagement.addProduct")}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Language Tabs */}
                  <Tabs defaultValue="uz" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger
                        value="uz"
                        className="flex items-center gap-2"
                      >
                        <Languages className="h-4 w-4" /> Uzbek
                      </TabsTrigger>
                      <TabsTrigger
                        value="ru"
                        className="flex items-center gap-2"
                      >
                        <Languages className="h-4 w-4" /> Russian
                      </TabsTrigger>
                      <TabsTrigger
                        value="en"
                        className="flex items-center gap-2"
                      >
                        <Languages className="h-4 w-4" /> English
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="uz" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="title_uz">
                          {t("productManagement.titleLabel")} (Uzbek)
                        </Label>
                        <Input
                          id="title_uz"
                          value={formData.title_uz}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              title_uz: e.target.value,
                            })
                          }
                          placeholder={t("placeholderTitle")}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description_uz">
                          {t("productManagement.descriptionLabel")} (Uzbek)
                        </Label>
                        <Textarea
                          id="description_uz"
                          value={formData.description_uz}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description_uz: e.target.value,
                            })
                          }
                          rows={4}
                          placeholder="Mahsulot haqida tavsif yozing"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="ru" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="title_ru">
                          {t("productManagement.titleLabel")} (Russian)
                        </Label>
                        <Input
                          id="title_ru"
                          value={formData.title_ru}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              title_ru: e.target.value,
                            })
                          }
                          placeholder={t("placeholderTitle")}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description_ru">
                          {t("productManagement.descriptionLabel")} (Russian)
                        </Label>
                        <Textarea
                          id="description_ru"
                          value={formData.description_ru}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description_ru: e.target.value,
                            })
                          }
                          rows={4}
                          placeholder="Напишите описание продукта"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="en" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="title_en">
                          {t("productManagement.titleLabel")} (English)
                        </Label>
                        <Input
                          id="title_en"
                          value={formData.title_en}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              title_en: e.target.value,
                            })
                          }
                          placeholder={t("placeholderTitle")}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description_en">
                          {t("productManagement.descriptionLabel")} (English)
                        </Label>
                        <Textarea
                          id="description_en"
                          value={formData.description_en}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description_en: e.target.value,
                            })
                          }
                          rows={4}
                          placeholder="Write product description"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Price + Category + Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">
                            {t("productManagement.price")}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="price"
                              type="text"
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  price: e.target.value,
                                })
                              }
                              placeholder="Ex: 50000"
                              required
                              disabled={isSubmitting}
                            />
                            {selectedCurrency && (
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                ({selectedCurrency.name_en})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="old_price">
                            {t("productManagement.oldPrice")}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="old_price"
                              type="text"
                              value={formData.old_price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  old_price: e.target.value,
                                })
                              }
                              placeholder="Ex: 55000"
                              disabled={isSubmitting}
                            />
                            {selectedCurrency && (
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                ({selectedCurrency.name_en})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <CategorySelector
                          selectedCategory={formData.category}
                          onCategoryChange={(categoryId) =>
                            setFormData({ ...formData, category: categoryId })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ImageUploader
                        images={uploadImages.images}
                        onImagesChange={(images) => setUploadImages({ images })}
                        imagePreviews={imagePreviews}
                        onPreviewsChange={setImagePreviews}
                        productId={editingItem?.id || null}
                        uploadMode={uploadMode}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingItem(null);
                        setFormData(blankForm);
                        setImagePreviews([]);
                      }}
                      disabled={isSubmitting}
                    >
                      {t("productManagement.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                          {editingItem
                            ? t("productManagement.updating")
                            : t("productManagement.creating")}
                        </>
                      ) : editingItem ? (
                        t("productManagement.update")
                      ) : (
                        t("productManagement.create")
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Product Table */}
        <Card>
          <div className="flex flex-wrap justify-between px-2">
            <CardHeader className="w-full">
              <CardTitle>{t("productManagement.productList")}</CardTitle>
              <CardDescription>
                {t("productManagement.description")}
              </CardDescription>
            </CardHeader>
            {/* Currency Info Display */}
            <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-2 pl-6 md:pl-0">
                <Label htmlFor="category-filter">{t("category")}</Label>
                <select
                  id="category-filter"
                  value={filterCategory || 0}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFilterCategory(value === 0 ? null : value);
                  }}
                  className="border rounded-md px-3 py-2"
                >
                  <option value={0}>{t("allCategories")}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("productManagement.id")}</TableHead>
                    <TableHead>{t("productManagement.image")}</TableHead>
                    <TableHead>{t("productManagement.titleLabel")}</TableHead>
                    <TableHead>
                      {t("productManagement.descriptionLabel")}
                    </TableHead>
                    <TableHead>{t("productManagement.price")}</TableHead>
                    <TableHead>{t("features")}</TableHead>
                    <TableHead className="text-right">
                      {t("productManagement.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t("productManagement.noProducts")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((prod) => (
                      <TableRow key={prod.id}>
                        <TableCell>{prod.id}</TableCell>
                        <TableCell>
                          {prod.images && prod.images.length > 0 ? (
                            <div className="relative w-12 h-12 rounded overflow-hidden">
                              <img
                                src={normalizeImageUrl(prod.images[0].image)}
                                alt={"pic"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </TableCell>
                        <TableCell>{prod.title}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {prod.description}
                        </TableCell>
                        <TableCell>
                          {/* CHANGED: Use formatPrice instead of raw price */}
                          {formatPrice(prod.price)}
                        </TableCell>
                        <TableCell>
                          {prod.features?.length || 0} {t("features")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openFeatureDialog(prod.id)}
                              title={t("productManagement.addFeatures")}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(prod)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(prod.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Feature & Color dialog content */}
        <Dialog
          open={isFeatureDialogOpen}
          onOpenChange={setIsFeatureDialogOpen}
        >
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle>
                {t("productManagement.addFeaturesColors")}
              </DialogTitle>
              <DialogDescription>
                {t("productManagement.addFeaturesDescription")}
              </DialogDescription>
            </DialogHeader>

            {selectedProductId && (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">
                    {t("managefeatures")} {selectedProductId}
                  </h3>
                </div>
                <FeatureSelector
                  selectedFeatures={[]}
                  onFeaturesChange={(features) => {
                    setProductData((prev) =>
                      prev.map((p) =>
                        p.id === selectedProductId ? { ...p, features } : p
                      )
                    );
                  }}
                  productId={selectedProductId}
                />

                <div className="my-6 border-t border-gray-200" />

                {/* Color management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t("colors")}</h3>
                    <Button
                      onClick={() => setIsColorSelectorOpen(true)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" /> {t("addColor")}
                    </Button>
                  </div>

                  {/* Color selector */}
                  {isColorSelectorOpen && (
                    <div className="p-4 border rounded-lg bg-muted/30 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">
                          {t("productManagement.selectColor")}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsColorSelectorOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <ColorSelector
                        selectedColors={selectedColors}
                        onColorsChange={setSelectedColors}
                        productId={selectedProductId || 0}
                        singleSelect={true}
                      />

                      {selectedColors.length > 0 && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => {
                              const color = selectedColors[0];
                              handleAddColor(
                                color.colorId,
                                color.image,
                                color.price
                              );
                            }}
                            disabled={selectedColors.some(
                              (color) => !color.price || !color.image
                            )}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t("productManagement.addColor")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Display product colors */}
                  <div className="space-y-3">
                    {productColors.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        {t("productManagement.noColorsAdded")}
                      </p>
                    ) : (
                      productColors.map((productColor) => {
                        const color = colors.find(
                          (c) => c.id === productColor.color
                        );
                        return (
                          <div
                            key={productColor.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {productColor.image && (
                                <div className="relative w-10 h-10 rounded overflow-hidden">
                                  <img
                                    src={normalizeImageUrl(productColor.image)}
                                    alt={
                                      color?.name_en ||
                                      `Color ${productColor.color}`
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {color?.color_image && (
                                <div className="relative w-10 h-10 rounded overflow-hidden">
                                  <img
                                    src={normalizeImageUrl(color.color_image)}
                                    alt={color.name_en}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">
                                  {color?.name || `Color ${productColor.color}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {/* CHANGED: Use formatPrice for color price display */}
                                  {formatPrice(productColor.price)}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveColor(productColor.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFeatureDialogOpen(false);
                  setSelectedProductId(null);
                  setSelectedColors([]);
                  setIsColorSelectorOpen(false);
                  fetchProductData();
                }}
              >
                {t("productManagement.done")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Grid */}
        {productData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("productManagement.productGallery")}</CardTitle>
              <CardDescription>
                {t("productManagement.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {productData.map((prod) => (
                  <div
                    key={prod.id}
                    className="relative aspect-video border rounded-lg overflow-hidden group"
                  >
                    <img
                      src={
                        prod.images[0]
                          ? normalizeImageUrl(prod.images[0].image)
                          : "/placeholder.svg"
                      }
                      alt={"pic"}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white p-3">
                      <div className="font-semibold text-sm mb-1 w-[550px]">
                        {prod.title}
                      </div>
                      <div className="text-xs opacity-90">
                        {/* CHANGED: Use formatPrice instead of $ */}
                        {formatPrice(prod.price)} • {prod.colors?.length || 0} colors •{" "}
                        {prod.features?.length || 0} features
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}

export default function ProductManagement() {
  return (
    <CategoriesProvider>
      <ColorsProvider>
        <FeaturesProvider>
          <TypesProvider>
            <ProductColorsProvider>
              <ProductManagementContent />
            </ProductColorsProvider>
          </TypesProvider>
        </FeaturesProvider>
      </ColorsProvider>
    </CategoriesProvider>
  );
}