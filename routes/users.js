var express = require('express');
var router = express.Router();
var ManagementClient = require('auth0').ManagementClient;
var axios = require("axios");


const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const { AUTH0_ACCOUNT, AUTH0_CLIENT_SECRET, AUTH0_CLIENT_ID } = process.env

var auth0 = new ManagementClient({
    domain: `${AUTH0_ACCOUNT}.us.auth0.com`,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
});
const apiUrl =
    process.env.STOCKIST_API || "http://localhost:8000/api";
  
/* GET users listing. */
router.get('/', async function (req, res, next) {
    if (req.query.role) {
        auth0Users = await auth0.getUsersInRole({ id: req.query.role });
        var allUsers = await auth0.getUsers();
        let data = []
        for (let i = 0; i < allUsers.length; i++) {
            for(let j = 0; j < auth0Users.length; j++){
                if(allUsers[i].user_id === auth0Users[j].user_id){
                    data.push(allUsers[i])
                }
            }
        }
        return res.json(data);
    }
});

router.get("/roles", async (req, res, next) => {
    var roles = await auth0.getRoles();
    var data = []
    if (req.query.q) {
        for (let index = 0; index < roles.length; index++) {
            const element = roles[index];
            if (req.query.q.toLocaleLowerCase() == element.name.toLocaleLowerCase()) {
                data.push(element)
            }
        }
    }
    else {
        data = roles
    }
    res.json(data);
});

router.post("/", async (req, res, next) => {
    var userCreated = await auth0.createUser({
        email: req.body.email,
        password: req.body.password,
        connection: 'Username-Password-Authentication',
    });
    if (req.body.role) {
        const response = await auth0.assignRolestoUser({ id: userCreated.user_id }, { "roles": [req.body.role] });
    }
    axios.post(apiUrl+"/user",{
        username : req.body.email.split("@")[0],
        password : req.body.password,
    }).then( r => {
        res.json({ "message": "User created" });
    }).catch( err => {
        res.json({ "message": "Generation error" });
    })
});


router.delete("/:id", async (req, res, next) => {
    var deletedUser = await auth0.deleteUser({ id : req.params.id });
    return res.json(deletedUser);
});

module.exports = router;
