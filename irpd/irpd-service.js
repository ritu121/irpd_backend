const connect_pool = require("./config/database");
const mysql = require('mysql2/promise');
const https = require('https');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer')

require("dotenv").config({ path: "../.env" });
const db_conn = {
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}
module.exports = {
  add_log: (request, response) => {
    var req = JSON.stringify(request);

    try {
      connect_pool.query(
        `INSERT into tbl_dealer_error_log(request,response)
        VALUES(?,?)`,
        [req, response]
      );
    } catch (e) { }
  },
  //UserLogin-service
  user_login: async (body, callBack) => {
    try {
      let qr1 = 'SELECT * FROM tbl_users WHERE email = ? AND password = ?';
      let qr2 = 'SELECT * FROM tbl_roles WHERE role_id = ?';

      // console.log(qr2);
      var qr1_res = await new Promise((res, rej) => {

        connect_pool.query(qr1, [body.email, body.password], (row1_err, row1) => {
          if (row1_err) return callBack(row1_err);
          const token = jwt.sign({ userId: [row1['role_id']] }, 'your-secret-key', { expiresIn: '2h' });
          if (row1.length > 0) {
            res([{ ...row1, "Token": token }]);
          } else {
            return callBack(row1_err)
          }

          // connect_pool.query(qr2, [row1['role_id']], (row2_err, row2) => {
          //   if (row2_err) return callBack(row2_err);

          //   console.log('====================================');
          //   console.log(row2['role_name'],token);
          //   console.log('====================================');

          //   // res([{...row1[0],'token':token}]);
          // });
          // res(row1);
        });
      });
      if (qr1_res.length < 1) {
        let err_report = "Invalid email or password";
        return callBack(1, err_report);
      }

      return callBack(null, qr1_res[0]);

    } catch (err) {
      callBack(err)
    }
  },

  get_searchJob: async (name, callBack) => {
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM tbl_jobs WHERE budget LIKE '%${name}%' OR job_title LIKE '%${name}%' OR job_description LIKE '%${name}%' OR edu_qualification LIKE '%${name}%' OR skills LIKE '%${name}%' OR certifications LIKE '%${name}%' OR hire_type LIKE '%${name}%' OR status LIKE '%${name}%' OR client_name LIKE '%${name}%' OR no_of_positions LIKE '%${name}%' OR job_id LIKE '%${name}%'`;


      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1, [name],
          (result1_err, results_1) => {

            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res([results_1]);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },

  get_searchByDate: async (startDate, endDate, callBack) => {
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM tbl_jobs WHERE start_date BETWEEN ? AND ?`;;


      var qr1_res = await new Promise((res, rej) => {
        let bodystartDate = new Date(startDate);
        let bodytargetDate = new Date(endDate);

        // Increase start_date and last_work_date by one day
        bodystartDate.setDate(bodystartDate.getDate() - 1);
        bodytargetDate.setDate(bodytargetDate.getDate() - 1);


        connect_pool.query(qr1, [bodystartDate, bodytargetDate],
          (result1_err, results_1) => {

            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res([results_1]);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },

  //roles

  get_roles: async (callBack) => {

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM tbl_roles`;
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          (result1_err, results_1) => {
            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res([results_1]);
          });
      });

      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },
  //User-services
  get_users: async (offset, pageSize, callBack) => {

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM tbl_users LIMIT ${pageSize} OFFSET ${offset}`;
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          (result1_err, results_1) => {

            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res(results_1);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },



  get_user: async (user_id, callBack) => {

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = "SELECT * FROM tbl_users WHERE user_id = ?";
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1, [user_id],
          (result1_err, results_1) => {

            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res(results_1);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },


  add_user: async (body, callBack) => {

    var qr1 = "INSERT INTO tbl_users (first_name, last_name, gender, mobile, email, password, role) VALUES (?,?,?,?,?,?,?)";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      //await connect_pool.beginTransaction()
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          [body.first_name, body.last_name, body.gender, body.mobile, body.email, body.password, body.role],
          (row1_err, row1) => {
            if (row1_err) {
              connection.rollback(); return callBack({ status: 0, message: row1_err });
            }
            res(row1);
          });
      });

      connection.commit();
      connection.end();
      let res_obj = {
        "result": qr1_res,
      }
      return callBack(null, res_obj)
    } catch (err) {
      //connection.rollback();
      //connection.releaseConnection();
      return callBack({ status: 0, message: err })
    }
  },


  update_user: async (body, callBack) => {

    var qr2 = "SELECT * FROM tbl_users WHERE user_id = ?";
    var qr4 = "UPDATE tbl_users SET first_name = ?, last_name = ?, email = ?, mobile = ?,password = ?,role_id = ?,updated_by = ? WHERE user_id = ?";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      var qr2_res = await new Promise((res, rej) => {
        connect_pool.query(qr2, [body.user_id], (row2_err, row2) => {

          if (row2_err) {
            connection.rollback(); return callBack({ status: 0, message: row2_err });
          }
          res(row2);
        });
      });
      if (qr2_res.length < 1) {
        return callBack({ status: 0, message: "No user found" });
      }

      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [body.first_name, body.last_name, body.email, body.mobile, body.password, body.role_id, body.updated_by, body.user_id],
          (result4_err, results_4) => {

            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "You have updated user sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },
  delete_user: async (body, callBack) => {

    var qr2 = "SELECT * FROM tbl_users WHERE user_id = ?";
    var qr4 = "DELETE FROM tbl_users WHERE user_id = ?";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      var qr2_res = await new Promise((res, rej) => {
        connect_pool.query(qr2, [body.user_id], (row2_err, row2) => {

          if (row2_err) {
            connection.rollback(); return callBack({ status: 0, message: row2_err });
          }
          res(row2);
        });
      });
      if (qr2_res.length < 1) {
        return callBack({ status: 0, message: "No user found" });
      }

      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [body.user_id],
          (result4_err, results_4) => {

            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "Your have deleted the user sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },
  //Jobs-services

  get_JobByStatus: async (status, callBack) => {
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM tbl_jobs WHERE status = '${status}'`;

      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1, [status],
          (result1_err, results_1) => {

            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res([results_1]);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },


  get_jobs: async (pageSize, offset, callBack) => {

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM tbl_jobs LIMIT ${pageSize} OFFSET ${offset}`;
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          (result1_err, results_1) => {

            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res(results_1);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },
  add_job: async (body, callBack) => {

    var qr1 = "INSERT INTO tbl_jobs (job_title, job_description, edu_qualification, budget, skills, year_of_experience, certifications, status, no_of_positions, hire_type, start_date, target_date, closed_date, client_name, location, user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      //await connect_pool.beginTransaction()
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          [body.job_title, body.job_description, body.edu_qualification, body.budget, body.skills, body.year_of_experience, body.certifications, body.status, body.no_of_positions, body.hire_type, body.start_date, body.target_date, body.closed_date, body.client_name, body.location, body.user_id],
          (row1_err, row1) => {
            if (row1_err) {
              connection.rollback(); return callBack({ status: 0, message: row1_err });
            }
            res(row1);
          });
      });

      connection.commit();
      connection.end();
      let res_obj = {
        "result": qr1_res,
      }
      return callBack(null, res_obj)
    } catch (err) {
      //connection.rollback();
      //connection.releaseConnection();
      return callBack({ status: 0, message: err })
    }
  },

  update_job: async (body, callBack) => {



    var qr2 = "SELECT * FROM tbl_jobs WHERE job_id = ?";
    var qr3 = "UPDATE tbl_candidates SET comments =?, status=? WHERE candidate_id=?";
    var qr4 = "UPDATE tbl_jobs SET job_title = ?, job_description = ?, edu_qualification = ?, budget = ?,skills = ?,year_of_experience = ?,certifications = ?,status = ?,no_of_positions = ?,hire_type = ?,start_date = ?,target_date = ?,client_name = ?,location = ? ,user_id = ?  WHERE job_id = ?";


    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {
      var qr4_res = await new Promise((res, rej) => {

        let bodystartDate = new Date(body.start_date);
        let bodylastWorkDate = new Date(body.target_date);

        // Increase start_date and last_work_date by one day
        bodystartDate.setDate(bodystartDate.getDate() + 1);
        bodylastWorkDate.setDate(bodylastWorkDate.getDate() + 1);

        connect_pool.query(qr4, [body.job_title, body.job_description, body.edu_qualification, body.budget, body.skills, body.year_of_experience, body.certifications, body.status, body.no_of_positions, body.hire_type, bodystartDate, bodylastWorkDate, body.client_name, body.location, body.user_id, body.job_id],
          (result4_err, results_4) => {
            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }

            try {
               body.candidateInfo.map(async (data) => {
                  try {
                      const result = await new Promise((resolve, reject) => {
                          connect_pool.query(
                              qr3, [data.comments, data.status, data.candidate_id],
                              (row2_err, row2) => {
                                  if (row2_err) {
                                    return callBack({ status: 0, message: row2_err });
                                  } else {
                                      resolve(row2);
                                  }
                              }
                          );
                      });
                      
                  } catch (err) {
                      // Handle error if needed
                      console.error(err);
                  }
              });
          } catch (err) {
              connection.rollback();
              return callBack({ status: 0, message: err });
          }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "You have updated job sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },
  delete_job: async (body, callBack) => {

    var qr2 = "SELECT * FROM tbl_jobs WHERE job_id = ?";
    var qr4 = "DELETE FROM tbl_jobs WHERE job_id = ?";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      var qr2_res = await new Promise((res, rej) => {
        connect_pool.query(qr2, [body.job_id], (row2_err, row2) => {

          if (row2_err) {
            connection.rollback(); return callBack({ status: 0, message: row2_err });
          }
          res(row2);
        });
      });
      if (qr2_res.length < 1) {
        return callBack({ status: 0, message: "No Job found" });
      }

      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [body.job_id],
          (result4_err, results_4) => {

            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "Your have deleted the job sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },


  //Candidates-services
  get_candidates: async (pageSize, offset, callBack) => {

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM tbl_candidates LIMIT ${pageSize} OFFSET ${offset}`;
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          (result1_err, results_1) => {
            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res([results_1]);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },


  // const storage = multer.diskStorage({
  //   destination: function(req, file, cb) {
  //     return cb(null, "./public/images")
  //   },
  //   filename: function (req, file, cb) {
  //     return cb(null, `${Date.now()}_${file.originalname}`)
  //   }
  // }) 

  add_candidates: async (body, callBack) => {
    // add_candidates: async (body,originalname, filename, path, callBack) => {

   

    var qr1 = "INSERT INTO tbl_candidates (first_name,middle_name,last_name,key_skills,other_skills,year_of_experience,qualifications,permanent_address,current_address,notice_period,current_company,current_ctc,expected_ctc,designation,roles_and_responsibilities,start_date,last_work_date,user_id,job_id,status,comments) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      let bodystartDate = new Date(body.start_date);
      let bodylastWorkDate = new Date(body.last_work_date);

      // Increase start_date and last_work_date by one day
      bodystartDate.setDate(bodystartDate.getDate() + 1);
      bodylastWorkDate.setDate(bodylastWorkDate.getDate() + 1);

      //await connect_pool.beginTransaction()
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          [body.first_name, body.middle_name, body.last_name, body.key_skills, body.other_skills, body.year_of_experience, body.qualifications, body.permanent_address, body.current_address, body.notice_period, body.current_company, body.current_ctc, body.expected_ctc, body.designation, body.roles_and_responsibilities, bodystartDate, bodylastWorkDate, body.user_id, body.job_id, body.status, body.comments],
          // [originalname,filename,path,body.first_name,body.middle_name,body.last_name,body.key_skills,body.other_skills,body.year_of_experience,body.qualifications,body.permanent_address,body.current_address,body.notice_period,body.current_company,body.current_ctc,body.expected_ctc,body.designation,body.roles_and_responsibilities,body.start_date,body.last_work_date,body.user_id],
          (row1_err, row1) => {
            if (row1_err) {
              connection.rollback(); return callBack({ status: 0, message: row1_err });
            }

            // res(row1);

            body.previous_experience.forEach((prevExp_data) => {
              try {

                // Convert start_date and last_work_date to JavaScript Date objects
                let startDate = new Date(prevExp_data.start_date);
                let lastWorkDate = new Date(prevExp_data.last_work_date);

                // Increase start_date and last_work_date by one day
                startDate.setDate(startDate.getDate() + 1);
                lastWorkDate.setDate(lastWorkDate.getDate() + 1);


                connect_pool.query(
                  `INSERT INTO tbl_candidate_prev_exp (candidate_id,company,designation,year_of_experience,roles_and_responsibilities,start_date,last_work_date) VALUES (?,?,?,?,?,?,?)`,
                  [
                    row1.insertId,
                    prevExp_data.company,
                    prevExp_data.designation,
                    prevExp_data.year_of_experience,
                    prevExp_data.roles_and_responsibilities,
                    startDate,
                    lastWorkDate
                  ],
                  (row2_err, row2) => {
                    if (row2_err) {
                      connection.rollback(); return callBack({ status: 0, message: row2_err });
                    }
                    res(row1);
                  }
                )
              } catch (err) {
                //connection.rollback();
                //connection.releaseConnection();
                return callBack({ status: 0, message: err })
              }
            })
          });
      });

      connection.commit();
      connection.end();
      let res_obj = {
        "result": qr1_res,
      }
      return callBack(null, res_obj)
    } catch (err) {
      //connection.rollback();
      //connection.releaseConnection();
      return callBack({ status: 0, message: err })
    }
  },


  update_candidates: async (body, callBack) => {


    var qr2 = "SELECT * FROM tbl_candidates WHERE candidate_id = ?";
    var qr3 = "DELETE FROM tbl_candidate_prev_exp WHERE candidate_id = ?";
    var qr4 = "UPDATE tbl_candidates SET first_name= ?,middle_name=?,last_name=?,key_skills=?,other_skills=?,year_of_experience=?,qualifications=? ,permanent_address=?,current_address=?,notice_period=?,current_company=?,current_ctc=?,expected_ctc=?,designation=?,roles_and_responsibilities=?,start_date=?,last_work_date=? ,user_id = ?,job_id =?, status=?, comments=?  WHERE candidate_id = ?";

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {
      let bodystartDate = new Date(body.start_date);
      let bodylastWorkDate = new Date(body.last_work_date);

      // Increase start_date and last_work_date by one day
      bodystartDate.setDate(bodystartDate.getDate() + 1);
      bodylastWorkDate.setDate(bodylastWorkDate.getDate() + 1);



      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [body.first_name, body.middle_name, body.last_name, body.key_skills, body.other_skills, body.year_of_experience, body.qualifications, body.permanent_address, body.current_address, body.notice_period, body.current_company, body.current_ctc, body.expected_ctc, body.designation, body.roles_and_responsibilities, bodystartDate, bodylastWorkDate, body.user_id, body.job_id, body.status, body.comments, body.candidate_id],
          (result4_err, results_4) => {
            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }

            try {
              connect_pool.query(qr3, [body.candidate_id], (row2_err, row2) => {

                if (row2_err) {
                  connection.rollback();
                  return callBack({ status: 0, message: row2_err });
                }


                body.previous_experience?.forEach((prevExp_data) => {
                  try {
                    // Convert start_date and last_work_date to JavaScript Date objects
                    let startDate = new Date(prevExp_data.start_date);
                    let lastWorkDate = new Date(prevExp_data.last_work_date);

                    // Increase start_date and last_work_date by one day
                    startDate.setDate(startDate.getDate() + 1);
                    lastWorkDate.setDate(lastWorkDate.getDate() + 1);



                    connect_pool.query(
                      `INSERT INTO tbl_candidate_prev_exp (candidate_id,company,designation,year_of_experience,roles_and_responsibilities,start_date,last_work_date) VALUES (?,?,?,?,?,?,?)`,
                      [
                        body.candidate_id,
                        prevExp_data.company,
                        prevExp_data.designation,
                        prevExp_data.year_of_experience,
                        prevExp_data.roles_and_responsibilities,
                        startDate,
                        lastWorkDate
                      ],
                      (row2_err, row2) => {
                        if (row2_err) {
                          connection.rollback(); return callBack({ status: 0, message: row2_err });
                        }
                        res(results_4);
                      }
                    )
                  } catch (err) {
                    //connection.rollback();
                    //connection.releaseConnection();
                    return callBack({ status: 0, message: err })
                  }
                })

              })
            } catch (err) {
              return callBack({ status: 0, message: err })
            }
            // res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "Your have updated job sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },


  delete_candidates: async (id, callBack) => {

    var qr2 = "SELECT * FROM tbl_candidates WHERE candidate_id = ?";
    var qr4 = "DELETE FROM tbl_candidates WHERE candidate_id = ?";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      var qr2_res = await new Promise((res, rej) => {
        connect_pool.query(qr2, [id], (row2_err, row2) => {
          if (row2_err) {
            connection.rollback(); return callBack({ status: 0, message: row2_err });
          }
          res(row2);
        });
      });
      if (qr2_res.length < 1) {
        return callBack({ status: 0, message: "No candidate found" });
      }

      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [id],
          (result4_err, results_4) => {

            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "Your have deleted the candidate sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },


  add_candidates_resume: async (body, originalname, filename, path, callBack) => {

    var qr1 = "UPDATE  tbl_candidates  SET originalname = ?, filename = ?, path = ? WHERE candidate_id =?";

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {
      //await connect_pool.beginTransaction()
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          [originalname, filename, path, body.candidate_id],
          (row1_err, row1) => {
            if (row1_err) {
              connection.rollback(); return callBack({ status: 0, message: row1_err });
            }
            res(row1);
          });
      });

      connection.commit();
      connection.end();
      let res_obj = {
        "result": qr1_res,
      }
      return callBack(null, res_obj)
    } catch (err) {
      //connection.rollback();
      //connection.releaseConnection();
      return callBack({ status: 0, message: err })
    }
  },



  get_previous_exp: async (id, callBack) => {
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {
      var qr1 = `SELECT * FROM tbl_candidate_prev_exp WHERE candidate_id = ?`;
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1, [id],
          (result1_err, results_1) => {
            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res([results_1]);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },

  getCandidateByJob: async (id, callBack) => {
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {
      var qr1 = `SELECT c.* FROM tbl_jobs job LEFT JOIN tbl_candidates AS c ON c.job_id = job.job_id WHERE job.job_id =?`;
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1, [id],
          (result1_err, results_1) => {
            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res([results_1]);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },

  // Skills====================================================================

  get_skills: async (callBack) => {

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM skills`;
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          (result1_err, results_1) => {
            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res(results_1);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },


  add_skills: async (body, callBack) => {
    var qr1 = "INSERT INTO skills (skill_name) VALUES (?)";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      //await connect_pool.beginTransaction()
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          [body.skill_name],
          (row1_err, row1) => {
            if (row1_err) {
              connection.rollback(); return callBack({ status: 0, message: row1_err });
            }
            res(row1);
          });
      });

      connection.commit();
      connection.end();
      let res_obj = {
        "result": qr1_res,
      }
      return callBack(null, res_obj)
    } catch (err) {
      //connection.rollback();
      //connection.releaseConnection();
      return callBack({ status: 0, message: err })
    }
  },


  update_skills: async (body, skill_id, callBack) => {

    var qr2 = "SELECT * FROM skills WHERE skill_id = ?";
    var qr4 = "UPDATE skills SET skill_name = ? WHERE skill_id = ?";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      var qr2_res = await new Promise((res, rej) => {
        connect_pool.query(qr2, [skill_id], (row2_err, row2) => {

          if (row2_err) {
            connection.rollback(); return callBack({ status: 0, message: row2_err });
          }
          res(row2);
        });
      });
      if (qr2_res.length < 1) {
        return callBack({ status: 0, message: "No user found" });
      }

      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [body.skill_name, skill_id],
          (result4_err, results_4) => {

            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "You have updated skill sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },

  delete_skills: async (skill_id, callBack) => {

    var qr2 = "SELECT * FROM skills WHERE skill_id = ?";
    var qr4 = "DELETE FROM skills WHERE skill_id = ?";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      var qr2_res = await new Promise((res, rej) => {
        connect_pool.query(qr2, [skill_id], (row2_err, row2) => {

          if (row2_err) {
            connection.rollback(); return callBack({ status: 0, message: row2_err });
          }
          res(row2);
        });
      });
      if (qr2_res.length < 1) {
        return callBack({ status: 0, message: "No user found" });
      }

      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [skill_id],
          (result4_err, results_4) => {

            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "Your have deleted the skill sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },



  // Schedule====================================================================

  get_schedule: async (callBack) => {
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();

    try {

      var qr1 = `SELECT * FROM tbl_scheduler`;
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          (result1_err, results_1) => {
            if (result1_err) {
              connection.rollback();
              return callBack({ status: 0, message: result1_err });
            }
            res(results_1);
          });
      });
      if (qr1_res.length == 0) {
        return callBack({ status: 0, message: "No records found" })
      }
      await connection.commit();
      await connection.end();
      return callBack(null, qr1_res)
    }
    catch (err) {
      await connection.rollback()
      // connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },


  add_schedule: async (body, callBack) => {
    var qr1 = "INSERT INTO tbl_scheduler (schedule_id,title,start_time,end_time,candidate_id,candidate_name) VALUES (?,?,?,?,?,?)";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      //await connect_pool.beginTransaction()
      var qr1_res = await new Promise((res, rej) => {
        connect_pool.query(qr1,
          [body.schedule_id,body.title,body.start_time,body.end_time,body.candidate_id,body.candidate_name],
          (row1_err, row1) => {
            if (row1_err) {
              connection.rollback(); return callBack({ status: 0, message: row1_err });
            }
            res(row1);
          });
      });

      connection.commit();
      connection.end();
      let res_obj = {
        "result": qr1_res,
      }
      return callBack(null, res_obj)
    } catch (err) {
      //connection.rollback();
      //connection.releaseConnection();
      return callBack({ status: 0, message: err })
    }
  },


  update_schedule: async (body, schedule_id, callBack) => {

    var qr2 = "SELECT * FROM tbl_scheduler WHERE schedule_id = ?";
    var qr4 = "UPDATE tbl_scheduler SET title = ?, start_time = ?, end_time = ?, interviewer_name = ? WHERE schedule_id = ?";

    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      var qr2_res = await new Promise((res, rej) => {
        connect_pool.query(qr2, [schedule_id], (row2_err, row2) => {

          if (row2_err) {
            connection.rollback(); return callBack({ status: 0, message: row2_err });
          }
          res(row2);
        });
      });
      if (qr2_res.length < 1) {
        return callBack({ status: 0, message: "No user found" });
      }

      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [body.title, body.start_time, body.end_time,body.interviewer_name,schedule_id],
          (result4_err, results_4) => {

            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "You have updated schedule sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  },

  delete_schedule: async (schedule_id, callBack) => {

    var qr2 = "SELECT * FROM tbl_scheduler  WHERE schedule_id = ?";
    var qr4 = "DELETE  FROM tbl_scheduler  WHERE schedule_id = ?";
    const connection = await mysql.createConnection(db_conn);
    await connection.beginTransaction();
    try {

      var qr2_res = await new Promise((res, rej) => {
        connect_pool.query(qr2, [schedule_id], (row2_err, row2) => {

          if (row2_err) {
            connection.rollback(); return callBack({ status: 0, message: row2_err });
          }
          res(row2);
        });
      });
      if (qr2_res.length < 1) {
        return callBack({ status: 0, message: "No user found" });
      }

      var qr4_res = await new Promise((res, rej) => {
        connect_pool.query(qr4, [schedule_id],
          (result4_err, results_4) => {

            if (result4_err) {
              connection.rollback();
              return callBack({ status: 0, message: result4_err });
            }
            res(results_4);
          });
      });
      await connection.commit();
      await connection.end();

      return callBack(null, { status: 1, message: "Your have deleted the schedule sucussesfully" })
    }
    catch (err) {
      await connection.rollback()
      //connection.releaseConnection()
      return callBack({ status: 0, message: err });
    }
  }


};



