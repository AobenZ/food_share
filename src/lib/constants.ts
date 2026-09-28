export const RECOMMEND_LEVELS = ["强烈推荐", "推荐", "一般", "踩雷"] as const;

export type RecommendLevel = (typeof RECOMMEND_LEVELS)[number];

export const MAX_PHOTOS = 9;

export const MAX_DESCRIPTION_LENGTH = 2000;
