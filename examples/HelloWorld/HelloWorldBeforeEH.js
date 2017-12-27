// 
// Hello World Event Handler
// 
// Press "Start Block" button to Deploy Globally.
// Test by clicking "Publish" in "Test Payload" section.
// 
export default request => {
    // Override your original message!
    return request.ok({ hello : "world" })
}