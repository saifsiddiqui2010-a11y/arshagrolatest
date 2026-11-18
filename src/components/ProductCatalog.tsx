import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Eye, 
  Star, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Zap,
  Droplet,
  MessageCircle,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { MILL_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { WebsiteContentSection } from '../services/websiteContent';

interface ProductCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product, size: string) => void;
  searchQuery: string;
  content?: WebsiteContentSection;
  isLoading?: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onSelectProduct,
  onBuyNow,
  searchQuery,
  content,
  isLoading = false,
}) => {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});
  const [addedAnimation, setAddedAnimation] = useState<{ [productId: string]: boolean }>({});

  const categoryShowcase = [
    { id: 'yellow-mustard', title: 'Yellow Mustard Oil', description: 'Everyday goodness, cold pressed.' },
    { id: 'kachi-ghani', title: 'Black Kachi Ghani', description: 'Bold aroma for traditional cooking.' },
    { id: 'mustard-cake', title: 'Sarso Khali', description: 'Mustard cake, a useful natural byproduct.' },
  ].flatMap((category) => {
    const product = products.find((entry) => entry.category === category.id);
    return product ? [{ ...category, product }] : [];
  });
  const featuredProductIds = new Set(categoryShowcase.map(({ product }) => product.id));
  const showcaseCategories = [
    ...categoryShowcase,
    ...products
      .filter((product) => !featuredProductIds.has(product.id))
      .slice(0, Math.max(0, 3 - categoryShowcase.length))
      .map((product) => ({
        id: product.id,
        title: product.name,
        description: product.description,
        product,
      })),
  ].slice(0, 3);
  const showFullCatalog = isCatalogExpanded || Boolean(searchQuery);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'yellow-mustard', label: 'Peeli Sarso (Yellow)' },
    { id: 'kachi-ghani', label: 'Black Kachi Ghani' },
    { id: 'mustard-cake', label: 'Sarso Khali Fertilizer' },
    { id: 'combo-packs', label: 'Family Combos & 10L' },
  ];

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.size.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    const chosenSize = selectedSizes[product.id] || product.size;
    addToCart(product, chosenSize, 1);

    // Animation trigger
    setAddedAnimation((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedAnimation((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const getWhatsAppProductLink = (product: Product) => {
    const size = selectedSizes[product.id] || product.size;
    const msg = encodeURIComponent(
      `Hello Arsh Agro Industry, I would like to order *${product.name}* (Size: ${size}, Price: ₹${product.price}). Please share payment and delivery details!`
    );
    return `https://wa.me/${MILL_WHATSAPP_NUMBER}?text=${msg}`;
  };

  return (
    <section id="products" className="scroll-mt-16 border-t border-amber-100/70 bg-gradient-to-b from-[#f8f5ea] to-[#f3efdf] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-5 text-center sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full mb-2">
              <Droplet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{content?.eyebrow || 'Direct Mill Bottling'}</span>
            </div>
            <h2 className="store-section-heading font-serif-heading text-xl font-black text-stone-900 sm:text-3xl md:text-4xl">
              {content?.title || 'Shop Pure Cold-Pressed Oils'}
            </h2>
            <p className="mx-auto mt-1 max-w-xl text-xs text-stone-600 sm:text-base">
              {content?.subtitle || 'Select your favorite packaging size — from daily 500ml & 1L kitchen packs to heavy-duty 5L & 10L family cans.'}
            </p>
            {content?.body && <p className="mt-2 text-[10px] font-semibold text-emerald-800 sm:text-xs">{content.body}</p>}
          </div>
        </div>

        {/* Product category showcase */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-5">
            {[0, 1, 2].map((key) => (
              <div key={key} className="overflow-hidden rounded-xl border border-amber-100 bg-white p-2 sm:rounded-2xl sm:p-4">
                <div className="aspect-[4/3] animate-pulse rounded-lg bg-amber-50 sm:rounded-xl" />
                <div className="mt-2 h-3 animate-pulse rounded bg-stone-100 sm:mt-4 sm:h-4" />
                <div className="mt-2 h-2 w-3/4 animate-pulse rounded bg-stone-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-5">
            {showcaseCategories.map(({ id, title, description, product }) => (
              <article key={id} className="store-card group overflow-hidden rounded-xl bg-white sm:rounded-2xl">
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="block w-full text-left"
                  aria-label={`View ${title}`}
                >
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-[#fbf7e9] to-[#f1ead3] p-2 sm:p-5">
                    <span className="absolute left-2 top-2 rounded-full bg-emerald-950 px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-white sm:left-3 sm:top-3 sm:text-[9px]">
                      Best seller
                    </span>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 pb-0 sm:p-4 sm:pb-2">
                    <h3 className="line-clamp-2 min-h-8 text-[10px] font-extrabold leading-tight text-stone-900 sm:min-h-0 sm:text-base sm:leading-snug">
                      {title}
                    </h3>
                    <p className="mt-1 hidden text-xs leading-relaxed text-stone-600 sm:block">{description}</p>
                  </div>
                </button>
                <div className="flex items-end justify-between gap-1 p-2 sm:p-4 sm:pt-2">
                  <div>
                    <p className="text-[9px] text-stone-400 line-through sm:text-xs">₹{product.mrp}</p>
                    <p className="text-sm font-black text-emerald-950 sm:text-lg">₹{product.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-800 px-2 text-[8px] font-black text-white shadow-sm transition-colors hover:bg-emerald-950 sm:h-10 sm:px-4 sm:text-xs"
                    aria-label={`Add ${title} to cart`}
                  >
                    <ShoppingBag className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-4 text-center sm:mt-6">
          <button
            type="button"
            onClick={() => setIsCatalogExpanded((expanded) => !expanded)}
            aria-expanded={showFullCatalog}
            disabled={Boolean(searchQuery)}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-800/25 bg-white px-4 py-2 text-xs font-bold text-emerald-900 transition-colors hover:bg-emerald-50"
          >
            {searchQuery ? 'Search results shown' : showFullCatalog ? 'Show featured categories' : `View all ${products.length} products`}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFullCatalog ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFullCatalog && (
          <>
            {/* Category Pills */}
            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25'
                      : 'border border-emerald-100 bg-white text-stone-700 hover:bg-emerald-50 hover:text-emerald-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 py-16 text-center">
                <Droplet className="mx-auto mb-3 h-12 w-12 text-stone-300" />
                <h3 className="text-lg font-bold text-stone-800">No products match your search</h3>
                <p className="mt-1 text-sm text-stone-500">Try clearing your search query or selecting &quot;All Products&quot;</p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
                >
                  Show All Products
                </button>
              </div>
            )}

            {/* Product Grid */}
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const currentSelectedSize = selectedSizes[product.id] || product.size;
            const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);
            const isAdded = addedAnimation[product.id];

            return (
              <div
                key={product.id}
                className="store-card overflow-hidden rounded-2xl bg-white transition-all duration-300 flex flex-col group sm:rounded-3xl"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-4/3 overflow-hidden bg-gradient-to-br from-[#fbf7e9] to-emerald-50/70">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 sm:p-4"
                    loading="lazy"
                  />

                  {/* Discount Tag */}
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-xs">
                      {discountPercent}% OFF
                    </div>
                  )}

                  {/* Category / Feature Tag */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-stone-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow-2xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="capitalize">{product.category.replace('-', ' ')}</span>
                  </div>

                  {/* Quick View Button on Hover */}
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white/90 text-stone-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white hover:text-emerald-700"
                    title="Quick View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                {/* Content Body */}
                <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-5">
                  <div>
                    {/* Rating & Lab Tested Tag */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-stone-400 font-normal">({product.reviewCount})</span>
                      </div>
                      <span className="hidden text-[11px] font-semibold text-emerald-700 sm:flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Zero Argemone
                      </span>
                    </div>

                    {/* Product Title */}
                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="text-base font-bold text-stone-900 leading-snug hover:text-emerald-800 cursor-pointer transition-colors line-clamp-2 mb-2"
                    >
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                      {product.description}
                    </p>

                    {/* Pack size indicator */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-semibold text-stone-600">Pack Size:</span>
                      <span className="text-xs font-extrabold bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {currentSelectedSize}
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 border-t border-stone-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-emerald-950">
                            ₹{product.price}
                          </span>
                          <span className="text-xs font-semibold text-stone-400 line-through">
                            ₹{product.mrp}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 font-medium">Inclusive of all taxes</p>
                      </div>

                      {/* Stock Indicator */}
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        In Stock ({product.stockCount})
                      </span>
                    </div>

                    {/* Action Buttons (Add to Cart & Buy Now) */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-800 text-white'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onBuyNow(product, currentSelectedSize)}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Buy Now</span>
                      </button>
                    </div>

                    {/* WhatsApp Quick Order Link */}
                    <a
                      href={getWhatsAppProductLink(product)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-1.5 px-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Order on WhatsApp</span>
                    </a>

                  </div>
                </div>

              </div>
            );
          })}
            </div>
          </>
        )}

      </div>
    </section>
  );
};
