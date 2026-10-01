import axios from 'axios'

// Use HTTP for local development, HTTPS for production
const api = process.env.REACT_APP_API_URL || 'http://localhost:5050'

export const uploadfileusingurl = async (url) =>{
    try {
        console.log(url)
        await axios.post(`${api}/api/test/storage/upload-via-url` , {url:url} )
        return "success"
    } catch (error) {
        return error
    }
}

export const signUpApi = async (user) =>{
    try {
        console.log("Signing up user:", user.email);
        const res = await axios.post(`${api}/api/auth/signup`, user);
        console.log("Sign up response:", res);
        
        if (res.status === 200) {
            localStorage.setItem('user', JSON.stringify(res.data));
        }
        
        return res;
    } catch (error) {
        console.error("Sign up error:", error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Error response:", error.response.data);
            return error.response;
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Error request:", error.request);
            return { error: { message: "No response from server" } };
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error message:", error.message);
            return { error: { message: error.message } };
        }
    }
}

export const signInApi = async (user) =>{
    try {
        console.log("Signing in user:", user.email);
        const res = await axios.post(`${api}/api/auth/signin`, user);
        console.log("Sign in response:", res);
        
        if (res.status === 200) {
            localStorage.setItem('user', JSON.stringify(res.data));
        }
        
        return res;
    } catch (error) {
        console.error("Sign in error:", error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Error response:", error.response.data);
            return error.response;
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Error request:", error.request);
            return { error: { message: "No response from server" } };
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error message:", error.message);
            return { error: { message: error.message } };
        }
    }
}

export const googleSignInApi = async (idToken) => {
    try {
        console.log("Google sign in with token");
        const res = await axios.post(`${api}/api/auth/google-signin`, { idToken });
        console.log("Google sign in response:", res);
        
        if (res.status === 200) {
            localStorage.setItem('user', JSON.stringify(res.data));
        }
        
        return res;
    } catch (error) {
        console.error("Google sign in error:", error);
        if (error.response) {
            console.error("Error response:", error.response.data);
            return error.response;
        } else if (error.request) {
            console.error("Error request:", error.request);
            return { error: { message: "No response from server" } };
        } else {
            console.error("Error message:", error.message);
            return { error: { message: error.message } };
        }
    }
}

export const getSignedUrlApi = async(file) =>{
    try {
        const res = await axios.post(`${api}/api/test/storage/get-signed-url` , {file:file})
        return res.data.url
    } catch (error) {
        return error
    }
}

export const getTranscriptApi = async(file) =>{
    try {
        let address = "gs://video-call-transcript/" +file
        const res = await axios.post(`${api}/api/test/video/transcript` , {file:address})
        return res.data.response.annotationResults
    } catch (error) {
        return error
    }
}

export const getCurrentUserApi = async() =>{
    try {
        const res = await axios.post(`${api}/api/auth/currentuser`)
        console.log(res.data)
        return res.data
    } catch (error) {
        return error
    }
}

export const signOutUser = async() =>{
    try {
        await axios.post(`${api}/api/auth/signout`)
    } catch (error) {
        return error
    }
}

// firestore

export const getContactList = async()=>{
    try {
        const res = await axios.get(`${api}/api/firestore/getuserlist`)
        return res.data
    } catch (error) {
        return error
    }
}

export const addContactFirestore = async(contact)=>{
    try {
        const res = await axios.post(`${api}/api/firestore/add-user` , contact)
        return res.data
    } catch (error) {
        return error
    }
}
