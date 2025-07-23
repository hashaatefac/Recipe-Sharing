import Image from "next/image";
import { Search, Heart, Clock, Users, ChefHat, UtensilsCrossed } from "lucide-react";

// Mock data for featured recipes
const featuredRecipes = [
  {
    id: 1,
    title: "Classic Margherita Pizza",
    author: "Chef Maria",
    time: "30 min",
    difficulty: "Easy",
    likes: 128,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
    category: "Italian"
  },
  {
    id: 2,
    title: "Chocolate Chip Cookies",
    author: "Baker John",
    time: "45 min",
    difficulty: "Medium",
    likes: 95,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
    category: "Desserts"
  },
  {
    id: 3,
    title: "Thai Green Curry",
    author: "Chef Sarah",
    time: "40 min",
    difficulty: "Medium",
    likes: 156,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "Asian"
  },
  {
    id: 4,
    title: "Grilled Salmon",
    author: "Chef Mike",
    time: "25 min",
    difficulty: "Easy",
    likes: 89,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    category: "Seafood"
  }
];

const categories = [
  { name: "Breakfast", icon: "🍳", count: 156 },
  { name: "Lunch", icon: "🥪", count: 234 },
  { name: "Dinner", icon: "🍽️", count: 189 },
  { name: "Desserts", icon: "🍰", count: 98 },
  { name: "Vegetarian", icon: "🥬", count: 145 },
  { name: "Quick & Easy", icon: "⚡", count: 267 }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">RecipeShare</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-orange-500 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 transition-colors">Recipes</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 transition-colors">Categories</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 transition-colors">About</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-orange-500 transition-colors">
                Sign In
              </button>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Share Your
            <span className="text-orange-500"> Culinary </span>
            Masterpieces
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of food lovers sharing their favorite recipes. Discover new flavors, 
            connect with fellow chefs, and build your recipe collection.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for recipes, ingredients, or chefs..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
              Share Your Recipe
            </button>
            <button className="border border-orange-500 text-orange-500 px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors font-semibold">
              Browse Recipes
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Explore by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer border border-orange-100 hover:border-orange-200"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} recipes</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Featured Recipes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="relative h-48">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
                    <Heart className="h-4 w-4 text-red-500" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-500 font-semibold">{recipe.category}</span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {recipe.time}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">by {recipe.author}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{recipe.difficulty}</span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Heart className="h-4 w-4 mr-1 text-red-500" />
                      {recipe.likes}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-orange-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-orange-100">Recipes Shared</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-orange-100">Active Chefs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-orange-100">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Share Your Recipes?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of passionate food lovers and start sharing your culinary creations today.
          </p>
          <button className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="h-8 w-8 text-orange-500" />
                <span className="text-xl font-bold">RecipeShare</span>
              </div>
              <p className="text-gray-400">
                Connecting food lovers through the joy of cooking and sharing recipes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Forums</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Social Media</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RecipeShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
