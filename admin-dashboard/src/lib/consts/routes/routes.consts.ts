export const ROUTES = {
  ROOT: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  ADMIN: {
    ROOT: "/admin",
    CATEGORY: {
      ROOT: "/categories",
      MANAGE: "/categories/manage",
      ADD: "/categories/add",
      EDIT: "/categories/edit",
    },
    PRODUCT: "/products",
    ORDER: "/orders",
    USERS: "/users",
    DASHBOARD: "/admin",
    FEATURED: {
      ROOT: "/featured",
      ADDFEATUREDCATEGORY: "/featured/addFeaturedCategory",
      ADDFEATUREDPRODUCT: "/featured/addFeaturedProduct",
      ADDAPPFEATUREDCATEGORY: "/featured/addAppFeaturedCategory",
      ADDAPPFEATUREDPRODUCT: "/featured/addAppFeaturedProduct",
    },
    APPFEATURED: {
      ROOT: "/app/featured",
      ADDFEATUREDCATEGORY: "/app/featured/addFeaturedCategory",
      // ADDFEATUREDPRODUCT: "/app/featured/addFeaturedProduct",
    },
    BANNER: {
      ROOT: "/banners",
      ADDBANNER: "/banners/addBanner",
    },
    BRAND: {
      ROOT: "/brands",
      ADDBRAND: "/brands/addBrand",
    },
    FEATURED_WEEK_BRAND: {
      ROOT: "/featuredThisBrand",
      ADD: "/featuredThisBrand/addBrand",
    },
    SHOP_BY_STORE: {
      ROOT: "/ShopByStore",
      ADD: "/ShopByStore/addBrand",
    },
    BRAND_OF_THE_DAY: {
      ROOT: "/BrandOfTheDay",
      ADD: "/BrandOfTheDay/addBrand",
    },

    SLIDER: {
      ROOT: "/sliders",
      ADDSLIDER: "/sliders/addSlider",
    },
    DELIVERY_BOY: {
      ROOT: "/delivery-boys",
      ADD: "/delivery-boys/add",
    },
    PROMO_CODE: {
      ROOT: "/promocode",
      ADD: "/promocode/add",
    },
    WALLET: "/wallets",
    TRANSACTIONS: "/transactions",
    SETTINGS:"/settings",
    SHOWCASE_PRODUCTS: {
      ROOT: "/showCaseProducts",
      ADD: "/showCaseProducts/add",
    },
    APPBRAND: {
      ROOT: "/appBrands",
      ADD: "/appBrands/add",
    },
  },
};
