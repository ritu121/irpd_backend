const {
  userLogin,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getroles,
  getJobs,
  addJob,
  updateJob,
  deleteJob,
  getUser,
  getJobsearch,
  addCandidates,
  getCandidates,
  updateCandidates,
  deleteCandidates,
  getResume,
  addcandidateResume,
  getPrevious_Exp,
  updatecandidateResume,  
  getJobByStatus,
  getAllCandidateByJob,
  getSkills,
  addSkills,
  updateSkills,
  deleteSkills,
  getJobbyDate,
  getSchedule,
  updateSchedule,
  addSchedule,
  deleteSchedule
} = require("./irpd-controller");

const multer = require('multer');


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "../resumes")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({storage})

const router = require("express").Router();
// --UserLoginRoute
router.post("/userLogin", userLogin);
// --UserRoute
router.get("/getUser/:user_id", getUser);
// router.get("/getUsers", getUsers);
router.post("/addUser", addUser);
router.patch("/updateUser", updateUser);
router.delete("/deleteUser", deleteUser);

// --JobsRoute
router.get("/getJobs", getJobs);
router.get("/getJobByStatus", getJobByStatus);
router.post("/addJob", addJob);
router.patch("/updateJob", updateJob);
router.delete("/deleteJob", deleteJob);

// ---Search
router.get("/search", getJobsearch);
router.get("/searchbydate", getJobbyDate);
router.get("/roles", getroles);




//----Candidates
router.get("/getCandidates", getCandidates);
router.post("/addCandidates",addCandidates);
router.patch("/updateCandidates", updateCandidates);
router.delete("/deleteCandidates/:id", deleteCandidates);


//----Skills
router.get("/getSkills", getSkills);
router.post("/addSkills", addSkills);
router.patch("/updateSkills/:id", updateSkills);
router.delete("/deleteSkills/:id", deleteSkills);

//----Skills
router.get("/getSkills", getSkills);
router.post("/addSkills", addSkills);
router.patch("/updateSkills/:id", updateSkills);
router.delete("/deleteSkills/:id", deleteSkills);


//----Schedule
router.get("/getSchedule", getSchedule);
router.post("/addSchedule", addSchedule);
router.patch("/updateSchedule/:id", updateSchedule);
router.delete("/deleteSchedule/:id", deleteSchedule);





//----getPreview Experience
router.get("/getPrevious_Exp/:candidate_id", getPrevious_Exp);


//----Resume Download

router.get("/download/:filename", getResume);
router.post("/addCandidatesResume",upload.single('file'), addcandidateResume);
router.patch("/updateCandidatesResume/:filename", upload.single('file'), updatecandidateResume);


router.get("/getCandidateByJob/:job_id",getAllCandidateByJob)




module.exports = router;   
