# Search engines

This page covers what Kestello tells search engines about each page, and the hooks a plugin or theme uses to change it: the head tags, the structured data (JSON-LD), links to other languages and the sitemap. Read it before writing an SEO plugin, or when a theme needs something search engines should see.

Site owners set titles, descriptions and the rest in the admin; that side is in the guide under [Search and sharing](/guide/content#search-and-sharing).

## What every public page gets

Core writes these into the `<head>` of every public page. Admin pages get none of them.

| Tags | From |
|---|---|
| `<title>` | The site's title pattern, with the page's search title or title. See [Settings](#settings-that-change-the-output). |
| `meta description`, `og:description` | The entry's search description, then its excerpt, then the first lines of its text, then the site tagline. |
| `link rel="canonical"`, `og:url` | The page's own address, or the entry's **Canonical address** when one is set. Archives keep `?page=N`. |
| `meta robots` | `noindex` on hidden entries, error pages and every page of a hidden site; otherwise `max-image-preview:large`. |
| `og:type`, `og:title`, `og:site_name`, `og:locale` | `article` for dated entries. `og:locale` only when the site language names a country, such as `pt_BR`. |
| `og:image` and its size and alt text, `twitter:card` | The sharing image, then the first image field, then the site's default sharing image. |
| `article:published_time`, `article:modified_time` | Dated entries. |
| `link rel="alternate" type="application/rss+xml"` | The site feed, and the type's or term's own feed. |
| `link rel="alternate" hreflang` | Only what [`seo.alternates`](#other-languages) returns. |
| `<script type="application/ld+json">` | The [structured data](#structured-data). |

Pages describe themselves to core with a `seo` prop. Controllers of core pages set it; a plugin's own page can too:

```php
return Page::render('@acme/Product', [
    'title' => $product->name,
    'seo' => [
        'description' => $product->summary,
        'canonical' => '/shop/' . $product->slug,
        'image' => ['url' => $image->url(), 'width' => 1200, 'height' => 630, 'alt' => $image->alt],
        'type' => 'website',            // og:type
        'kind' => 'page',               // page, article or collection: what the structured data calls it
        'published' => '2026-03-02T09:00:00Z',
        'modified' => '2026-03-05T10:00:00Z',
        'breadcrumbs' => [['name' => 'Shop', 'path' => '/shop']],
        'noindex' => false,
    ],
]);
```

Every key is optional.

## Change the head tags

`seo.head` receives the tags as a list of `['meta' or 'link', attributes]` pairs and the page (`component`, `props`, `url`). Return the list with your changes:

```php
$cms->filters->add('seo.head', function (array $tags, array $data): array {
    $tags[] = ['meta', ['name' => 'google-site-verification', 'content' => 'abc123']];
    $tags[] = ['link', ['rel' => 'me', 'href' => 'https://mastodon.social/@bakery']];

    return $tags;
});
```

Kestello escapes every attribute, keeps only `meta` and `link`, and leaves out an `href` that is not an http(s) or relative address, so a filter cannot add markup or a `javascript:` link. For anything else in the head, such as an inline script, use `page.head` with the page's nonce ([Events and filters](/developers/events)).

## Structured data

Each page that may be listed gets one JSON-LD `@graph`. Its nodes refer to each other by `@id`:

| Node | `@id` | When |
|---|---|---|
| `WebSite` | `{site}/#website` | Every page. |
| `Organization` or `Person` | `{site}/#publisher` | Every page. Name, logo or photo and `sameAs` profiles come from the settings. |
| `WebPage` or `CollectionPage` | `{page}#webpage` | Every page; `CollectionPage` for archives and term pages. |
| `ImageObject` | `{page}#primaryimage` | When the page has its own image. |
| `Article` | `{page}#article` | Dated entries, with headline, dates, author and publisher. |
| `BreadcrumbList` | `{page}#breadcrumb` | Every page but the home page: home, the archive or the parent pages, then the page. |

Change it with `seo.schema`, which receives the list of nodes and the page:

```php
$cms->filters->add('seo.schema', function (array $nodes, array $data): array {
    if ($data['component'] !== '@acme/Product') {
        return $nodes;
    }
    $product = $data['props']['product'];
    $nodes[] = [
        '@type' => 'Product',
        '@id' => $data['url'] . '#product',
        'name' => $product['name'],
        'offers' => ['@type' => 'Offer', 'price' => $product['price'], 'priceCurrency' => 'EUR'],
        'mainEntityOfPage' => ['@id' => $data['url'] . '#webpage'],
    ];

    return $nodes;
});
```

- Return `[]` to leave the page without structured data, for example when your plugin writes its own.
- A node without a string `@type` is left out.
- The JSON is written with `<`, `>`, `&` and quotes escaped, so any text, even one containing `</script>`, stays inside the script.
- Pages with `noindex`, every page of a hidden site, error pages and the admin get none, and the filter is not called for them.

## Other languages

A Kestello site has one language. A plugin that serves the same page in other languages adds `hreflang` links with `seo.alternates`:

```php
$cms->filters->add('seo.alternates', function (array $alternates, array $data): array {
    foreach (Translations::of($data['url']) as $language => $path) {
        $alternates[] = ['hreflang' => $language, 'href' => $path];       // de, sr-Latn, x-default
    }

    return $alternates;
});
```

`href` is a path on this site or an absolute http(s) address. Entries with a language tag that is not valid, or an address that is neither, are left out, and so is everything after the first 50. Hidden pages get none.

## The sitemap

`/sitemap.xml` lists one file per public type and taxonomy, such as `/sitemaps/post-1.xml`, split every 2,000 addresses. Hidden entries, entries under a page that is not public, and entries whose canonical address is another page are left out.

A plugin adds its own files with two filters: `sitemap.files` lists them, and `sitemap.urls` fills each one.

```php
$cms->filters->add('sitemap.files', function (array $files): array {
    $files['products-1'] = Product::newestChange();      // ?DateTimeInterface
    return $files;
});

$cms->filters->add('sitemap.urls', function (array $urls, string $file): array {
    if ($file !== 'products-1') {
        return $urls;           // core's files: you can add to them or remove from them too
    }
    foreach (Product::published() as $product) {
        $urls[] = ['loc' => '/shop/' . $product->slug, 'lastmod' => $product->updatedAt(), 'images' => [$product->imageUrl()]];
    }

    return $urls;
});
```

- A file name is lowercase letters, digits and underscores, a dash and a page number from 1: `products-1`, `products-2`. Other names are left out of the index.
- `loc` is a path, or an absolute address under the site address. Addresses on other hosts are left out: the sitemap protocol only allows a site's own.
- `images` are paths or http(s) addresses, at most 1,000 per address. A file holds at most 50,000 addresses.
- A file that ends up empty answers 404.

`robots.txt` has its own filter, `robots.txt`, and lists the sitemap.

## Settings that change the output

Under **Site → Settings → Search and sharing**, stored as site settings:

| Setting | Key |
|---|---|
| Page titles, home page title, separator | `seo_title_pattern`, `seo_home_pattern`, `seo_separator` |
| Default sharing image | `seo_image` (a media id) |
| Organization or person, name, logo or photo, profiles | `seo_publisher_type`, `seo_publisher_name`, `seo_publisher_logo`, `seo_profiles` |

Pages receive the title patterns as `site.titles`, so `<Head>` in the browser writes the same title as the server.

## All the hooks

| Hook | Changes |
|---|---|
| `seo.head` | The head tags. |
| `seo.schema` | The JSON-LD nodes. |
| `seo.alternates` | The `hreflang` links. |
| `sitemap.files` | The files in `/sitemap.xml`. |
| `sitemap.urls` | The addresses in one sitemap file. |
| `robots.txt` | The text of `robots.txt`. |
| `page.head` | Any other HTML in the head. |

Their arguments are in the [Hook reference](/developers/hooks#pages).
