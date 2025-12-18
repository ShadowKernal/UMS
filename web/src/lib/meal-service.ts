const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export type Meal = {
    idMeal: string;
    strMeal: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strTags?: string;
    strYoutube?: string;
    [key: string]: string | undefined; // For ingredients/measures
};

export const MealService = {
    searchMeals: async (query: string): Promise<Meal[]> => {
        const res = await fetch(`${BASE_URL}/search.php?s=${query}`);
        const data = await res.json();
        return data.meals || [];
    },

    getMealById: async (id: string): Promise<Meal | null> => {
        const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
        const data = await res.json();
        return data.meals ? data.meals[0] : null;
    },

    getRandomMeal: async (): Promise<Meal | null> => {
        const res = await fetch(`${BASE_URL}/random.php`);
        const data = await res.json();
        return data.meals ? data.meals[0] : null;
    },

    getCategories: async (): Promise<{ strCategory: string; strCategoryThumb: string; strCategoryDescription: string }[]> => {
        const res = await fetch(`${BASE_URL}/categories.php`);
        const data = await res.json();
        return data.categories || [];
    },

    filterByCategory: async (category: string): Promise<Meal[]> => {
        const res = await fetch(`${BASE_URL}/filter.php?c=${category}`);
        const data = await res.json();
        return data.meals || [];
    }
};
