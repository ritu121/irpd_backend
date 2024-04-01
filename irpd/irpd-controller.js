const {
  user_login,
  get_users,
  add_user,
  update_user,
  delete_user,
  get_roles,
  get_jobs,
  add_job,
  update_job,
  delete_job,
  get_user,
  get_searchJob,
  get_candidates,
  add_candidates,
  update_candidates,
  delete_candidates,
  add_candidates_resume,
  get_previous_exp,
  get_JobByStatus,
  getCandidateByJob,
  get_skills,
  add_skills,
  update_skills,
  delete_skills,
  get_searchByDate

} = require("./irpd-service");

const fs = require('fs');
const path = require('path');

module.exports = {
  //LoginController
  userLogin: (req, res) => {
    const body = req.body;

    var oldSend = res.send;
    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

    try {
      if (body.email == '' || body.password == '') {
        return res.status(404).json({
          status: 0,
          data: "Please provide email and password",
        });
      } else {
        user_login(body, (err, results) => {

          if (err) {
            if (err == 1) {
              return res.status(201).json({
                status: 0,
                message: results,
              });
            }
            return res.status(500).json({
              status: 0,
              message: err,
            });
          }

          if (results) {

            // const input = {
            //   mobile: body.email,
            //   pin: body.password,
            // };
            // const jsonwebtoken = sign(input, process.env.SECRET, {
            //   expiresIn: process.env.TOKENLIFE,
            // });

            // const refreshToken = sign(input, process.env.REFRESHTOKENSECRET, {
            //   expiresIn: process.env.REFRESHTOKENLIFE,
            // });

            const response = {
              status: 1,
              message: "login successfullyy",
              data: results[0],
              token: results.Token
              // accessToken: jsonwebtoken,
              // refreshToken: refreshToken,
            };

            // tokenList[refreshToken] = response;
            res.status(200).json(response);
          } else {
            return res.status(404).json({
              status: 0,
              data: "Invalid Creadential",
            });
          }

        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }

  },

  //roles

  getroles: (req, res) => {

    try {
      get_roles((err, results) => {

        if (err) {

          return res.status(500).json(err);
        }
        return res.status(200).json({ "status": 1, data: results[0] });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },
  //UserController
  getUsers: (req, res) => {
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }

    try {

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.pageSize) || 10
      const offset = (page - 1) * pageSize
      get_users(offset, pageSize, (err, results) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json({ "status": 1, results });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  getUser: (req, res) => {

    // console.log(req.params.id,"id");
    const user_id = req.params.user_id;
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }
    if (user_id == "" || user_id == undefined) {
      return res.status(201).json({
        status: 0,
        message: "Please provide user_id ",
      });
    }

    try {
      get_user(user_id, (err, results) => {

        if (err) {

          return res.status(500).json(err);
        }
        return res.status(200).json({ "status": 1, data: results[0] });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  addUser: (req, res) => {
    const body = req.body;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

    try {
      add_user(body, (err, results) => {

        if (err) {
          return res.status(500).json({ err });
        }
        return res.status(200).json({
          status: 1,
          message: "User Added sucessfully",
          data: results,
        });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }

  },
  updateUser: (req, res) => {
    const body = req.body;
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

    if (body.length < 1) {
      return res.status(201).json({
        status: 0,
        message: "Please provide user details ",
      });
    }
    try {
      update_user(body, (err, results) => {

        if (err) {

          return res.status(500).json(err);
        }
        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },


  deleteUser: (req, res) => {
    const body = req.body;
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

    if (body.length < 1) {
      return res.status(201).json({
        status: 0,
        message: "Please provide user details ",
      });
    }
    try {
      delete_user(body, (err, results) => {

        if (err) {

          return res.status(500).json(err);
        }
        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },
  //JobsController

  getJobByStatus:(req, res) => {
    
    const status = req.query.status;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }
    try {
      get_JobByStatus(status, (err, results) => {
        // console.log(results);
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json({ "status": 1, data: results[0] });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },


  getJobs: (req, res) => {
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }
    try {
      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.pageSize) || 10

      const offset = (page - 1) * pageSize

      get_jobs(pageSize, offset, (err, results) => {

        if (err) {

          return res.status(500).json(err);
        }

        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  addJob: (req, res) => {
    const body = req.body;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }
    try {
      add_job(body, (err, results) => {

        if (err) {
          return res.status(500).json({ err });
        }
        return res.status(200).json({
          status: 1,
          message: "Job Added sucessfully",
          data: results,
        });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }

  },
  updateJob: (req, res) => {
    const body = req.body;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

    if (body.length < 1) {
      return res.status(201).json({
        status: 0,
        message: "Please provide Job details ",
      });
    }
    try {
      update_job(body, (err, results) => {

        if (err) {

          return res.status(500).json(err);
        }
        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },
  deleteJob: (req, res) => {
    const body = req.body;
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

    if (body.length < 1) {
      return res.status(201).json({
        status: 0,
        message: "Please provide job details ",
      });
    }
    try {
      delete_job(body, (err, results) => {

        if (err) {

          return res.status(500).json(err);
        }
        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },


  //CandidateController
  getCandidates: (req, res) => {
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }

    try {
      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.pageSize) || 10

      const offset = (page - 1) * pageSize

      get_candidates(pageSize, offset, (err, results) => {

        if (err) {
          return res.status(500).json(err);
        }

        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  addCandidates: (req, res) => {
    // const { originalname, filename, path } = req.file;


    const body = req.body;
    var oldSend = res.send;



    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }
    try {
      add_candidates(body, (err, results) => {
        // add_candidates(body, originalname, filename, path, (err, results) => {

        if (err) {
          return res.status(500).json({ err });
        }
        return res.status(200).json({
          status: 1,
          message: "Candidate Added sucessfully",
          data: results,
        });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  updateCandidates: (req, res) => {
    const body = req.body;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }
    
    if (body.length < 1) {
      return res.status(201).json({
        status: 0,
        message: "Please provide Candidates details",
      });
    }
    try {
      update_candidates(body, (err, results) => {

        if (err) {

          return res.status(500).json(err);
        }
        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },
  deleteCandidates: (req, res) => {
    const id = req.params.id;
    var oldSend = res.send;
   
    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

      
    try {
      delete_candidates(id, (err, results) => {

        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  //SearchController
  getJobsearch: (req, res) => {
    // console.log(req.params.id,"id");
    const name = req.query.name;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }
    try {
      get_searchJob(name, (err, results) => {
        // console.log(results);
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json({ "status": 1, data: results[0] });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  getJobbyDate: (req, res) => {
    // console.log(req.params.id,"id");
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    var oldSend = res.send;
    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }
    try {
      get_searchByDate(startDate, endDate, (err, results) => {
        // console.log(results);
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json({ "status": 1, data: results[0] });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },


  getPrevious_Exp: (req, res) => {
    const id = req.params.candidate_id;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }
    try {
      get_previous_exp(id, (err, results) => {
        // console.log(results);
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json({ "status": 1, data: results[0] });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  addcandidateResume: (req, res) => {
    const { originalname, filename } = req.file;

    const body = req.body;
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }
    const { path: tempFilePath } = req.file;

    const destinationFilePath = path.join(__dirname, '../resumes', filename); // Use the desired filename for the destination


    try {
        add_candidates_resume(body, originalname, filename, tempFilePath, (err, results) => {
          if (err) {
            return res.status(500).json({ err });
          }
          return res.status(200).json({
            status: 1,
            message: "Candidate updated sucessfully",
            data: results,
          });
        });
     
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },


  updatecandidateResume: (req, res) => {
    const { originalname, filename,path } = req.file;

  
    const prev_file=req.params.filename
    const body = req.body;
   
    try {
        fs.unlinkSync(`../resumes/${prev_file}`)
        add_candidates_resume(body, originalname, filename, path, (err, results) => {
            if (err) {
              return res.status(500).json({ err });
            }
            return res.status(200).json({
              status: 1,
              message: "Candidate updated sucessfully",
              data: results,
            });
        });
        
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },


  //SearchController
  getResume: (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../resumes', filename);

    var oldSend = res.send;

    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Set the appropriate headers for PDF content
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

      // Stream the file to the client
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).send('File not found');
    }
  },
  
  getAllCandidateByJob: (req, res) => {
    const id = req.params.job_id;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }
    try {
      getCandidateByJob(id, (err, results) => {
        // console.log(results);
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json({ "status": 1, data: results[0] });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  // Skills==================================


  getSkills: (req, res) => {
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(response)
      oldSend.apply(res, arguments);
    }

    try {
      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.pageSize) || 10

      const offset = (page - 1) * pageSize

      get_skills((err, results) => {

        if (err) {

          return res.status(500).json(err);
        }

        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },

  addSkills: (req, res) => {
    const body = req.body;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

    try {
      add_skills(body, (err, results) => {

        if (err) {
          return res.status(500).json({ err });
        }
        return res.status(200).json({
          status: 1,
          message: "skill Added sucessfully",
          data: results,
        });
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }

  },


  updateSkills: (req, res) => {
    const skill_id = req.params.id;
    var oldSend = res.send;
    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }
    const body = req.body
    try {
      update_skills(body, skill_id, (err, results) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },


  deleteSkills: (req, res) => {
    const skill_id = req.params.id;
    var oldSend = res.send;

    res.send = function (response) {
      // add_log(body, response)
      oldSend.apply(res, arguments);
    }

    try {
      delete_skills(skill_id, (err, results) => {
        if(err){
          return res.status(500).json(err);
        }
        return res.status(200).json(results);
      });
    } catch(error){
      return res.status(500).json({
        status: 0,
        err: error,
      });
    }
  },



}
