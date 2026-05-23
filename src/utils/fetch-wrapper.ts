// TO DO: bikin fetch wrapper
// karena backend ngirim response json untuk status code error 
// (selain 2xx)
// buat fetch wrapper throw error untuk !response.ok (status code 400 - 599)
// jadinya tiap pemanggilan fungsi api di lib akan diwrap dg try catch block