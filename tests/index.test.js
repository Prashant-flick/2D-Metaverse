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
})