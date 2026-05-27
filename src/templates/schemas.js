function renderProfessionalServiceSchema(page, site) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": page.serviceBrand || page.serviceName,
    "description": page.description,
    "areaServed": site.brand.areaServed,
    "serviceType": page.serviceName,
    "url": page.canonical,
    "email": site.contacts.email,
    "parentOrganization": {
      "@type": "Organization",
      "name": site.brand.name,
      "description": site.brand.description
    },
    ...(page.city ? { "address": { "@type": "PostalAddress", "addressLocality": page.city } } : {})
  };
}

function renderFaqSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.data.faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

function renderBreadcrumbSchema(page) {
  if (!page.breadcrumbs || page.breadcrumbs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": page.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href
    }))
  };
}

module.exports = {
  renderBreadcrumbSchema,
  renderFaqSchema,
  renderProfessionalServiceSchema
};
