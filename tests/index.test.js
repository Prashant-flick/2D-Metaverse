const axios2 = require("axios");
const WebSocket = require("ws");

const BACKEND_URL = "http://localhost:3000/api/v1";
const WS_URL = "ws://localhost:3001"

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res
        } catch (error) {
            return error.response
        }
    },
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args)
            return res
        } catch (error) {
            return error.response
        }
    },
    put: async (...args) => {
        try {
            const res = await axios2.put(...args)
            return res
        } catch (error) {
            return error.response
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args)
            return res
        } catch (error) {
            return error.response
        }
    },
}

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
        expect(signInRes.data.token).toBeDefined()
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

        avatarId = avatarRes.data.id
    })

    test("user can get all the available avatars", async() => {
        const res = await axios.get(`${BACKEND_URL}/avatars`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(res.status).toBe(200)
        expect(res.data.avatars.length).toBeGreaterThan(0)
        const currentAvatar = res.data.avatars.find(x => x.id===avatarId);
        expect(currentAvatar).toBeDefined();
    })

    test("user can't update their metaData with a wrong avatarId", async() => {
        const res = await axios.post(`${BACKEND_URL}/user/metadata`, {
            avatarId: "123rwerw"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
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
        
        userAvatarId = avatarId
        adminAvatarId = avatarId
    })

    test("user can't update their metaData if auth header is empty", async() => {
        const res = await axios.post(`${BACKEND_URL}/user/metadata`, {
            avatarId
        })

        expect(res.status).toBe(403)
    })

    test("get Back avatar information for a user", async() => {
        const res = await axios.get(`${BACKEND_URL}/user/metadata/bulk?ids=[${userId},${adminId}]`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        expect(res.status).toBe(200)
        expect(res.data.avatars.length).toBe(2)
        expect(res.data.avatars[0].userId).toBe(userId)
        expect(res.data.avatars[1].userId).toBe(adminId)
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
    let adminSpaceId1;
    let adminSpaceId2;

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
            defaultElements: [{
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
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        mapId = mapRes.data.id
    })

    test("a user can create a space only using mapId", async() => {        
        const res = await axios.post(`${BACKEND_URL}/space`, {
            name: `space-${Math.random()}`,
            mapId
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        adminSpaceId1 = res.data.id
        expect(res.status).toBe(200);
        expect(res.data.id).toBeDefined();
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

        expect(res.status).toBe(200);
        expect(res.data.id).toBeDefined();

        adminSpaceId2 = res.data.id
    })

    test("user is not able to create a space without mapId and dimensions", async() => {

        const res = await axios.post(`${BACKEND_URL}/space`, {
            name: `space-${Math.random()}`,
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).toBe(400);
    })

    test("user should not be able to delete a space which dosent exist", async() => {
        const res = await axios.delete(`${BACKEND_URL}/space/randomDoesntexist`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).toBe(400);
    })

    test("user should not be able to delete a space created by another user", async() => {
        const deleteSpaceRes = await axios.delete(`${BACKEND_URL}/space/${adminSpaceId1}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(deleteSpaceRes.status).toBe(403)
    })

    test("user should be able to delete a space which exist", async() => {
        const res = await axios.delete(`${BACKEND_URL}/space/${adminSpaceId1}`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        
        expect(res.status).toBe(200);
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

        expect(userSpacesRes.status).toBe(200);
        expect(adminSpacesRes.status).toBe(200);
        expect(adminSpacesRes.data.spaces.length).toBe(1);
        expect(userSpacesRes.data.spaces.length).toBe(0);
        const filteredSpace = adminSpacesRes.data.spaces.find(x => x.id === adminSpaceId2)
        expect(filteredSpace).toBeDefined();
    })
})

describe("Arena endpoints", () => {
    let userToken;
    let adminToken;
    let adminId;
    let userId;
    let mapId;
    let elem1Id;
    let elem2Id;
    let spaceId;
    let arenaElem1;

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
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        mapId = mapRes.data.id

        const spaceRes = await axios.post(`${BACKEND_URL}/space`, {
            name: `space-${Math.random()}`,
            dimensions: "100x200",
            mapId
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        spaceId = spaceRes.data.id
    })

    test("can't get back a space with invalid space id", async() => {
        const res = await axios.get(`${BACKEND_URL}/space/incorrectSpaceId`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).toBe(400);
    })

    test("user can join/enter/get a space", async() => {
        const res = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        arenaElem1 = res.data.elements[0].id;
        expect(res.status).toBe(200);
        expect(res.data.dimensions).toBe("100x200");
        expect(res.data.elements.length).toBe(3);
    })

    test("user should be able to delete an element", async() => {
        const res = await axios.delete(`${BACKEND_URL}/space/element/${arenaElem1}`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });

        expect(res.status).toBe(200);

        const newRes = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(newRes.status).toBe(200);
        expect(newRes.data.elements.length).toBe(2);
    })

    test("User should not be able to delete an element with wrong elementid", async() => {
        const res1 = await axios.delete(`${BACKEND_URL}/space/element/elemnet12432`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res1.status).toBe(400);
    })

    test("user can add an element to a space", async() => {
        const res = await axios.post(`${BACKEND_URL}/space/element`, {
            elementId: elem1Id,
            spaceId,
            x: 12,
            y: 15,
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).toBe(200);
        expect(res.data.id).toBeDefined;

        const newRes = await axios.get(`${BACKEND_URL}/space/${spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        expect(newRes.status).toBe(200);
        expect(newRes.data.elements.length).toBe(3);
    })

    test("user can not add an element to a space with wrong dimensions", async() => {
        const res = await axios.post(`${BACKEND_URL}/space/element`, {
            elementId: elem1Id,
            spaceId,
            x: 30000,
            y: 40000,
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).toBe(400);
    })

    test("user can see all the available elements which can be added to the arena", async() => {
        const res = await axios.get(`${BACKEND_URL}/elements`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(res.status).toBe(200);
        expect(res.data.elements.lenght).not.toBe(0);
    })
})

describe("Admin endpoints", () => {
    let userToken;
    let adminToken;
    let adminId;
    let userId;
    let elemId;

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
    })

    test("only admin should be able to create an element", async()=> {
        const res = await axios.post(`${BACKEND_URL}/admin/element`, {
            name: "chair1",
            width: 10,
            height: 10,
            static: false,
            imageUrl: "https://image.com/chair3.png",
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const newRes = await axios.post(`${BACKEND_URL}/admin/element`, {
            name: "chair1",
            width: 10,
            height: 10,
            static: false,
            imageUrl: "https://image.com/chair3.png",
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(newRes.status).toBe(403);

        elemId = res.data.id

        expect(res.status).toBe(200);
        expect(res.data.id).toBeDefined();
    })

    test("only admin should be able to update an element", async()=>{
        const res = await axios.put(`${BACKEND_URL}/admin/element/${elemId}`, {
            "imageUrl": "https://image.com/chair4.png",
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const newRes = await axios.put(`${BACKEND_URL}/admin/element/${elemId}`, {
            "imageUrl": "https://image.com/chair5.png",
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(res.status).toBe(200);
        expect(newRes.status).toBe(403);
    })

    test("only admin should be able to create an avatar", async()=>{
        const res = await axios.post(`${BACKEND_URL}/admin/avatar`, {
            imageUrl: "https://image.com/avatar1.png",
            name: "bird"
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const newRes = await axios.post(`${BACKEND_URL}/admin/avatar`, {
            imageUrl: "https://image.com/avatar1.png",
            name: "bird"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(res.status).toBe(200);
        expect(res.data.id).toBeDefined();
        expect(newRes.status).toBe(403);
    })

    test("only admin should be able to create a map", async()=> {
        const res = await axios.post(`${BACKEND_URL}/admin/map`, {
            name: "map1",
            dimensions: "100x200",
            thumbnail: "https://image.com/chair3.png",
            defaultElements: []
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const newRes = await axios.post(`${BACKEND_URL}/admin/map`, {
            name: "map2",
            dimensions: "100x200",
            thumbnail: "https://image.com/chair3.png",
            defaultElements: []
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(newRes.status).toBe(403);
        expect(res.status).toBe(200);
        expect(res.data.id).toBeDefined();
    })
})

describe("Websocket endPoints", () => {
    let userToken;
    let adminToken;
    let adminId;
    let userId;
    let mapId;
    let elem1Id;
    let elem2Id;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages = [];
    let ws2Messages = [];
    let userX;
    let adminX;
    let userY;
    let adminY;

    function waitForAndPopLatestMessage(messageArray) {        
        return new Promise(r => {
            if(messageArray.length>0){
                r(messageArray.shift());
            } else {
                let interval = setInterval(() => {
                    if(messageArray.length>0){
                        r(messageArray.shift());
                        clearInterval(interval);
                    }
                }, 100)
            }
        })
    }

    async function setUpHttp(){
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
    }

    async function setUpWs(){
        ws1 = new WebSocket(WS_URL);

        await new Promise(r => {
            ws1.onopen = r
        })

        ws1.onmessage = (event) => {
            ws1Messages.push(JSON.parse(event.data))
        }

        ws2 = new WebSocket(WS_URL);

        await new Promise(r => {
            ws2.onopen = r
        })

        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data))
        }
    }

    beforeAll( async() => {
        await setUpHttp();
        await setUpWs();
    })

    test("get back Ack for joining the space", async() => {
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))

        const message1 = await waitForAndPopLatestMessage(ws1Messages);
        
        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))

        const message2 = await waitForAndPopLatestMessage(ws2Messages);
        
        const message3 = await waitForAndPopLatestMessage(ws1Messages);

        expect(message1.type).toBe("space-joined");
        expect(message2.type).toBe("space-joined");
        expect(message1.payload.users.length + message2.payload.users.length).toBe(1);
        expect(message3.type).toBe("user-joined");
        expect(message3.payload.x).toBe(message2.payload.spawn.x)
        expect(message3.payload.y).toBe(message2.payload.spawn.y)
        expect(message3.payload.userId).toBe(userId)

        adminX = message1.payload.spawn.x
        adminY = message1.payload.spawn.y
        userX = message2.payload.spawn.x
        userY = message2.payload.spawn.y
    })

    test("user should not be able to move across the boundary of the wall", async() => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: 1000000,
                y: 200000,
            }
        }))

        const message = await waitForAndPopLatestMessage(ws1Messages);
        
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })

    test("user should not be able to move 2 blocks at the same time", async() => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX+2,
                y: adminY,
            }
        }))

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })

    test("Correct movement should be broadcasted to the other users in the room", async() => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX+1,
                y: adminY,
                userId: adminId
            }
        }))

        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("move");
        expect(message.payload.x).toBe(adminX+1);
        expect(message.payload.y).toBe(adminY);
    })

    test("If a user leaves, the other users receives a leave event", async() => {
        ws1.close();

        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left");
        expect(message.payload.userId).toBe(adminId);
    })

})