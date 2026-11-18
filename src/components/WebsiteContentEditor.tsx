import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, Save, Trash2 } from 'lucide-react';
import {
  defaultWebsiteContent,
  getWebsiteContent,
  saveWebsiteContent,
  WebsiteContent,
  WebsiteBannerSlide,
  WebsiteContentItem,
  WebsiteContentSection,
  WebsiteSectionLayout,
} from '../services/websiteContent';
import { ImageUploadField } from './ImageUploadField';

const sectionLabels: Record<WebsiteContentSection['type'], string> = {
  hero: 'Homepage hero',
  trust: 'Trust badges',
  products: 'Product catalog',
  process: 'Cold-press process',
  comparison: 'Oil comparison',
  wholesale: 'Wholesale inquiry',
  reviews: 'Customer reviews',
  custom: 'Custom content',
};

const createId = () => `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createCustomSection = (): WebsiteContentSection => ({
  id: createId(),
  type: 'custom',
  visible: true,
  layout: 'split',
  eyebrow: 'New section',
  title: 'Your section title',
  subtitle: '',
  body: 'Add your website content here.',
  imageUrl: '',
  ctaLabel: '',
  ctaUrl: '#products',
  items: [],
});

const createItem = (): WebsiteContentItem => ({
  id: createId(),
  title: '',
  subtitle: '',
  body: '',
  imageUrl: '',
  label: '',
  detail: '',
  rating: 5,
});

const createBannerSlide = (): WebsiteBannerSlide => ({
  id: `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  imageUrl: '',
  eyebrow: 'New promotion',
  title: 'Your banner headline',
  subtitle: 'Add a short promotional message.',
  ctaLabel: 'Shop Now',
  ctaUrl: '#products',
  visible: true,
});

export const WebsiteContentEditor: React.FC = () => {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent);
  const [selectedId, setSelectedId] = useState(defaultWebsiteContent.sections[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeImageUploads, setActiveImageUploads] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getWebsiteContent()
      .then((savedContent) => {
        if (!active) return;
        setContent(savedContent);
        setSelectedId(savedContent.sections[0]?.id || '');
      })
      .catch((loadError: unknown) => {
        console.error('Could not load website content:', loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load website content.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedSection = content.sections.find((section) => section.id === selectedId);

  const updateSection = (sectionId: string, changes: Partial<WebsiteContentSection>) => {
    setContent((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...changes } : section
      ),
    }));
    setMessage('');
  };

  const updateItem = (itemId: string, changes: Partial<WebsiteContentItem>) => {
    if (!selectedSection) return;
    updateSection(selectedSection.id, {
      items: selectedSection.items.map((item) =>
        item.id === itemId ? { ...item, ...changes } : item
      ),
    });
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    const index = content.sections.findIndex((section) => section.id === sectionId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= content.sections.length) return;
    const sections = [...content.sections];
    [sections[index], sections[targetIndex]] = [sections[targetIndex], sections[index]];
    setContent({ ...content, sections });
    setMessage('');
  };

  const addSection = () => {
    const section = createCustomSection();
    setContent({ ...content, sections: [...content.sections, section] });
    setSelectedId(section.id);
    setMessage('');
  };

  const removeSection = (sectionId: string) => {
    const sections = content.sections.filter((section) => section.id !== sectionId);
    setContent({ ...content, sections });
    if (selectedId === sectionId) setSelectedId(sections[0]?.id || '');
    setMessage('');
  };

  const save = async () => {
    if (activeImageUploads > 0) return;
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      await saveWebsiteContent(content);
      setMessage('Published. Connected storefront pages update automatically.');
    } catch (saveError) {
      console.error('Could not save website content:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not save website content.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100';
  const labelClass = 'mb-1 block text-xs font-bold text-stone-700';

  if (isLoading) {
    return <p className="text-sm text-stone-600">Loading website content…</p>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.7fr)]">
      <aside className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-stone-900">Page sections</h4>
            <p className="mt-1 text-xs text-stone-500">Move sections, hide them, or add a custom section.</p>
          </div>
          <button onClick={addSection} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        <div className="space-y-2">
          {content.sections.map((section, index) => (
            <div key={section.id} className={`flex items-center gap-1 rounded-xl border p-2 ${selectedId === section.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200'}`}>
              <button
                onClick={() => setSelectedId(section.id)}
                className="min-w-0 flex-1 px-2 py-1 text-left"
              >
                <span className="block truncate text-sm font-bold text-stone-900">{section.title || sectionLabels[section.type]}</span>
                <span className="block text-[11px] text-stone-500">{sectionLabels[section.type]}{section.visible ? '' : ' • Hidden'}</span>
              </button>
              <button onClick={() => moveSection(section.id, -1)} disabled={index === 0} title="Move up" aria-label="Move section up" className="rounded-md p-1.5 text-stone-500 hover:bg-white disabled:opacity-30">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button onClick={() => moveSection(section.id, 1)} disabled={index === content.sections.length - 1} title="Move down" aria-label="Move section down" className="rounded-md p-1.5 text-stone-500 hover:bg-white disabled:opacity-30">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-stone-100 pt-4">
          <h5 className="mb-3 text-sm font-bold text-stone-900">Header & footer</h5>
          <label className={labelClass}>Browser page title</label>
          <input className={`${inputClass} mb-3`} value={content.seo.title} onChange={(event) => setContent({ ...content, seo: { ...content.seo, title: event.target.value } })} />
          <label className={labelClass}>Search description</label>
          <textarea className={`${inputClass} mb-3`} rows={2} value={content.seo.description} onChange={(event) => setContent({ ...content, seo: { ...content.seo, description: event.target.value } })} />
          <label className={labelClass}>Brand name</label>
          <input className={`${inputClass} mb-3`} value={content.header.brandName} onChange={(event) => setContent({ ...content, header: { ...content.header, brandName: event.target.value } })} />
          <label className={labelClass}>Brand tagline</label>
          <input className={`${inputClass} mb-3`} value={content.header.tagline} onChange={(event) => setContent({ ...content, header: { ...content.header, tagline: event.target.value } })} />
          <div className="mb-4 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
            <div>
              <p className="text-sm font-bold text-stone-900">Homepage banner</p>
              <p className="text-[11px] text-stone-500">Show the sliding banner below the header.</p>
            </div>
            <button
              type="button"
              onClick={() => setContent({ ...content, header: { ...content.header, bannerEnabled: !content.header.bannerEnabled } })}
              className={`relative h-6 w-11 rounded-full transition-colors ${content.header.bannerEnabled ? 'bg-emerald-700' : 'bg-stone-300'}`}
              aria-label="Toggle homepage banner"
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${content.header.bannerEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Banner slides</label>
              <button
                type="button"
                onClick={() => setContent({
                  ...content,
                  header: { ...content.header, bannerSlides: [...content.header.bannerSlides, createBannerSlide()] },
                })}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-2 py-1.5 text-[11px] font-bold text-emerald-800"
              >
                <Plus className="h-3 w-3" /> Add slide
              </button>
            </div>
            {content.header.bannerSlides.map((slide, index) => (
              <div key={slide.id} className="rounded-xl border border-stone-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-700">Slide {index + 1}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setContent({
                        ...content,
                        header: {
                          ...content.header,
                          bannerSlides: content.header.bannerSlides.map((entry) =>
                            entry.id === slide.id ? { ...entry, visible: !entry.visible } : entry
                          ),
                        },
                      })}
                      className="rounded p-1 text-stone-500 hover:bg-stone-100"
                      title={slide.visible ? 'Hide slide' : 'Show slide'}
                    >
                      {slide.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setContent({
                        ...content,
                        header: {
                          ...content.header,
                          bannerSlides: content.header.bannerSlides.filter((entry) => entry.id !== slide.id),
                        },
                      })}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                      title="Remove slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {(['eyebrow', 'title', 'subtitle', 'ctaLabel', 'ctaUrl'] as const).map((field) => (
                  <div key={field}>
                    <label className={labelClass}>
                      {{ eyebrow: 'Small heading', title: 'Headline', subtitle: 'Description', ctaLabel: 'Button label', ctaUrl: 'Button link' }[field]}
                    </label>
                    <input
                      className={inputClass}
                      value={slide[field]}
                      onChange={(event) => setContent({
                        ...content,
                        header: {
                          ...content.header,
                          bannerSlides: content.header.bannerSlides.map((entry) =>
                            entry.id === slide.id ? { ...entry, [field]: event.target.value } : entry
                          ),
                        },
                      })}
                    />
                  </div>
                ))}
                <ImageUploadField
                  value={slide.imageUrl}
                  folder="website"
                  onChange={(imageUrl) => setContent({
                    ...content,
                    header: {
                      ...content.header,
                      bannerSlides: content.header.bannerSlides.map((entry) =>
                        entry.id === slide.id ? { ...entry, imageUrl } : entry
                      ),
                    },
                  })}
                  onUploadingChange={(delta) => setActiveImageUploads((count) => Math.max(0, count + delta))}
                />
              </div>
            ))}
          </div>
          <label className={labelClass}>Navigation labels (one per line, in menu order)</label>
          <textarea
            className={`${inputClass} mb-3`}
            rows={7}
            value={Object.values(content.header.navigation).join('\n')}
            onChange={(event) => {
              const [home = '', shop = '', process = '', comparison = '', labReports = '', trackOrder = '', wholesale = ''] = event.target.value.split('\n');
              setContent({
                ...content,
                header: {
                  ...content.header,
                  navigation: { home, shop, process, comparison, labReports, trackOrder, wholesale },
                },
              });
            }}
          />
          <label className={labelClass}>Footer description</label>
          <textarea className={`${inputClass} mb-3`} rows={3} value={content.footer.description} onChange={(event) => setContent({ ...content, footer: { ...content.footer, description: event.target.value } })} />
          <label className={labelClass}>Business address</label>
          <input className={`${inputClass} mb-3`} value={content.footer.address} onChange={(event) => setContent({ ...content, footer: { ...content.footer, address: event.target.value } })} />
          <label className={labelClass}>Contact phone</label>
          <input className={`${inputClass} mb-3`} value={content.footer.phone} onChange={(event) => setContent({ ...content, footer: { ...content.footer, phone: event.target.value } })} />
          <label className={labelClass}>Contact email</label>
          <input className={inputClass} type="email" value={content.footer.email} onChange={(event) => setContent({ ...content, footer: { ...content.footer, email: event.target.value } })} />
          <label className={`${labelClass} mt-3`}>Footer product list (one item per line)</label>
          <textarea
            className={inputClass}
            rows={5}
            value={content.footer.offerings.join('\n')}
            onChange={(event) => setContent({ ...content, footer: { ...content.footer, offerings: event.target.value.split('\n') } })}
          />
        </div>
      </aside>

      <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {message && <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        {!selectedSection ? (
          <p className="text-sm text-stone-500">Select a section to edit, or add a custom section.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{sectionLabels[selectedSection.type]}</p>
                <h4 className="mt-1 text-lg font-bold text-stone-900">Edit section</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateSection(selectedSection.id, { visible: !selectedSection.visible })}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  {selectedSection.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {selectedSection.visible ? 'Hide section' : 'Show section'}
                </button>
                {selectedSection.type === 'custom' && (
                  <button onClick={() => removeSection(selectedSection.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                )}
              </div>
            </div>

            {selectedSection.type === 'custom' && (
              <div>
                <label className={labelClass}>Section layout</label>
                <select
                  className={inputClass}
                  value={selectedSection.layout}
                  onChange={(event) => updateSection(selectedSection.id, { layout: event.target.value as WebsiteSectionLayout })}
                >
                  <option value="standard">Text panel</option>
                  <option value="split">Image and text</option>
                  <option value="cards">Card grid</option>
                  <option value="banner">Full-width banner</option>
                </select>
              </div>
            )}

            <div>
              <label className={labelClass}>Small heading / eyebrow</label>
              <input className={inputClass} value={selectedSection.eyebrow} onChange={(event) => updateSection(selectedSection.id, { eyebrow: event.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Section title</label>
              <input className={inputClass} value={selectedSection.title} onChange={(event) => updateSection(selectedSection.id, { title: event.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea className={inputClass} rows={2} value={selectedSection.subtitle} onChange={(event) => updateSection(selectedSection.id, { subtitle: event.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Main text</label>
              <textarea className={inputClass} rows={4} value={selectedSection.body} onChange={(event) => updateSection(selectedSection.id, { body: event.target.value })} />
            </div>
            {(selectedSection.type === 'hero' || selectedSection.type === 'custom') && (
              <>
                <div>
                  <ImageUploadField
                    value={selectedSection.imageUrl}
                    folder="website"
                    onChange={(imageUrl) => updateSection(selectedSection.id, { imageUrl })}
                    onUploadingChange={(delta) => setActiveImageUploads((count) => Math.max(0, count + delta))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Button label</label>
                  <input className={inputClass} value={selectedSection.ctaLabel} onChange={(event) => updateSection(selectedSection.id, { ctaLabel: event.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Button link</label>
                  <input className={inputClass} value={selectedSection.ctaUrl} onChange={(event) => updateSection(selectedSection.id, { ctaUrl: event.target.value })} placeholder="#products or https://…" />
                </div>
              </>
            )}

            {(selectedSection.items.length > 0 || selectedSection.type === 'custom') && (
              <div className="space-y-3 border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-stone-900">Content items</h5>
                    <p className="text-xs text-stone-500">Cards, process steps, comparison rows, or review quotes.</p>
                  </div>
                  <button onClick={() => updateSection(selectedSection.id, { items: [...selectedSection.items, createItem()] })} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                    <Plus className="h-4 w-4" /> Add item
                  </button>
                </div>
                {selectedSection.items.map((item, index) => (
                  <div key={item.id} className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600">Item {index + 1}</span>
                      <button onClick={() => updateSection(selectedSection.id, { items: selectedSection.items.filter((entry) => entry.id !== item.id) })} title="Remove item" aria-label={`Remove item ${index + 1}`} className="rounded p-1 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <label className={labelClass}>Title / name</label>
                    <input className={inputClass} value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} />
                    <label className={labelClass}>Subtitle / location</label>
                    <input className={inputClass} value={item.subtitle} onChange={(event) => updateItem(item.id, { subtitle: event.target.value })} />
                    <label className={labelClass}>Description / quote</label>
                    <textarea className={inputClass} rows={3} value={item.body} onChange={(event) => updateItem(item.id, { body: event.target.value })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Label / product</label>
                        <input className={inputClass} value={item.label} onChange={(event) => updateItem(item.id, { label: event.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Comparison / extra detail</label>
                        <input className={inputClass} value={item.detail} onChange={(event) => updateItem(item.id, { detail: event.target.value })} />
                      </div>
                    </div>
                    <div>
                      <ImageUploadField
                        value={item.imageUrl}
                        folder="website"
                        onChange={(imageUrl) => updateItem(item.id, { imageUrl })}
                        onUploadingChange={(delta) => setActiveImageUploads((count) => Math.max(0, count + delta))}
                      />
                    </div>
                    {selectedSection.type === 'reviews' && (
                      <div>
                        <label className={labelClass}>Rating (1–5)</label>
                        <input className={inputClass} type="number" min={1} max={5} value={item.rating} onChange={(event) => updateItem(item.id, { rating: Number(event.target.value) })} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end border-t border-stone-100 pt-4">
              <button onClick={() => void save()} disabled={isSaving || activeImageUploads > 0} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                <Save className="h-4 w-4" /> {activeImageUploads > 0 ? 'Uploading image…' : isSaving ? 'Publishing…' : 'Save & publish'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
