// Vercel Serverless Function (Node.js) to serve products when no backend is connected
// This enables the menu page to work on Vercel deployments of the frontend-only app.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  const items = [
    { id: 1, name: 'Small Chops Mix', price: 1500, description: 'A tasty assortment of small chops.', image: null, category: 'Small Chops', rating: 4.6, is_popular: true },
    { id: 2, name: 'Fruit Smoothie', price: 800, description: 'Fresh fruit smoothie.', image: null, category: 'Smoothies', rating: 4.7, is_popular: true }
  ];
  res.status(200).json(items);
};
