const axios = require("axios");

const BACKEND_URL = "https://localhost:3000/api/v1";

describe("Authentication", () => {
    test('User is able to sign up only once', async() => {
        const username = "Prashant" + Math.random();
        const password = "12345678"
        const res = await axios.post(`${BACKEND_URL}/signup`, {
            username,
            password,
            role: "admin",
        })

        expect(res.status).toBe(200) 

        const updatedRes = await axios.post(`${BACKEND_URL}/signup`, {
            username,
            password,
            role: "admin",
        })

        expect(updatedRes.status).toBe(400) 
    })

    test('Signup request fails if the username is empty', async () => {
        const password = "12345678"

        const res = await axios.post(`${BACKEND_URL}/signup`, {
            password
        })

        expect(res.status).toBe(400)
    })

    test('User is able to sign in', async() => {
        const username = `prashant-${Math.random()}`;
        const password = '12345678';

        await axios.post(`${BACKEND_URL}/signup`, {
            username,
            password,
            role: 'admin'
        })

        const signInRes = await axios.post(`${BACKEND_URL}/signin`, {
            username,
            password
        })

        expect(signInRes.status).toBe(200)
        expect(signInRes.data.token).tobeDefined()
    })

    test('SignIn failed if the username and password are incorrect', async() => {
        const username = `prashant-${Math.random()}`;
        const password = '12345678';

        await axios.post(`${BACKEND_URL}/signup`, {
            username,
            password,
            role: 'admin'
        })

        const signInResWrongPassword = await axios.post(`${BACKEND_URL}/signin`, {
            username,
            password: "234",
        })

        const signInResWrongUsername = await axios.post(`${BACKEND_URL}/signin`, {
            username: '1123',
            password,
        })

        expect(signInResWrongPassword.status).toBe(403)
        expect(signInResWrongUsername.status).toBe(403)
    })
});

describe("User information endpoints", () => {
    let userToken = "";
    let adminToken = "";
    let avatarId = "";
    let adminAvatarId = "";
    let userAvatarId = "";
    let adminId;
    let userId;

    beforeAll(async() => {
        const username = `Prashant-${Math.random()}`;
        const UserUsername = `Prashant-${Math.random()}`;
        const password = '12345678';

        await axios.post(`${BACKEND_URL}/signup`, {
            username,
            password,
            role: 'admin'
        })

        const adminRes = await axios.post(`${BACKEND_URL}/signin`, {
            username,
            password
        })

        await axios.post(`${BACKEND_URL}/signup`, {
            username: UserUsername,
            password,
            role: 'user'
        })

        const userRes = await axios.post(`${BACKEND_URL}/signin`, {
            username: UserUsername,
            password
        })
        
        adminToken = adminRes.data.token
        userToken = userRes.data.token
        adminId = adminRes.data.userId
        userId = userRes.data.userId

        const avatarRes = await axios.post(`${BACKEND_URL}/admin/avatar`, {
            imageUrl: "https://image.com/avatar.png",
            name: "Bird",
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        avatarId = avatarRes.data.avatarId
    })

    test("user can get all the available avatars", async() => {
        const res = await axios.get(`${BACKEND_URL}/avatars`)

        expect(res.status).tobe(200)
        expect(res.data.avatars.length).toBeGreaterThan(0)
        const currentAvatar = res.data.avatars.find(x => x.id===avatarId);
        expect(currentAvatar).tobeDefined();
    })

    test("user can't update their metaData with a wrong avatarId", async() => {
        const res = await axios.post(`${BACKEND_URL}/user/metadata`, {
            avatarId: "123rwerw"
        })

        expect(res.status).toBe(400)
    })

    test("user can update their metaData with the right avatarId", async() => {
        const userRes = await axios.post(`${BACKEND_URL}/user/metadata`, {
            avatarId,
            userId: userId
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const adminRes = await axios.post(`${BACKEND_URL}/user/metadata`, {
            avatarId,
            userId: adminId
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(userRes.status).toBe(200)
        expect(adminRes.status).toBe(200)
        
        if(userRes.status === 200){
            userAvatarId = avatarId
        }
        if(adminRes.status === 200){
            adminAvatarId = avatarId
        }
    })

    test("user can't update their metaData if auth header is empty", async() => {
        const res = await axios.post(`${BACKEND_URL}/user/metadata`, {
            avatarId
        })

        expect(res.status).toBe(403)
    })

    test("get Back avatar information for a user", async() => {
        const res = await axios.get(`${BACKEND_URL}/user/metadata/bulk?ids=[${userAvatarId},${adminAvatarId}]`);

        expect(res.status).tobe(200)
        expect(res.data.avatars.length).toBeGreaterThan(2)
        expect(res.data.avatars[0].userId).tobe(userId)
        expect(res.data.avatars[1].userId).tobe(adminId)
    })
});

describe("Space endpoints", () => {
    let userToken;
    let adminToken;
    let adminId;
    let userId;
    let mapId;
    let elem1Id;
    let elem2Id;
    let spaceId;

    beforeAll(async() => {
        const username = `Prashant-${Math.random()}`;
        const UserUsername = `Prashant-${Math.random()}`;
        const password = '12345678';

        await axios.post(`${BACKEND_URL}/signup`, {
            username,
            password,
            role: 'admin'
        })

        const adminRes = await axios.post(`${BACKEND_URL}/signin`, {
            username,
            password
        })

        await axios.post(`${BACKEND_URL}/signup`, {
            username: UserUsername,
            password,
            role: 'user'
        })

        const userRes = await axios.post(`${BACKEND_URL}/signin`, {
            username: UserUsername,
            password
        })
        
        adminToken = adminRes.data.token
        userToken = userRes.data.token
        adminId = adminRes.data.userId
        userId = userRes.data.userId

        const elem1Res = await axios.post(`${BACKEND_URL}/admin/element`, {
            name: `chair-1`,
            width: 2,
            height: 2,
            static: false,
            imageUrl: "https://image.com/chair.png"
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const elem2Res = await axios.post(`${BACKEND_URL}/admin/element`, {
            name: `table-1`,
            width: 5,
            height: 5,
            static: true,
            imageUrl: "https://image.com/chair.png"
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        elem1Id = elem1Res.data.id
        elem2Id = elem2Res.data.id

        const mapRes = await axios.post(`${BACKEND_URL}/admin/map`, {
            name: `map-${Math.random()}`,
            thumbnail: "https://image.com/thumbnail.png",
            dimensions: "100x200",
            "defaultElements": [{
                elementId: elem1Id,
                x: 20,
                y: 20,
            }, {
                elementId: elem1Id,
                x: 25,
                y: 25,
            }, {
                elementId: elem2Id,
                x: 30,
                y: 30,
            }]
        })

        mapId = mapRes.data.id
    })

    test("a user can create a space", async() => {

        const res = await axios.post(`${BACKEND_URL}/space`, {
            name: `space-${Math.random()}`,
            dimensions: "100x200",
            mapId
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        spaceId = res.data.id
        expect(res.status).tobe(200);
        expect(res.data.id).tobeDefined();
    })

    test("user is able to create a space without mapId (empty space)", async() => {

        const res = await axios.post(`${BACKEND_URL}/space`, {
            name: `space-${Math.random()}`,
            dimensions: "100x200",
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).tobe(200);
        expect(res.data.id).tobeDefined();
    })

    test("user is not able to create a space without mapId and dimensions", async() => {

        const res = await axios.post(`${BACKEND_URL}/space`, {
            name: `space-${Math.random()}`,
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).tobe(400);
    })

    test("user should not be able to delete a space which dosent exist", async() => {
        const res = await axios.delete(`${BACKEND_URL}/space/randomDoesntexist`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).tobe(400);
    })

    test("user should be able to delete a space which exist", async() => {
        const res = await axios.delete(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).tobe(200);
    })

    test("user should not be able to delete a space created by another user", async() => {
        const deleteSpaceRes = await axios.delete(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(deleteSpaceRes.status).toBe(403)
    })

    test("get my existing spaces", async() => {
        const userSpacesRes = await axios.get(`${BACKEND_URL}/space/all`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const adminSpacesRes = await axios.get(`${BACKEND_URL}/space/all`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(userSpacesRes.status).tobe(200);
        expect(adminSpacesRes.status).tobe(200);
        expect(adminSpacesRes.data.spaces.length).not.toBe(0);
        expect(userSpacesRes.data.spaces.length).toBe(0);
    })

    test("get my existing spaces", async() => {
        const userSpacesRes = await axios.get(`${BACKEND_URL}/space/all`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const adminSpacesRes = await axios.get(`${BACKEND_URL}/space/all`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(userSpacesRes.status).tobe(200);
        expect(adminSpacesRes.status).tobe(200);
        expect(adminSpacesRes.data.spaces.length).not.toBe(0);
        const filteredSpace = adminSpacesRes.data.spaceId.find(x => x.id === spaceId)
        expect(filteredSpace).tobeDefined();
        expect(userSpacesRes.data.spaces.length).toBe(0);
    })
})

describe("Arena endpoints", () => {

})