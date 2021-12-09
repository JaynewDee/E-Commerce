const router = require('express').Router();
const {
  Product,
  Category,
  Tag,
  ProductTag
} = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const productData = await Product.findAll({
      include: [{
        model: Category
      }, {
        model: Tag
      }]
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const singleProduct = await Product.findByPk(req.params.id, {
      include: [{
        model: Category
      }, {
        model: Tag
      }]
    });
    res.status(200).json(singleProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  req.body = {
    product_name: "Basketball",
    price: 20.00,
    stock: 3,
    categoryId: 9, 
    tagIds: [5, 6]
  }

  await Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tagId) => {
          return {
            productId: product.id,
            tagId,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async (req, res) => {
  // update product data
  req.body = {
    product_name: "Adidas",
    price: 85.00,
    stock: 10,
    tagIds: [3, 4]
  }

  await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
    .then(() => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({
        where: {
          productId: req.params.id
        }
      });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({
        tagId
      }) => tagId);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tagId) => !productTagIds.includes(tagId))
        .map((tagId) => {
          return {
            productId: req.params.id,
            tagId,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({
          tagId
        }) => !req.body.tagIds.includes(tagId))
        .map(({
          id
        }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({
          where: {
            id: productTagsToRemove
          }
        }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!deletedProduct) {
      res.status(404).json({
        message: 'No Product found with this id!'
      });
      return;
    }

    res.status(200).json(deletedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;