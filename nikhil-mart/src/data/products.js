export const categories = [
  { id: 1, name: "Fruits & Vegetables", icon: "🥬", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200" },
  { id: 2, name: "Dairy & Bread", icon: "🥛", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200" },
  { id: 3, name: "Snacks & Beverages", icon: "🍿", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200" },
  { id: 4, name: "Staples", icon: "🌾", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200" },
  { id: 5, name: "Personal Care", icon: "🧴", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200" },
  { id: 6, name: "Meat & Fish", icon: "🥩", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200" },
  { id: 7, name: "Cleaning", icon: "🧹", image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200" },
  { id: 8, name: "Baby Care", icon: "🍼", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200" },
];

export const products = [
  // Fruits & Vegetables
  { id: 1, name: "Fresh Bananas", category: 1, price: 40, originalPrice: 55, unit: "1 dozen", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300", rating: 4.5, inStock: true },
  { id: 2, name: "Red Apples", category: 1, price: 180, originalPrice: 220, unit: "1 kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300", rating: 4.3, inStock: true },
  { id: 3, name: "Fresh Tomatoes", category: 1, price: 35, originalPrice: 45, unit: "500 g", image: "https://images.unsplash.com/photo-1546470427-e26264be0b11?w=300", rating: 4.2, inStock: true },
  { id: 4, name: "Onions", category: 1, price: 30, originalPrice: 40, unit: "1 kg", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300", rating: 4.0, inStock: true },
  { id: 5, name: "Fresh Spinach", category: 1, price: 25, originalPrice: 35, unit: "250 g", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300", rating: 4.4, inStock: true },
  { id: 6, name: "Carrots", category: 1, price: 45, originalPrice: 60, unit: "500 g", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300", rating: 4.1, inStock: true },

  // Dairy & Bread
  { id: 7, name: "Amul Toned Milk", category: 2, price: 30, originalPrice: 30, unit: "500 ml", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300", rating: 4.6, inStock: true },
  { id: 8, name: "White Bread", category: 2, price: 40, originalPrice: 45, unit: "400 g", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300", rating: 4.2, inStock: true },
  { id: 9, name: "Amul Butter", category: 2, price: 56, originalPrice: 60, unit: "100 g", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300", rating: 4.7, inStock: true },
  { id: 10, name: "Curd (Dahi)", category: 2, price: 35, originalPrice: 40, unit: "400 g", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300", rating: 4.3, inStock: true },
  { id: 11, name: "Paneer", category: 2, price: 90, originalPrice: 110, unit: "200 g", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300", rating: 4.5, inStock: true },
  { id: 12, name: "Cheese Slices", category: 2, price: 120, originalPrice: 140, unit: "200 g", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300", rating: 4.4, inStock: true },

  // Snacks & Beverages
  { id: 13, name: "Lay's Classic Chips", category: 3, price: 20, originalPrice: 20, unit: "52 g", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300", rating: 4.3, inStock: true },
  { id: 14, name: "Coca Cola", category: 3, price: 40, originalPrice: 45, unit: "750 ml", image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300", rating: 4.5, inStock: true },
  { id: 15, name: "Oreo Biscuits", category: 3, price: 30, originalPrice: 35, unit: "120 g", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300", rating: 4.6, inStock: true },
  { id: 16, name: "Green Tea", category: 3, price: 180, originalPrice: 220, unit: "25 bags", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300", rating: 4.4, inStock: true },
  { id: 17, name: "Maggi Noodles", category: 3, price: 14, originalPrice: 14, unit: "70 g", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300", rating: 4.7, inStock: true },
  { id: 18, name: "Mixed Nuts", category: 3, price: 250, originalPrice: 320, unit: "200 g", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300", rating: 4.5, inStock: true },

  // Staples
  { id: 19, name: "Basmati Rice", category: 4, price: 320, originalPrice: 380, unit: "5 kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300", rating: 4.6, inStock: true },
  { id: 20, name: "Toor Dal", category: 4, price: 140, originalPrice: 165, unit: "1 kg", image: "https://images.unsplash.com/photo-1585996954377-18e428c414e2?w=300", rating: 4.3, inStock: true },
  { id: 21, name: "Wheat Flour (Atta)", category: 4, price: 250, originalPrice: 290, unit: "5 kg", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300", rating: 4.5, inStock: true },
  { id: 22, name: "Refined Oil", category: 4, price: 180, originalPrice: 210, unit: "1 L", image: "https://images.unsplash.com/photo-1474979266404-7f28f4a1eb4b?w=300", rating: 4.2, inStock: true },
  { id: 23, name: "Sugar", category: 4, price: 45, originalPrice: 50, unit: "1 kg", image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300", rating: 4.1, inStock: true },
  { id: 24, name: "Salt", category: 4, price: 20, originalPrice: 22, unit: "1 kg", image: "https://images.unsplash.com/photo-1518110925495-5fe2c8cbf468?w=300", rating: 4.0, inStock: true },

  // Personal Care
  { id: 25, name: "Dove Soap", category: 5, price: 55, originalPrice: 62, unit: "100 g", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300", rating: 4.5, inStock: true },
  { id: 26, name: "Head & Shoulders", category: 5, price: 190, originalPrice: 220, unit: "340 ml", image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=300", rating: 4.3, inStock: true },
  { id: 27, name: "Colgate Toothpaste", category: 5, price: 95, originalPrice: 110, unit: "150 g", image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=300", rating: 4.4, inStock: true },
  { id: 28, name: "Face Wash", category: 5, price: 150, originalPrice: 180, unit: "100 ml", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", rating: 4.2, inStock: true },

  // Meat & Fish
  { id: 29, name: "Chicken Breast", category: 6, price: 280, originalPrice: 320, unit: "500 g", image: "https://images.unsplash.com/photo-1604503468506-a8da13571cc2?w=300", rating: 4.4, inStock: true },
  { id: 30, name: "Fresh Eggs", category: 6, price: 75, originalPrice: 85, unit: "12 pcs", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300", rating: 4.6, inStock: true },
  { id: 31, name: "Fish Fillet", category: 6, price: 350, originalPrice: 400, unit: "500 g", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300", rating: 4.3, inStock: true },
  { id: 32, name: "Mutton", category: 6, price: 650, originalPrice: 720, unit: "500 g", image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=300", rating: 4.5, inStock: true },
];

export const bannerOffers = [
  { id: 1, title: "Fresh Fruits & Veggies", subtitle: "Up to 40% OFF", color: "#4CAF50" },
  { id: 2, title: "Dairy Delights", subtitle: "Buy 2 Get 1 Free", color: "#2196F3" },
  { id: 3, title: "Snack Attack", subtitle: "Flat 30% OFF", color: "#FF9800" },
];
