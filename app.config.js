module.exports = {
  expo: {
    name: "Gig-Smart",
    slug: "gig-smart",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/gigs-logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#2e40af"
    },
    assetBundlePatterns: [
      "**/*",
      "!node_modules/**/*",
      "!assets/node_modules/**/*"
    ],
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      lazy: false,
      assetBundlePatterns: [
        "assets/**/*"
      ],
      build: {
        babel: {
          include: ["@babel/plugin-transform-runtime"]
        }
      }
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.anonymous.gigsmart",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1e40af"
      },
      hermesEnabled: false
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://rtomjtqrxcjcfqjhndtr.supabase.co",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_JMetc5HhwGS9bL9_rel0hQ_pq05Ggmy",
    },
    plugins: []
  }
};
