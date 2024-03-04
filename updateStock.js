// Connect to your MongoDB database
conn = new Mongo('mongodb+srv://admin:admin123@users.vsmwg69.mongodb.net/ordersDB');
db = conn.getDB('ordersDB');

// Convert the stock field to a number for all documents in the collection
db.products.updateMany({}, { $set: { stock: { $toInt: "$stock" } } });

// Optional: Print a message indicating the process is complete
print('Stock update process completed.');
