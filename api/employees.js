const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '.database.sqlite');

employeesRouter.param("id", (req, res, next, id) => {
    db.get("SELECT * FROM Employee WHERE id = $id", {
        $id: id
    }, (error, row) => {
        if (error) {
            next(error);
        } else if (row) {
            req.id = row;
            next()
        } else {
            res.sendStatus(404);
        }
    });
});

employeesRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (error, row) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({employees: row});
        }
    });
});

const validateEmployee = (req, res, next) => {
    const newEmployee = req.body.employee;
    if (!newEmployee.name || !newEmployee.position || !newEmployee.wage || !newEmployee.is_current_employee) {
        res.sendStatus(400);
    } else {
        next();
    }
};

employeesRouter.post("/", validateEmployee, (req, res, next) => {
    const newEmployee = req.body.employee;
    db.run("INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)", {
        $name: newEmployee.name,
        $position: newEmployee.position,
        $wage: newEmployee.wage,
        $isCurrentEmployee: newEmployee.is_current_employee
    }, (error, row) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, row) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({employee: row});
                }
            })
        }
    });
});

employeesRouter.get("/:id", (req, res, next) => {
    res.status(200).json({employee: req.id});
});

employeesRouter.put("/:id", validateEmployee, (req, res, next) => {
    const updatedEmployee = req.body.employee;
    db.run("Update Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $id)", {
        $name: updatedEmployee.name,
        $position: updatedEmployee.position,
        $wage: updatedEmployee.wage,
        $isCurrentEmployee: updatedEmployee.is_curent_employee,
        $id: req.params.id
    }, (error, row) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.id}`, (error, row) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({employee: row});
                }
            });
        }
    });
});

module.exports = employeesRouter;