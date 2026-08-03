interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function updatePageMetaTags(options: MetaTagsOptions = {}) {
  if (typeof window === 'undefined') return;

  const origin = window.location.origin;
  const currentUrl = options.url || window.location.href;

  const defaultTitle = "বাসা ভাড়া ও হোম টিউটর | Basa Bhara & Home Tutor BD";
  const defaultDesc = "বাংলাদেশ প্রথম প্রযুক্তিবান্ধব বাসা ভাড়া, মেস ভাড়া এবং হোম টিউটর খোঁজার নির্ভরযোগ্য প্ল্যাটফর্ম। সহজেই আপনার পছন্দের বাসা ও টিউটর খুঁজুন।";
  const defaultImage = `${origin}/og-image.jpg`;

  const title = options.title ? `${options.title} | বাসা ভাড়া ও হোম টিউটর` : defaultTitle;
  const description = options.description || defaultDesc;
  let image = options.image || defaultImage;

  // Convert relative image path to absolute URL if needed
  if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
    image = image.startsWith('/') ? `${origin}${image}` : `${origin}/${image}`;
  }

  // 1. Update Document Title
  document.title = title;

  // Helper to set or create meta tag
  const setMeta = (selector: string, attributeName: string, attributeValue: string, content: string) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attributeName, attributeValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Standard Meta Tags
  setMeta('meta[name="description"]', 'name', 'description', description);

  // Open Graph / Facebook / Messenger / WhatsApp / LinkedIn
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:image"]', 'property', 'og:image', image);
  setMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', image);
  setMeta('meta[property="og:url"]', 'property', 'og:url', currentUrl);

  // Twitter Cards
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

  // Legacy link image_src for WhatsApp & Telegram
  let linkImage = document.querySelector('link[rel="image_src"]');
  if (!linkImage) {
    linkImage = document.createElement('link');
    linkImage.setAttribute('rel', 'image_src');
    document.head.appendChild(linkImage);
  }
  linkImage.setAttribute('href', image);
}
