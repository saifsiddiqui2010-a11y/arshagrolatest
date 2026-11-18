import { doc, getDocFromServer, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type WebsiteSectionType =
  | 'hero'
  | 'trust'
  | 'products'
  | 'process'
  | 'comparison'
  | 'wholesale'
  | 'reviews'
  | 'custom';

export type WebsiteSectionLayout = 'standard' | 'split' | 'cards' | 'banner';

export interface WebsiteContentItem {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  label: string;
  detail: string;
  rating: number;
}

export interface WebsiteContentSection {
  id: string;
  type: WebsiteSectionType;
  visible: boolean;
  layout: WebsiteSectionLayout;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  items: WebsiteContentItem[];
}

export interface WebsiteBannerSlide {
  id: string;
  imageUrl: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  visible: boolean;
}

export interface WebsiteContent {
  seo: {
    title: string;
    description: string;
  };
  sections: WebsiteContentSection[];
  header: {
    brandName: string;
    tagline: string;
    bannerEnabled: boolean;
    bannerSlides: WebsiteBannerSlide[];
    navigation: {
      home: string;
      shop: string;
      process: string;
      comparison: string;
      labReports: string;
      trackOrder: string;
      wholesale: string;
    };
  };
  footer: {
    description: string;
    address: string;
    phone: string;
    email: string;
    offerings: string[];
  };
}

const item = (
  id: string,
  title: string,
  body = '',
  subtitle = '',
  label = '',
  detail = '',
  rating = 5
): WebsiteContentItem => ({
  id,
  title,
  subtitle,
  body,
  imageUrl: '',
  label,
  detail,
  rating,
});

export const defaultWebsiteContent: WebsiteContent = {
  seo: {
    title: 'Arsh Agro Industry | ArshSarso Pure Cold Pressed Mustard Oil',
    description: 'Official store for Arsh Agro Industry and ArshSarso. Buy 100% pure, unrefined, cold-pressed Kachi Ghani and Peeli Sarso mustard oil directly from Siwan, Bihar.',
  },
  header: {
    brandName: 'ARSH AGRO INDUSTRY',
    tagline: 'Arsh Sarso • Pure • Unrefined • Farm to Bottle',
    bannerEnabled: true,
    bannerSlides: [
      {
        id: 'banner-pure-oil',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1800&q=85',
        eyebrow: 'Fresh from the mill',
        title: 'Pure. Pungent. Traditionally Cold Pressed.',
        subtitle: 'Authentic mustard oil, naturally settled and sealed fresh for your family.',
        ctaLabel: 'Shop Mustard Oil',
        ctaUrl: '#products',
        visible: true,
      },
      {
        id: 'banner-family-can',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85',
        eyebrow: 'For everyday kitchens',
        title: 'Family Packs, Direct from Bihar',
        subtitle: 'Choose from 1L kitchen packs to 5L and 10L family cans.',
        ctaLabel: 'View All Packs',
        ctaUrl: '#products',
        visible: true,
      },
      {
        id: 'banner-wholesale',
        imageUrl: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec99?auto=format&fit=crop&w=1800&q=85',
        eyebrow: 'Wholesale & dealership',
        title: 'Grow Your Store with ArshSarso',
        subtitle: 'GST-ready bulk supply, direct mill dispatch and volume pricing.',
        ctaLabel: 'Request Rate Card',
        ctaUrl: '#wholesale',
        visible: true,
      },
    ],
    navigation: {
      home: 'Home',
      shop: 'Shop Oil',
      process: 'Cold-Press Process',
      comparison: 'Why ArshSarso',
      labReports: 'Lab Reports & FSSAI',
      trackOrder: 'Track Order',
      wholesale: 'B2B Wholesale',
    },
  },
  footer: {
    description: 'Based in Siwan, Bihar, Arsh Agro Industry is dedicated to reviving native Indian cold-pressing traditions. We extract 100% pure Kachi Ghani and Peeli Sarso mustard oil under 45°C with 48-hour gravity sedimentation, delivering authentic aroma and unadulterated heart nutrition.',
    address: 'Arsh Agro Industry, Hathaura, Hussainganj, Siwan, Bihar - 841237, India',
    phone: '+91 84474 23416',
    email: 'sales@arshagroindustry.com',
    offerings: [
      'Peeli Sarso (Yellow Mustard) 1L',
      'Peeli Sarso Oil 5L Family Can',
      'Traditional Black Kachi Ghani 1L',
      'Traditional Black Kachi Ghani 5L',
      'Sarso Khali (Organic Fertilizer) 5kg',
      '10L Family Master Box (2x5L)',
      '200ml Trial Glass Bottle',
    ],
  },
  sections: [
    {
      id: 'hero',
      type: 'hero',
      visible: true,
      layout: 'standard',
      eyebrow: 'PURE • UNREFINED • FARM TO BOTTLE',
      title: 'From Our Fields to',
      subtitle: "Your Family's Table",
      body: 'Grown with care on our own farms, sourced alongside local farmers, and traditionally cold pressed to bring the authentic taste of mustard oil to your kitchen.',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
      ctaLabel: 'Shop Mustard Oil',
      ctaUrl: '#products',
      items: [
        item('hero-feature-1', 'Wood-Cold Churned'),
        item('hero-feature-2', 'Zero Argemone Adulteration'),
        item('hero-feature-3', 'Siwan, Bihar Mill Direct'),
        item('hero-metric-1', '< 45°C', '', 'Cold Press Temperature'),
        item('hero-metric-2', '0%', '', 'Argemone & Chemicals'),
        item('hero-metric-3', '48 Hours', '', 'Natural Steel Sedimentation'),
        item('hero-metric-4', '10,000+', '', 'Happy Households Across India'),
      ],
    },
    {
      id: 'trust',
      type: 'trust',
      visible: true,
      layout: 'standard',
      eyebrow: 'The Arsh Agro Standard',
      title: 'Why ArshSarso Is Different From Regular Market Oil',
      subtitle: '',
      body: '',
      imageUrl: '',
      ctaLabel: '',
      ctaUrl: '',
      items: [
        item('native-seeds', 'Our Own Cultivation', 'Mustard grown with care from selected seeds.'),
        item('cold-churned', 'Local Farmer Partnerships', 'Working directly with local mustard farmers.'),
        item('gravity-settling', 'Traditional Cold Pressing', 'Slow pressing helps preserve the oil’s natural aroma.'),
        item('purity', 'Rich Aroma & Bold Flavour', 'Traditional mustard taste for everyday cooking.'),
      ],
    },
    {
      id: 'products',
      type: 'products',
      visible: true,
      layout: 'standard',
      eyebrow: 'Our Products',
      title: 'Explore the Arsh Sarso Range',
      subtitle: 'Pure mustard oil and farm products, made for every kitchen.',
      body: 'All stock fresh batch from Siwan Mill',
      imageUrl: '',
      ctaLabel: '',
      ctaUrl: '',
      items: [],
    },
    {
      id: 'farm-story',
      type: 'custom',
      visible: true,
      layout: 'split',
      eyebrow: 'OUR FARM STORY',
      title: 'Rooted in Our Fields. Strengthened by Our Farmers.',
      subtitle: '',
      body: 'We cultivate our own mustard seeds and work closely with local farmers to ensure quality, traceability, and a steady supply of the finest harvest.',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
      ctaLabel: 'Know Our Story',
      ctaUrl: '#process',
      items: [],
    },
    {
      id: 'process',
      type: 'process',
      visible: true,
      layout: 'standard',
      eyebrow: 'Our Process',
      title: 'THE JOURNEY - Seed to Bottle',
      subtitle: 'A careful, traditional process that preserves mustard oil’s natural aroma and character.',
      body: '',
      imageUrl: '',
      ctaLabel: '',
      ctaUrl: '',
      items: [
        item('step-1', '1. Seed Selection', 'Carefully chosen directly from Bihar native mustard farmers. Every batch is air-cleaned and winnowed to eliminate dust, wild seeds, and immature grains, retaining only high-oil golden and black seeds.', 'Seed Selection', '100% Native Grains'),
        item('step-2', '2. Cold Pressing', 'Crushed mechanically at ultra-slow RPM without friction heat. Oil temperature strictly never exceeds 45°C, ensuring vital antioxidants (tocopherols), natural Vitamin E, and pungent allyl isothiocyanate are never destroyed.', 'Cold Pressing', 'Zero Thermal Stress'),
        item('step-3', '3. Natural Settling', 'Unlike commercial refineries that treat raw oil with sulfuric acid, caustic soda, and synthetic bleaching earths, ArshSarso rests in stainless steel tanks for 48 hours. Micro-sediments naturally drop by gravity, leaving crystal clear golden oil.', 'Natural Settling', 'Zero Bleaching Agents'),
        item('step-4', '4. Honest Packaging', 'Packed into virgin food-grade, BPA-free containers and cans. Induction heat-sealed to prevent oxidation and moisture ingress, preserving farm-fresh pungent aroma until the last drop in your kitchen.', 'Honest Packaging', 'Hermetic Freshness'),
      ],
    },
    {
      id: 'comparison',
      type: 'comparison',
      visible: true,
      layout: 'standard',
      eyebrow: 'Health & Purity Face-Off',
      title: 'ArshSarso vs Common Refined Oil',
      subtitle: 'Understand exactly what goes into your family’s daily cooking oil.',
      body: '',
      imageUrl: '',
      ctaLabel: '',
      ctaUrl: '',
      items: [
        item('extraction', 'Extraction Technique', 'Slow Mechanical Cold Churning (Wood Kolhu / Ghani style)', '', '', 'Chemical Hexane Solvent Extraction & high-pressure expellers'),
        item('temperature', 'Max Extraction Temperature', 'Strictly Below 45°C (Zero thermal breakdown)', '', '', 'Exceeds 200°C (Generates trans fats & destroys nutrients)'),
        item('clarification', 'Refining & Clarification', '48-Hour Natural Gravity Sedimentation in SS304 Steel Tanks', '', '', 'Treated with Caustic Soda, Bleaching Earths & Deodorizers'),
        item('pungency', 'Natural Pungency (Jhaar)', '100% Intact Allyl Isothiocyanate from native seeds', '', '', 'Loss of natural aroma; often reinforced with synthetic flavor'),
        item('nutrition', 'Vitamin E & Omega-3 Content', 'Fully Preserved (Natural Tocopherols & Healthy MUFA)', '', '', 'Significantly degraded due to intense heat processing'),
        item('adulteration', 'Argemone Oil Adulteration', 'Guaranteed 0% (Every batch tested & certified negative)', '', '', 'Variable purity in unbranded, bulk market oils'),
      ],
    },
    {
      id: 'wholesale',
      type: 'wholesale',
      visible: true,
      layout: 'standard',
      eyebrow: 'Direct Mill Supply & Dealership',
      title: 'Wholesale & Bulk Supply For Distributors, Stores & HoReCa',
      subtitle: 'Request Wholesale Rate Card',
      body: 'Are you an organic retail chain, supermarket, oil distributor, or gourmet restaurant? Arsh Agro Industry supplies bulk unrefined cold-pressed Peeli Sarso & Kachi Ghani mustard oil and organic Sarso Khali with direct dispatch from Siwan, Bihar across India.',
      imageUrl: '',
      ctaLabel: 'Submit Wholesale Request',
      ctaUrl: '#wholesale',
      items: [],
    },
    {
      id: 'reviews',
      type: 'reviews',
      visible: true,
      layout: 'standard',
      eyebrow: '4.9 / 5.0 Rating from 1,200+ Reviews',
      title: 'Loved By Families & Traditional Kitchens',
      subtitle: 'Real feedback from verified customers cooking daily with ArshSarso.',
      body: '',
      imageUrl: '',
      ctaLabel: '',
      ctaUrl: '',
      items: [
        item('review-1', 'Real traditional aroma that reminds me of childhood village oil', 'We have been searching for unadulterated cold pressed Peeli Sarso oil for years. ArshSarso has that unmistakable golden clarity and real pungent aroma without choking smoke. Our fish curry and aloo gobhi taste completely authentic now!', 'Anita Mishra', 'ArshSarso Pure Yellow Mustard Oil - 5L', 'Patna, Bihar'),
        item('review-2', 'Lab tested pure with zero chemical residues - heart healthy', 'As a physician, I look closely at lipid profiles and processing methods. Most packaged market oils are refined using chemical solvents. Arsh Agro Industry uses genuine cold sedimentation under 45°C. Highly recommend for natural MUFA.', 'Dr. Alok Srivastava', 'ArshSarso 1 Litre Peeli Sarso Pack', 'Varanasi, UP'),
        item('review-3', 'Unbeatable pungent jhaar for Bengali Hilsa and Mustard curries', 'The traditional Black Kachi Ghani has the exact pungent kick needed for authentic Bengali preparations and mango pickles. Packaging was rock solid with zero leaks during transit to Kolkata.', 'Sunita & Rameshwar Roy', 'ArshSarso Traditional Kachi Ghani - 5 Litre Can', 'Kolkata, WB'),
        item('review-4', 'Sarso Khali turned my terrace organic vegetable garden lush green', 'Bought the 5kg Sarso Khali fertilizer alongside the oil. Soaked a handful in water and applied to my tomato and chili plants; the yield doubled within a month. 100% pure organic byproduct.', 'Vikas Dubey', 'Arsh Sarso Khali (Organic Fertilizer) 5kg', 'Ranchi, Jharkhand'),
      ],
    },
  ],
};

const websiteContentRef = doc(db, 'settings', 'websiteContent');

const legacySectionText: Partial<Record<string, Partial<Pick<WebsiteContentSection, 'eyebrow' | 'title' | 'subtitle'>>>> = {
  products: {
    eyebrow: 'Direct Mill Bottling',
    title: 'Shop Pure Cold-Pressed Oils',
    subtitle: 'Select your favorite packaging size — from daily 500ml & 1L kitchen packs to heavy-duty 5L & 10L family cans.',
  },
  process: {
    eyebrow: 'Farm to Bottle Extraction Workflow',
    title: 'The 4-Step Cold Extraction & Sedimentation Technology',
    subtitle: 'How Arsh Agro Industry produces authentic, pungent, nutrient-dense mustard oil without a single drop of chemical additives or refining agents.',
  },
};

const legacyTrustTitles: Record<string, string> = {
  'native-seeds': 'Native Grade Bihar Seeds',
  'cold-churned': 'Cold Churned (<45°C)',
  'gravity-settling': '48-Hour Gravity Settling',
  purity: 'Zero Argemone Adulteration',
};

const legacyProcessText: Record<string, { title?: string; subtitle?: string }> = {
  'step-1': { title: 'Native Grade Mustard Seeds' },
  'step-2': { title: 'Slow Cold Churning (<45°C)', subtitle: 'Traditional Low RPM Wood Kolhu' },
  'step-3': { title: '48-Hour Natural Sedimentation', subtitle: 'Gravity Settling in SS304 Tanks' },
  'step-4': { title: 'Hygienic Bottling & Sealing', subtitle: 'Induction Leak-Proof Packaging' },
};

const mergeWebsiteContent = (savedContent?: Partial<WebsiteContent>): WebsiteContent => {
  if (!savedContent) return defaultWebsiteContent;
  const defaultSections = new Map(defaultWebsiteContent.sections.map((section) => [section.id, section]));
  const sections = savedContent.sections?.map((section) => {
    const defaults = defaultSections.get(section.id);
    return {
      ...defaults,
      ...section,
      items: section.items?.map((savedItem) => ({
        ...defaults?.items.find((defaultItem) => defaultItem.id === savedItem.id),
        ...savedItem,
      })) || defaults?.items || [],
    } as WebsiteContentSection;
  }) || [...defaultWebsiteContent.sections];
  const sectionIds = new Set(sections.map((section) => section.id));
  defaultWebsiteContent.sections.forEach((defaultSection, index) => {
    if (sectionIds.has(defaultSection.id)) return;
    const nextSectionId = defaultWebsiteContent.sections
      .slice(index + 1)
      .find((section) => sectionIds.has(section.id))?.id;
    const insertionIndex = nextSectionId
      ? sections.findIndex((section) => section.id === nextSectionId)
      : sections.length;
    sections.splice(insertionIndex, 0, defaultSection);
    sectionIds.add(defaultSection.id);
  });
  sections.forEach((section) => {
    const defaults = defaultSections.get(section.id);
    const legacy = legacySectionText[section.id];
    if (defaults && legacy) {
      (['eyebrow', 'title', 'subtitle'] as const).forEach((field) => {
        if (legacy[field] && section[field] === legacy[field]) {
          section[field] = defaults[field];
        }
      });
    }
    if (section.id === 'trust' && defaults) {
      section.items = section.items.map((savedItem) => {
        const defaultItem = defaults.items.find((item) => item.id === savedItem.id);
        return legacyTrustTitles[savedItem.id] === savedItem.title && defaultItem
          ? { ...savedItem, title: defaultItem.title }
          : savedItem;
      });
    }
    if (section.id === 'process' && defaults) {
      section.items = section.items.map((savedItem) => {
        const defaultItem = defaults.items.find((item) => item.id === savedItem.id);
        const legacyItem = legacyProcessText[savedItem.id];
        if (!defaultItem || !legacyItem) return savedItem;
        return {
          ...savedItem,
          ...(legacyItem.title === savedItem.title ? { title: defaultItem.title } : {}),
          ...(legacyItem.subtitle === savedItem.subtitle ? { subtitle: defaultItem.subtitle } : {}),
        };
      });
    }
  });
  return {
    ...defaultWebsiteContent,
    ...savedContent,
    seo: { ...defaultWebsiteContent.seo, ...savedContent.seo },
    header: {
      ...defaultWebsiteContent.header,
      ...savedContent.header,
      bannerSlides: savedContent.header?.bannerSlides?.length
        ? savedContent.header.bannerSlides
        : defaultWebsiteContent.header.bannerSlides,
      bannerEnabled: savedContent.header?.bannerEnabled ?? defaultWebsiteContent.header.bannerEnabled,
      navigation: {
        ...defaultWebsiteContent.header.navigation,
        ...savedContent.header?.navigation,
      },
    },
    footer: {
      ...defaultWebsiteContent.footer,
      ...savedContent.footer,
      offerings: savedContent.footer?.offerings || defaultWebsiteContent.footer.offerings,
    },
    sections,
  };
};

export const getWebsiteContent = async (): Promise<WebsiteContent> => {
  const snapshot = await getDocFromServer(websiteContentRef);
  return mergeWebsiteContent(snapshot.exists() ? snapshot.data() as Partial<WebsiteContent> : undefined);
};

export const subscribeToWebsiteContent = (
  onContent: (content: WebsiteContent) => void,
  onError: (error: Error) => void
) =>
  onSnapshot(
    websiteContentRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.fromCache) return;
      onContent(mergeWebsiteContent(
        snapshot.exists() ? snapshot.data() as Partial<WebsiteContent> : undefined
      ));
    },
    onError
  );

export const saveWebsiteContent = (content: WebsiteContent) =>
  setDoc(websiteContentRef, content);
