let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

var port = process.env.PORT || 2410
app.listen(port, () => console.log(`Node app Listening on port ${port}!`));

const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  password: "Ashish7071122145@",
  database: "postgres",
  port: 5432,
  host: "db.lfccweznrefslsqkxxic.supabase.co",
  ssl: { rejectUnauthorized: false },
});

client.connect(function (res, error) {
  console.log("Connected!!!");
});


let { data } = require("./shopsData.js");
const { shops, products, purchases } = data;


// console.log(shops)

// async function insertShops() {
//   try {
    
//     const values = shops.map((s, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ');
//     const query = `INSERT INTO shops (name, rent) VALUES ${values} RETURNING *`;
//     const flattenedValues = shops.flatMap((s) => [s.name, s.rent]);
//     const result = await client.query(query, flattenedValues);
//     console.log('Successfully Inserted', result.rowCount, 'rows');
//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     await client.end();
//   }
// }

// insertShops();

// async function insertProducts() {
//   try {
    
//     const values = products.map((s, i) => `($${i * 3 + 1}, $${i * 3 + 2},$${i * 3 + 3} )`).join(', ');
//     const query = `INSERT INTO products (productname, category, description ) VALUES ${values} RETURNING *`;
//     const flattenedValues = products.flatMap((s) => [s.productName, s.category, s.description]);
//     const result = await client.query(query, flattenedValues);
//     console.log('Successfully Inserted', result.rowCount, 'rows');
//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     await client.end();
//   }
// }

// insertProducts();


// async function insertPurchases() {
//   try {
//     const values = purchases
//       .map((s, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4} ) `)
//       .join(', ');
//     const query = `INSERT INTO purchases (shopid, productid, quantity, price) VALUES ${values} RETURNING *`;
//     const flattenedValues = purchases.flatMap((s) => [s.shopId, s.productid, s.quantity, s.price]);
//     const result = await client.query(query, flattenedValues);
//     console.log('Successfully Inserted', result.rowCount, 'rows');
//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     await client.end();
//   }
// }

// insertPurchases();






app.get("/shops", function(req,res,next){
  let query = ` SELECT * FROM shops`;
  client.query(query, function (err, result) {
    if (err) {
      res.status(404).send(err);
    } else {
      res.send(result.rows);
    }
  });
})

app.post("/shops", function (req, res, next) {
  var values = Object.values(req.body);
  console.log(values);
  let query = ` INSERT INTO shops(name, rent) VALUES ($1,$2) `;
  client.query(query, values, function (err, result) {
    if (err) res.status(404).send(err.message);
    else res.send(` ${result.rowCount} Insertion Succesfull`);
  });
});


app.get("/products", function(req,res,next){
  let query = ` SELECT * FROM products`;
  client.query(query, function (err, result) {
    if (err) {
      res.status(404).send(err);
    } else {
      res.send(result.rows);
    }
  });
})

app.post("/products", function (req, res, next) {
  var values = Object.values(req.body);
  console.log(values);
  let query = ` INSERT INTO products(productname, category, description) VALUES ($1,$2,$3) `;
  client.query(query, values, function (err, result) {
    if (err) res.status(404).send(err.message);
    else res.send(` ${result.rowCount} Insertion Succesfull`);
  });
});


app.get("/products/:id", function (req, res, next) {
  let id = +req.params.id;
  let query = ` SELECT * FROM products WHERE productid = ${id} `;
  client.query(query, function (err, result) {
    if (err) res.status(404).send(err);
    else res.send(result.rows);
  });
});

app.put("/products/:id", function (req, res, next) {
  let id = +req.params.id;
  let upProd = req.body;

  const query = `
          UPDATE products 
          SET productname = $1, category = $2, description = $3
          WHERE productid = $4
      `;

  const values = [
    upProd.productname,
    upProd.category,
    upProd.description,
    id,
  ];

  client.query(query, values, function (err, result) {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.send(`Updated products with id ${id}`);
    }
  });
});



app.get("/purchases", function(req,res,next){
  let sort = req.query.sort;
  let shopID = req.query.shop;
  let productID = req.query.product;
  let query = ` SELECT * FROM purchases p JOIN shops s ON  p.shopid=s.shopid  JOIN products pr ON p.productid= pr.productid WHERE 1=1 `;


  if (productID) {
    console.log("ID",productID);
    const productidArr = productID.split(",");
    console.log("Arr",productidArr)
    const productIDList = productidArr
    .map(id => {
      const numericPart = id.substring(2); 
      return `'${numericPart}'`;
    })
    .join(", ");
    console.log("List",productIDList)
    
    query += ` AND p.productid IN (${productIDList})`;
  }
  if(shopID)
  {
    let str = shopID.substring(2,3)
    console.log(str);
    query += ` AND p.shopid ='${+str}'`
  }


  if (sort) {
    const sortOptions = sort.split(",");
    const sortStatements = [];

    sortOptions.forEach((option) => {
      switch (option) {
        case "QtyAsc":
          sortStatements.push("quantity ASC");
          break;
        case "QtyDesc":
          sortStatements.push("quantity DESC");
          break;
        case "ValueAsc":
          sortStatements.push("(quantity * price) ASC");
          break;
        case "ValueDesc":
          sortStatements.push("(quantity * price) DESC");
          break;
        default:
          break;
      }
    });
    if (sortStatements.length > 0) {
      query += ` ORDER BY ${sortStatements.join(", ")}`;
    }
  }
  client.query(query, function (err, result) {
    if (err) {
      res.status(404).send(err);
    } else {
      res.send(result.rows);
    }
  });
})



app.get("/purchases/shops/:id", function (req, res) {
  let id = +req.params.id;
  let query = ` select * from purchases p JOIN shops s ON p.shopid=s.shopid  JOIN products pr ON p.productid= pr.productid  where s.shopid=${id} `
  client.query(query, function (err, result) {
    if (err) {
      res.status(404).send(err);
    } else {
      res.send(result.rows);
    }
  });

 
})
app.get("/purchases/products/:id", function (req, res) {
  let id = +req.params.id;
  let query =` select * from purchases p JOIN shops s ON p.shopid=s.shopid  JOIN products pr ON p.productid= pr.productid  where pr.productid=${id} `
  client.query(query, function (err, result) {
    if (err) {
      res.status(404).send(err);
    } else {
      res.send(result.rows);
    }
  });

 
})


app.post("/purchases", function (req, res, next) {
  var values = Object.values(req.body);
  console.log(values);
  let query = ` INSERT INTO purchases(shopId, productid, quantity,price) VALUES ($1,$2,$3,$4) `;
  client.query(query, values, function (err, result) {
    if (err) res.status(404).send(err.message);
    else res.send(` ${result.rowCount} Insertion Succesfull`);
  });
});



app.get("/totalPurchase/:forType/:id", function(req,res,next){
  let id = +req.params.id;
  let forType= req.params.forType;
  let query ;
  if(forType  === "shop")
  {
    query = ` select * from purchases p JOIN shops s ON p.shopid=s.shopid  JOIN products pr ON p.productid= pr.productid  where s.shopid=${id} `
  }
  else if(forType === "product")
  {
    query = ` select * from purchases p JOIN shops s ON p.shopid=s.shopid  JOIN products pr ON p.productid=pr.productid  where pr.productid=${id} `
  }

  client.query(query, function (err, result) {
    if (err) {
      res.status(404).send(err);
    } else {
      res.send(result.rows);
    }
  });


})








