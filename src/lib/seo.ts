const SITE_URL = "https://cmosqueda.vercel.app";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

type PageSeo = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  image?: string;
};

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(href: string) {
  const element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (element) element.href = href;
}

export function setPageSeo({ title, description, path, type = "website", publishedTime, image = DEFAULT_IMAGE }: PageSeo) {
  const url = `${SITE_URL}${path}`;
  document.title = title;
  setCanonical(url);
  setMeta('meta[name="description"]', "name", "description", description);
  setMeta('meta[property="og:title"]', "property", "og:title", title);
  setMeta('meta[property="og:description"]', "property", "og:description", description);
  setMeta('meta[property="og:url"]', "property", "og:url", url);
  setMeta('meta[property="og:type"]', "property", "og:type", type);
  setMeta('meta[property="og:image"]', "property", "og:image", image);
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);
  setMeta('meta[name="twitter:url"]', "name", "twitter:url", url);

  const articleTimeSelector = 'meta[property="article:published_time"]';
  const articleTime = document.head.querySelector<HTMLMetaElement>(articleTimeSelector);
  if (publishedTime) {
    setMeta(articleTimeSelector, "property", "article:published_time", publishedTime);
  } else {
    articleTime?.remove();
  }
}
