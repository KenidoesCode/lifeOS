const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// CREATE A NEW TASK
router.post("/",auth,async (req,res) => {
    try {
        const task = await Task.create({
            user: req.user.id,
            title: req.body.title,
            description: req.body.description,
            dueAt: req.body.dueAt,
            priority: req.body.priority,
            source: req.body.source || "manual",
        });
        res.status(201).json(task);
        }catch (err) {
            res.status(500).json({error : "Task creation Failed" });

        }
    
});

// GET TODAY TASKS

router.get("/today", auth , async(req,res) => {
    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    const tasks= await Task.find({
        user: req.user.id,
        dueAt: { $gte: start, $lte: end},
    }).sort({ priority: -1 });

    res.json(tasks);
});

//GET UPCOMING TASKS(TIMELINE SCREEEN)

router.get("/upcoming", auth , async(req,res) => {
    try {
        const now = new Date();

        const tasks = await Task.find({
            user: req.user.id,
            completed: false,
            dueAt: {$gte: now},
        }).sort({ dueAt: 1 });

        res.json(tasks);
    }catch(err) {
        res.status(500).json({ error: "Failed to fetch upcming tasks"});
    }
});


// MARK TASKS ARE COMPLETE


router.patch("/:id/complete", auth, async( req,res) => {
    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { completed: true },
        { new: true }
    );

    res.json(task);
});


//DELETE TASKS

router.delete("/:id", auth, async (req,res) => {
    await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
    });

    res.json({sucess : true });
    
});


module.exports = router;