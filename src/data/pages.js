const { seoArchitecture } = require("./seo-architecture");
const { getService } = require("./services");
const {
  createHomePage,
  createAmocrmServicePage,
  createServiceCityNichePageDraft,
  createServiceCityPainPageDraft,
  createServiceCityPageDraft
} = require("./page-factories");

const amocrmService = getService("amocrm");

const pages = [
  createHomePage(),
  createAmocrmServicePage()
];

const futurePageDrafts = {
  federalRoutes: seoArchitecture.federalRoutes,
  serviceCityPages: seoArchitecture.cities.map((city) => createServiceCityPageDraft(amocrmService, city)),
  serviceCityNichePages: seoArchitecture.cities.flatMap((city) =>
    seoArchitecture.niches.map((niche) => createServiceCityNichePageDraft(amocrmService, city, niche))
  ),
  serviceCityPainPages: seoArchitecture.cities.flatMap((city) =>
    seoArchitecture.painPoints.map((painPoint) => createServiceCityPainPageDraft(amocrmService, city, painPoint))
  )
};

module.exports = { futurePageDrafts, pages };
