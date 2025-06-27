const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

console.log("inside reportRoutes.js")

// POST /api/report — submit a new report
router.post('/', async (req, res) => {
    console.log(" Received POST:"); 
  try {
    const newReport = new Report(req.body); // frontend sends full object
    const saved = await newReport.save();   // save to MongoDB
    res.status(201).json({
      message: 'Report submitted successfully',
      report: saved,
    });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({
      message: 'Failed to submit report',
      error: error.message,
    });
  }
});

// get request for all reprots
router.get('/getAllReports',async (req,res)=>{
    console.log("inside get route")
    try{

        const reports = await Report.find() // find all reports in MongoDB
        res.status(200).json({
            message: 'Reports retrieved successfully',
            reports: reports,
        })
    }
    catch(error){
        console.error('Error retrieving reports:', error);
        res.status(500).json({
            message: 'Failed to retrieve reports',
            error: error.message,
        })
    }

})

// get reportById
router.get("/:id",async (req,res)=>{
    try{

        const reportById = await Report.findById(req.params.id);
        if(!reportById) res.status(404).send(`Report not found with id: ${req.params.id}`);
        
        
        res.status(200).json(reportById)
    }
    catch(error){
        console.log("error ocurred ", error)
        res.status(500).json({
            message: 'Failed to retrieve report',
            error: error.message,
        })
    }
})

router.delete("/:id",async (req,res)=>{
  // const {id} = req.params; its also right but i messed it up by adding .params.id
  const id = req.params.id;
  try{
    const deleted = await Report.findByIdAndDelete(id);
    if(!deleted) res.status(404).json({message:"Report not found"})
    
      res.status(200).json({
        message: 'Report deleted successfully',
        report: deleted,
      })
  }
  catch(error){
    console.log("error while deleteing report ", error)
    res.status(500).json({
      message: 'Failed to delete report',
      error: error.message,
    })
  }
})

// updtading using patch
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Report.findByIdAndUpdate(id, req.body, {
      new: true,             // ye return krega updated document
      runValidators: true,   // validate against schema
    });

    if (!updated) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({
      message: 'Report updated successfully',
      report: updated,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      message: 'Failed to update report',
      error: error.message,
    });
  }
});

module.exports = router;
