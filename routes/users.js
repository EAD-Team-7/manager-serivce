var express = require('express');
var router = express.Router();
var ManagementClient = require('auth0').ManagementClient;


const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const { AUTH0_ACCOUNT, AUTH0_CLIENT_SECRET, AUTH0_CLIENT_ID } = process.env

var auth0 = new ManagementClient({
    domain: `${AUTH0_ACCOUNT}.us.auth0.com`,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
});
/* GET users listing. */
router.get('/', async function (req, res, next) {

    var users = await prisma.user.findMany();
    if (users.length == 0) {
        await prisma.user.create({
            data: {
                name: 'Rich',
                email: 'hello@prisma.com',
                posts: {
                    create: {
                        title: 'My first post',
                        body: 'Lots of really interesting stuff',
                        slug: 'my-first-post',
                    },
                },
            },
        })
    }
    // Pagination settings.
    var params = {
        search_engine: 'v3',
        per_page: 10,
        page: 0
    };
    var auth0Users = await auth0.getUsers();
    return res.json(auth0Users);
});

router.get("/roles", async (req, res, next) => {
    var roles = await auth0.getRoles();
    res.json(roles);
});

router.post("/", async (req, res, next) => {
    var userCreated = await auth0.createUser({
        email: req.body.email,
        password: req.body.password,
        connection: 'Username-Password-Authentication',
    });
    if (userCreated) {
        res.json({ "message": "User created" });
    }
    else {
        res.json({ "message": "Generation error" });
    }
});

module.exports = router;
