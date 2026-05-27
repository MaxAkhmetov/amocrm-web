const { seoArchitecture } = require("./seo-architecture");
const {
  createCityNichePageDraft,
  createCityPainPageDraft,
  createCityPageDraft,
  createHomePage
} = require("./page-factories");

const pages = [
  createHomePage()
];

const futurePageDrafts = {
  federalRoutes: seoArchitecture.federalRoutes,
  cityPages: seoArchitecture.cities.map(createCityPageDraft),
  cityNichePages: seoArchitecture.cities.flatMap((city) =>
    seoArchitecture.niches.map((niche) => createCityNichePageDraft(city, niche))
  ),
  cityPainPages: seoArchitecture.cities.flatMap((city) =>
    seoArchitecture.painPoints.map((painPoint) => createCityPainPageDraft(city, painPoint))
  )
};

module.exports = { futurePageDrafts, pages };
