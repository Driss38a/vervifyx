"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMPLATES = exports.SECTION_TYPES = void 0;
exports.SECTION_TYPES = [
    'hero', 'products-grid', 'features', 'testimonials', 'faq',
    'countdown', 'order-form', 'rich-text', 'video', 'image-gallery',
];
const base = (title, subtitle) => [
    { type: 'hero', props: { title, subtitle, ctaLabel: 'Shop now' } },
    { type: 'products-grid', props: { title: 'Featured', limit: 8 } },
    { type: 'features', props: { items: [] } },
    { type: 'testimonials', props: { items: [] } },
    { type: 'faq', props: { items: [] } },
];
exports.TEMPLATES = {
    default: {
        key: 'default', name: 'Classic', description: 'Clean, versatile store for any product.',
        theme: { primary: '#2563eb', background: '#ffffff', text: '#0f172a', font: 'Inter', radius: 12 },
        homeSections: base('Welcome to our store', 'Quality products, delivered.'),
    },
    fashion: {
        key: 'fashion', name: 'Fashion', description: 'Large imagery for clothing and accessories.',
        theme: { primary: '#111827', background: '#fafaf9', text: '#111827', font: 'Playfair Display', radius: 4 },
        homeSections: [...base('New collection', 'Style that fits you.'), { type: 'image-gallery', props: { images: [] } }],
    },
    electronics: {
        key: 'electronics', name: 'Tech', description: 'Specs-first layout for gadgets and electronics.',
        theme: { primary: '#0ea5e9', background: '#0b1220', text: '#e2e8f0', font: 'Inter', radius: 10 },
        homeSections: base('Latest tech', 'Great devices, fair prices.'),
    },
    digital: {
        key: 'digital', name: 'Digital products', description: 'Ebooks, templates, courses and downloads.',
        theme: { primary: '#7c3aed', background: '#ffffff', text: '#1e1b4b', font: 'Poppins', radius: 16 },
        homeSections: base('Learn. Build. Grow.', 'Instant digital delivery.'),
    },
    services: {
        key: 'services', name: 'Services', description: 'Showcase services with booking and reviews.',
        theme: { primary: '#059669', background: '#f8fafc', text: '#064e3b', font: 'Inter', radius: 12 },
        homeSections: base('Professional services', 'Book in a few taps.'),
    },
};
//# sourceMappingURL=templates.js.map