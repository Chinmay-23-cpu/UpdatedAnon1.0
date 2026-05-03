const ALL_PRODUCTS = [
  {
    "id": "prod_0",
    "title": "Baby fabric shoes",
    "price": 4.0,
    "image": "https://i.postimg.cc/kGZn4GL2/1.jpg",
    "category": "shoes"
  },
  {
    "id": "prod_1",
    "title": "Men's hoodies t-shirt",
    "price": 7.0,
    "image": "https://i.postimg.cc/fySG8Kgb/2.jpg",
    "category": "clothes"
  },
  {
    "id": "prod_2",
    "title": "Girls t-shirt",
    "price": 3.0,
    "image": "https://i.postimg.cc/14xL2qLr/3.jpg",
    "category": "clothes"
  },
  {
    "id": "prod_3",
    "title": "Woolen hat for men",
    "price": 12.0,
    "image": "https://i.postimg.cc/y6wxsrKv/4.jpg",
    "category": "unspecified"
  },
  {
    "id": "prod_4",
    "title": "Relaxed Short full sleeve t-shirt",
    "price": 45.0,
    "image": "https://i.postimg.cc/fyLNm09z/clothes-1.jpg",
    "category": "clothes"
  },
  {
    "id": "prod_5",
    "title": "Girls pink Embro design top",
    "price": 61.0,
    "image": "https://i.postimg.cc/T3mXVxpD/clothes-2.jpg",
    "category": "clothes"
  },
  {
    "id": "prod_6",
    "title": "Black Floral Wrap Midi Skirt",
    "price": 76.0,
    "image": "https://i.postimg.cc/DzgH6wF8/clothes-3.jpg",
    "category": "clothes"
  },
  {
    "id": "prod_7",
    "title": "Pure Garment Dyed Cotton Shirt",
    "price": 68.0,
    "image": "https://i.postimg.cc/02w43fPg/shirt-1.jpg",
    "category": "mens fashion"
  },
  {
    "id": "prod_9",
    "title": "Men Yarn Fleece Full-zip Jacket",
    "price": 61.0,
    "image": "https://i.postimg.cc/9fnSKNRh/jacket-1.jpg",
    "category": "winter wear"
  },
  {
    "id": "prod_10",
    "title": "Mens Winter Leathers Jackets",
    "price": 50.0,
    "image": "https://i.postimg.cc/jdybNKWJ/jacket-3.jpg",
    "category": "jackets"
  },
  {
    "id": "prod_11",
    "title": "Better Basics French Terry Sweatshorts",
    "price": 20.0,
    "image": "https://i.postimg.cc/7Lmt7tMz/shorts-1.jpg",
    "category": "shorts"
  },
  {
    "id": "prod_12",
    "title": "Running & Trekking Shoes - White",
    "price": 49.0,
    "image": "https://i.postimg.cc/pLWhzrLm/sports-1.jpg",
    "category": "shoes"
  },
  {
    "id": "prod_13",
    "title": "Trekking & Running Shoes - Black",
    "price": 78.0,
    "image": "https://i.postimg.cc/DfjFzzbv/sports-2.jpg",
    "category": "sports"
  },
  {
    "id": "prod_14",
    "title": "Womens Party Wear Shoes",
    "price": 94.0,
    "image": "https://i.postimg.cc/qRPjQYmZ/party-wear-1.jpg",
    "category": "party wear"
  },
  {
    "id": "prod_15",
    "title": "Sports Claw Women's Shoes",
    "price": 54.0,
    "image": "https://i.postimg.cc/cH1M4Wv3/sports-3.jpg",
    "category": "sports"
  },
  {
    "id": "prod_16",
    "title": "Air Trekking Shoes - White",
    "price": 52.0,
    "image": "https://i.postimg.cc/JnczQTWc/sports-6.jpg",
    "category": "sports"
  },
  {
    "id": "prod_17",
    "title": "Boot With Suede Detail",
    "price": 20.0,
    "image": "https://i.postimg.cc/XvxVGrKQ/shoe-3.jpg",
    "category": "boots"
  },
  {
    "id": "prod_18",
    "title": "Men's Leather Formal Wear Shoes",
    "price": 56.0,
    "image": "https://i.postimg.cc/JnMtkwB5/shoe-1.jpg",
    "category": "formal"
  },
  {
    "id": "prod_19",
    "title": "Casual Men's Brown Shoes",
    "price": 50.0,
    "image": "https://i.postimg.cc/0yCHGD6R/shoe-2.jpg",
    "category": "casual"
  },
  {
    "id": "prod_20",
    "title": "Pocket Watch Leather Pouch",
    "price": 50.0,
    "image": "https://i.postimg.cc/jq84QT45/watch-3.jpg",
    "category": "watches"
  },
  {
    "id": "prod_21",
    "title": "Silver Deer Heart Necklace",
    "price": 84.0,
    "image": "https://i.postimg.cc/MZmBYvv7/jewellery-3.jpg",
    "category": "jewellery"
  },
  {
    "id": "prod_22",
    "title": "Titan 100 Ml Womens Perfume",
    "price": 42.0,
    "image": "https://i.postimg.cc/R0Kv9Jtq/perfume.jpg",
    "category": "perfume"
  },
  {
    "id": "prod_23",
    "title": "Men's Leather Reversible Belt",
    "price": 24.0,
    "image": "https://i.postimg.cc/jj4kzynp/belt.jpg",
    "category": "belt"
  },
  {
    "id": "prod_24",
    "title": "Platinum Zircon Classic Ring",
    "price": 62.0,
    "image": "https://i.postimg.cc/T24Nqdh3/jewellery-2.jpg",
    "category": "jewellery"
  },
  {
    "id": "prod_25",
    "title": "Smart Watch Vital Plus",
    "price": 56.0,
    "image": "https://i.postimg.cc/rsk1gH6g/watch-1.jpg",
    "category": "watches"
  },
  {
    "id": "prod_26",
    "title": "Shampoo Conditioner Packs",
    "price": 20.0,
    "image": "https://i.postimg.cc/wjGDnM81/shampoo.jpg",
    "category": "cosmetics"
  },
  {
    "id": "prod_27",
    "title": "Rose Gold Peacock Earrings",
    "price": 20.0,
    "image": "https://i.postimg.cc/6qd3mpCv/jewellery-1.jpg",
    "category": "jewellery"
  },
  {
    "id": "prod_28",
    "title": "SHAMPOO, CONDITIONER & FACEWASH PACKS",
    "price": 150.0,
    "image": "https://i.postimg.cc/wjGDnM81/shampoo.jpg",
    "category": "cosmetics"
  },
  {
    "id": "prod_29",
    "title": "ROSE GOLD DIAMOND EARRINGS",
    "price": 1990.0,
    "image": "https://i.postimg.cc/6qd3mpCv/jewellery-1.jpg",
    "category": "jewelry"
  },
  {
    "id": "prod_32",
    "title": "MEN Yarn Fleece Full-Zip Jacket",
    "price": 58.0,
    "image": "https://i.postimg.cc/DZ3QSqRG/jacket-5.jpg",
    "category": "jacket"
  },
  {
    "id": "prod_34",
    "title": "Casual Men's Brown shoes",
    "price": 99.0,
    "image": "https://i.postimg.cc/0yCHGD6R/shoe-2.jpg",
    "category": "casual"
  },
  {
    "id": "prod_36",
    "title": "Smart watche Vital Plus",
    "price": 100.0,
    "image": "https://i.postimg.cc/rsk1gH6g/watch-1.jpg",
    "category": "watches"
  },
  {
    "id": "prod_39",
    "title": "Trekking & Running Shoes - black",
    "price": 58.0,
    "image": "https://i.postimg.cc/DfjFzzbv/sports-2.jpg",
    "category": "sports"
  },
  {
    "id": "prod_40",
    "title": "Men's Leather Formal Wear shoes",
    "price": 50.0,
    "image": "https://i.postimg.cc/JnMtkwB5/shoe-1.jpg",
    "category": "formal"
  }
];
