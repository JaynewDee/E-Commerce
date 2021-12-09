const router = require('express').Router();
const {
  Category,
  Product
} = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const catData = await Category.findAll({
      include: Product,
    });
    res.status(200).json(catData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const singleCat = await Category.findByPk(req.params.id, {
      include: Product
    });

    if (!singleCat) {
      res.status(404).json({
        message: 'No Category found with this ID!'
      });
      return;
    }
    res.status(200).json(singleCat);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  req.body = {
    category_name: "Sports"
  }

  try {
    const newCat = await Category.create(req.body);
    res.status(200).json(newCat);
  } catch (err) {
    res.status(400).json(err)
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  req.body = {
    category_name: "Footwear"
  }

  try {
    const catUpdate = await Category.update(req.body, {
      where: {
        id: req.params.id
      }
    })

    if (!catUpdate) {
      res.status(404).json({
        message: 'No Category found with this ID!'
      })
      return;
    }
    res.status(200).json(catUpdate);
  } catch (err) {
    res.status(500).json(err)
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const catDelete = await Category.destroy({
      where: {
        id: req.params.id
      }
    })

    if (!catDelete) {
      res.status(404).json({
        message: 'No Category found with this ID!'
      })
      return;
    }
    res.status(200).json(catDelete);
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;