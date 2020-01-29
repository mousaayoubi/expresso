const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const validateMenuItem = (req, res, next) => {
    const newMenuItem = req.body.menuItem;
    if (!newMenuItem.name || !newMenuItem.description || !newMenuItem.inventory || !newMenuItem.price) {
        res.sendStatus(400);
    } else {
        next();
    }
};

menuItemsRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM MenuItem WHERE menu_id = $menuId", {
        $menuId: req.params.menuId
    }, (error, row) => {
        if (error) {
            next(error);
        } else if (row) {
            res.status(200).json({menuItems: row})
        } else {
            res.json({menuItems: []});
        }
    });
});

menuItemsRouter.post("/", validateMenuItem, (req, res, next) => {
    const newMenuItem = req.body.menuItem;
    db.run("INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)", {
        $name: newMenuItem.name,
        $description: newMenuItem.description,
        $inventory: newMenuItem.inventory,
        $price: newMenuItem.price,
        $menuId: req.params.menuId
    }, function (error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, row) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({menuItem: row});
                }
            });
        }
    });
});

module.exports = menuItemsRouter;